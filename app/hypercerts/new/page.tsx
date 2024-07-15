"use client";

import FormSteps from "@/app/hypercerts/new/form-steps";
import StepProcessDialog from "@/components/global/step-process-dialog";
import HypercertCard from "@/components/hypercert/hypercert-card";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { mintSteps, useMintClaim } from "@/hooks/use-mint-claim";
import useProcessDialog, { StepData } from "@/hooks/use-process-dialog";
import { formatDate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HypercertMetadata,
  TransferRestrictions,
  formatHypercertData,
} from "@hypercerts-org/sdk";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { parseEther, TransactionReceipt } from "viem";
import { z } from "zod";
const DEFAULT_NUM_FRACTIONS = parseEther("1");

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
        from: z.date().refine((date) => date !== null, {
          message: "Please enter a start date",
        }),
        to: z.date().refine((date) => date !== null, {
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
  allowlistURL: z.string().optional(),
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

export default function NewHypercertForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState("en-US");
  const { dialogSteps, setStep } = useProcessDialog(mintSteps);
  const form = useForm<HypercertFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaultValues,
    mode: "onChange",
  });
  const cardRef = useRef<HTMLDivElement>(null);

  const [txReceipt, setTxReceipt] = useState<TransactionReceipt | null>(null);
  const onMintComplete = (receipt: TransactionReceipt) => {
    setTxReceipt(receipt);
  };

  const {
    write: mintClaim,
    txPending: mintClaimPending,
    currentStep: mintStep,
  } = useMintClaim({
    onComplete: onMintComplete,
  });

  useEffect(() => {
    setLanguage(window.navigator.language);
  }, []);

  useEffect(() => {
    setStep(mintStep as StepData["id"]);
  }, [mintStep]);

  async function onSubmit(values: HypercertFormValues) {
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

    await mintClaim(
      formattedMetadata.data!,
      DEFAULT_NUM_FRACTIONS,
      TransferRestrictions.FromCreatorOnly,
      values.allowlistURL ||
        values.allowlistEntries?.map((entry) => ({
          ...entry,
          units: BigInt(entry.units),
        })),
    );

    form.reset();
    setCurrentStep(1);
  }

  const onSubmitInvalid = (errors: FieldErrors) => {
    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        const error = errors[key];
        if (error?.message) {
          toast({
            title: "Error",
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
            <form onSubmit={form.handleSubmit(onSubmit, onSubmitInvalid)}>
              <FormSteps
                form={form}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                cardRef={cardRef}
              />
            </form>
          </Form>
        </section>
        <div className="flex flex-col p-6 items-center">
          <HypercertCard
            name={form.getValues().title || undefined}
            description={form.getValues().description || undefined}
            banner={form.getValues().banner || undefined}
            logo={form.getValues().logo || undefined}
            scopes={form.getValues().tags}
            fromDateDisplay={formatDate(
              form.getValues().projectDates?.from?.toISOString(),
              language,
            )}
            toDateDisplay={formatDate(
              form.getValues().projectDates?.to?.toISOString(),
              language,
            )}
            ref={cardRef}
          />
        </div>
      </section>
      <StepProcessDialog
        open={mintClaimPending}
        steps={dialogSteps}
        title="Mint your hypercert"
        triggerLabel="See progress"
        extraContent={
          txReceipt && (
            <Link
              href={`https://sepolia.etherscan.io/tx/${txReceipt.transactionHash}`}
              className="flex items-center underline underline-offset-2 hover:opacity-70 font-medium text-blue-700 tracking-tight group"
              target="_blank"
            >
              View transaction on etherscan
              <ArrowUpRightIcon
                size={16}
                className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
              />
            </Link>
          )
        }
      />
    </main>
  );
}
