"use client";

import { useEffect, useRef, useState } from "react";
import useIsWriteable from "@/hooks/useIsWriteable";
import { useMintHypercert } from "@/hypercerts/hooks/useMintHypercert";
import { useLocalStorage } from "react-use";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import {
  formatHypercertData,
  HypercertMetadata,
  TransferRestrictions,
} from "@hypercerts-org/sdk";
import { DEFAULT_NUM_FRACTIONS } from "@/configs/hypercerts";
import { Form } from "@/components/ui/form";
import FormSteps from "@/components/hypercert/hypercert-minting-form/form-steps";
import HypercertCard from "@/components/hypercert/hypercert-card";
import { formatDate } from "@/lib/utils";
import { z } from "zod";
import { isAddress } from "viem";
import { useCreateBlueprint } from "@/blueprints/hooks/createBlueprint";

const formSchema = z.object({
  blueprint_minter_address: z.string().refine((data) => isAddress(data), {
    message: "Invalid address",
  }),
  title: z
    .string()
    .trim()
    .min(1, "We need a title for your hypercert")
    .max(100, "Max 100 characters"),
  logo: z.string().url("Logo URL is not valid"),
  banner: z.string().url("Banner URL is not valid"),
  description: z
    .string()
    .trim()
    .min(10, { message: "We need a longer description for your hypercert" })
    .max(5000, "max 5000 characters"),
  link: z
    .string()
    .url("Please enter a valid link")
    .optional()
    .or(z.literal("")),
  cardImage: z.string().url("Card image could not be generated"),
  tags: z
    .array(z.string())
    .min(1, "We need at least one tag")
    .max(20, "Maximum 20 tags allowed")
    .refine(
      (data) => data.every((tag) => tag.trim() !== "" && tag.length <= 50),
      {
        message:
          "Please ensure all tags are filled in and no longer than 50 characters",
      },
    ),
  projectDates: z
    .object(
      {
        from: z.date({ coerce: true }).refine((date) => date !== null, {
          message: "Please enter a start date",
        }),
        to: z.date({ coerce: true }).refine((date) => date !== null, {
          message: "Please enter an end date",
        }),
      },
      {
        required_error: "Please select a date range",
      },
    )
    .refine((data) => data.from && data.to && data.from <= data.to, {
      path: ["projectDates"],
      message: "From date must be before to date",
    }),
  contributors: z
    .array(z.string())
    .refine(
      (data) => data.filter((contributor) => contributor !== "").length > 0,
      {
        message: "We need at least one contributor",
      },
    )
    .refine((data) => data.every((contributor) => contributor.length <= 50), {
      message: "Each contributor must be 50 characters or less",
    }),
  acceptTerms: z.boolean().refine((data) => data, {
    message: "You must accept the terms and conditions",
  }),
  confirmContributorsPermission: z.boolean().refine((data) => data, {
    message: "You must confirm that all contributors gave their permission",
  }),
  allowlistEntries: z
    .array(z.object({ address: z.string(), units: z.bigint() }))
    .optional(),
  allowlistURL: z
    .string()
    .trim()
    .refine((input) => input && !input?.endsWith("/"), {
      message: "URI cannot end with a trailing slash",
    })
    .optional()
    .or(z.literal("")),
});

export type HypercertFormValues = z.infer<typeof formSchema>;
export type HyperCertFormKeys = keyof HypercertFormValues;

const formDefaultValues: HypercertFormValues = {
  blueprint_minter_address: "" as `0x${string}`,
  title: "",
  banner: "",
  description: "",
  logo: "",
  link: "",
  cardImage: "",
  tags: [],
  projectDates: {
    from: new Date(),
    to: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  contributors: [],
  acceptTerms: false,
  confirmContributorsPermission: false,
  allowlistURL: "",
};

const getDefaultFormValues = (value: string): HypercertFormValues => {
  const parsedValue = JSON.parse(value);

  return {
    ...parsedValue,
    projectDates: {
      from: new Date(parsedValue.projectDates.from),
      to: new Date(parsedValue.projectDates.to),
    },
  };
};

export function HypercertMintingForm({
  isBlueprint,
  presetValues,
  blueprintId,
}: {
  isBlueprint?: boolean;
  presetValues?: HypercertFormValues;
  blueprintId?: number;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState("en-US");
  const {
    writeable,
    errors: writeableErrors,
    resetErrors: resetWriteableErrors,
  } = useIsWriteable();

  const { mutateAsync: mintHypercert } = useMintHypercert();
  const { mutateAsync: createBlueprint } = useCreateBlueprint();
  const [value, setValue] = useLocalStorage<HypercertFormValues>(
    "user-hypercert-create-form-data",
    formDefaultValues,
    {
      raw: false,
      serializer: JSON.stringify,
      deserializer: getDefaultFormValues,
    },
  );

  const formSchemaUsed = isBlueprint
    ? formSchema
    : formSchema.omit({
        blueprint_minter_address: true,
      });

  const form = useForm<HypercertFormValues>({
    resolver: zodResolver(formSchemaUsed),
    defaultValues: presetValues ?? value,
    mode: "onBlur",
  });

  const watchedValues = useWatch({
    control: form.control,
    name: ["title", "banner", "logo", "tags", "projectDates"],
  });

  const cardPreviewData = {
    title: watchedValues[0] ?? formDefaultValues.title,
    banner: watchedValues[1] ?? formDefaultValues.banner,
    logo: watchedValues[2] ?? formDefaultValues.logo,
    tags: watchedValues[3] ?? formDefaultValues.tags,
    projectDates: watchedValues[4] ?? formDefaultValues.projectDates,
  };
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLanguage(window.navigator.language);
  }, []);

  const onBlur = () => {
    console.log("blur");
    setValue(form.getValues());
  };

  const onReset = () => {
    setValue(formDefaultValues);
    form.reset(formDefaultValues);
    setCurrentStep(1);
  };

  async function onSubmit(values: HypercertFormValues) {
    if (!isBlueprint) {
      const errors = Object.entries(writeableErrors).filter(
        ([_, error]) => error !== "",
      );
      if (errors.length > 0) {
        errors.forEach(([category, error]) => {
          toast({
            title: "Cannot start mint...",
            variant: "destructive",
            description: `${category}: ${error}`,
          });
        });
        return;
      }
    }

    const metadata: HypercertMetadata = {
      name: values.title,
      description: values.description,
      image: values.cardImage,
      external_url: values.link,
    };

    const formattedMetadata = formatHypercertData({
      ...metadata,
      version: "2.0",
      properties: [],
      impactScope: ["all"],
      excludedImpactScope: [],
      workScope: values.tags,
      excludedWorkScope: [],
      rights: ["Public Display"],
      excludedRights: [],
      workTimeframeStart: values.projectDates?.from?.getTime?.() / 1000,
      workTimeframeEnd: values.projectDates?.to?.getTime?.() / 1000,
      impactTimeframeStart: values.projectDates?.from?.getTime?.() / 1000,
      impactTimeframeEnd: values.projectDates?.to?.getTime?.() / 1000,
      contributors: values.contributors ?? [],
    });

    if (!formattedMetadata.valid) {
      console.error("Invalid metadata", { errors: formattedMetadata.errors });
      return;
    }

    // if (writeableErrors) {
    //   Object.values(writeableErrors).forEach((error) => {
    //     if (error) {
    //       toast({
    //         variant: "destructive",
    //         title: "Sorry! We can't start the mint...",
    //         description: error,
    //       });
    //     }
    //   });
    //   if (!writeable) {
    //     resetWriteableErrors();
    //     return;
    //   }
    // }
    if (!isBlueprint) {
      await mintHypercert({
        metaData: formattedMetadata.data!,
        units: DEFAULT_NUM_FRACTIONS,
        transferRestrictions: TransferRestrictions.FromCreatorOnly,
        blueprintId,
        allowlistRecords:
          values.allowlistURL ||
          values.allowlistEntries?.map((entry) => ({
            ...entry,
            units: BigInt(entry.units),
          })),
      });
    } else {
      const { blueprint_minter_address, ...formValues } = values;
      await createBlueprint({
        formValues,
        minterAddress: blueprint_minter_address,
      });
    }
  }

  const onSubmitInvalid = (errors: FieldErrors) => {
    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        const error = errors[key];
        if (error?.message) {
          toast({
            title: "Oops! Something went wrong",
            description: error.message.toString(),
            variant: "destructive",
          });
        }
      }
    }
  };

  // if (writeableErrors) {
  //   Object.values(writeableErrors).forEach((error) => {
  //     if (error) {
  //       toast({
  //         variant: "destructive",
  //         title: "Sorry! We can't start the mint...",
  //         description: error,
  //       });
  //     }
  //   });
  //   if (!writeable) {
  //     resetWriteableErrors();
  //     return;
  //   }
  // }

  return (
    <section className="flex flex-col-reverse lg:flex-row space-x-4 items-stretch md:justify-start">
      <section className="flex flex-col space-y-4 flex-1 md:pr-5 md:border-r-[1.5px] md:border-slate-200">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onSubmitInvalid)}
            onBlur={onBlur}
          >
            <FormSteps
              form={form}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              cardRef={cardRef}
              reset={onReset}
              isBlueprint={isBlueprint}
            />
          </form>
        </Form>
      </section>
      <div className="flex flex-col p-6 items-center">
        <HypercertCard
          name={cardPreviewData.title}
          banner={cardPreviewData.banner}
          logo={cardPreviewData.logo}
          scopes={cardPreviewData.tags}
          fromDateDisplay={
            form.getValues().projectDates?.from
              ? formatDate(
                  form.getValues().projectDates.from.toISOString(),
                  language,
                )
              : ""
          }
          toDateDisplay={
            form.getValues().projectDates?.to
              ? formatDate(
                  form.getValues().projectDates.to.toISOString(),
                  language,
                )
              : ""
          }
          ref={cardRef}
        />
      </div>
    </section>
  );
}
