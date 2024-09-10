"use client";

import FormSteps from "@/app/hypercerts/new/form-steps";
import HypercertCard from "@/components/hypercert/hypercert-card";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { DEFAULT_NUM_FRACTIONS } from "@/configs/hypercerts";
import { useMintHypercert } from "@/hypercerts/hooks/useMintHypercert";
import useIsWriteable from "@/hooks/useIsWriteable";
import { formatDate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatHypercertData,
  HypercertMetadata,
  TransferRestrictions,
} from "@hypercerts-org/sdk";
import { useEffect, useRef, useMemo, useState } from "react";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useLocalStorage } from "react-use";

const formSchema = z.object({
  title: z.string().trim().min(1, "We need a title for your hypercert"),
  logo: z.string().url("Logo URL is not valid"),
  banner: z.string().url("Banner URL is not valid"),
  description: z
    .string()
    .trim()
    .min(10, { message: "We need a longer description for your hypercert" }),
  link: z
    .string()
    .url("Please enter a valid link")
    .optional()
    .or(z.literal("")),
  cardImage: z.string().url("Card image could not be generated"),
  tags: z
    .array(z.string())
    .refine((data) => data.filter((tag) => tag !== "").length > 0, {
      message: "We need at least one tag",
    }),
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
    ),
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

export default function NewHypercertForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState("en-US");
  const {
    writeable,
    errors: writeableErrors,
    resetErrors: resetWriteableErrors,
  } = useIsWriteable();

  const { mutateAsync: mintHypercert } = useMintHypercert();
  const [value, setValue] = useLocalStorage<HypercertFormValues>(
    "user-hypercert-create-form-data",
    formDefaultValues,
    {
      raw: false,
      serializer: JSON.stringify,
      deserializer: getDefaultFormValues,
    },
  );

  const form = useForm<HypercertFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const watchedValues = useWatch({
    control: form.control,
    name: ["title", "banner", "logo", "tags", "projectDates"],
  });

  console.log("storage: ", value);
  console.log("form: ", form.watch());

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
      workTimeframeStart: values.projectDates?.from?.getTime?.() / 1000 ?? null,
      workTimeframeEnd: values.projectDates?.to?.getTime?.() / 1000 ?? null,
      impactTimeframeStart:
        values.projectDates?.from?.getTime?.() / 1000 ?? null,
      impactTimeframeEnd: values.projectDates?.to?.getTime?.() / 1000 ?? null,
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

    await mintHypercert({
      metaData: formattedMetadata.data!,
      units: DEFAULT_NUM_FRACTIONS,
      transferRestrictions: TransferRestrictions.FromCreatorOnly,
      allowlistRecords:
        values.allowlistURL ||
        values.allowlistEntries?.map((entry) => ({
          ...entry,
          units: BigInt(entry.units),
        })),
    });
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

  return (
    <main className="flex flex-col p-8 md:px-24 pt-8 pb-24 space-y-4 flex-1 container max-w-screen-lg">
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full">
        New hypercert
      </h1>
      <div className="p-3"></div>
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
    </main>
  );
}
