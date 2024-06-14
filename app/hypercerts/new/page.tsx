"use client";

import StepProcessDialog from "@/components/global/step-process-dialog";
import HypercertCard from "@/components/hypercert/hypercert-card";
import { Form } from "@/components/ui/form";
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TransactionReceipt } from "viem";
import { z } from "zod";
import FormSteps from "./form-steps";

const DEFAULT_NUM_FRACTIONS: number = 10000;
const DEFAULT_HYPERCERT_VERSION: string = "0.0.1";

const formSchema = z.object({
  title: z.string().trim().min(1, "We need a title for your hypercert"),
  logo: z.string().url("Logo URL is not valid"),
  banner: z.string().url("Banner URL is not valid"),
  description: z
    .string()
    .trim()
    .min(10, { message: "We need a longer description for your hypercert" }),
  link: z.string().url("Link URL is not valid"),
  cardImage: z.string().url("Card image not generated"),
  tags: z
    .array(z.string())
    .refine((data) => data.filter((tag) => tag !== "").length > 0, {
      message: "We need at least one tag",
    }),
  projectDates: z
    .object(
      {
        from: z.date(),
        to: z.date(),
      },
      {
        required_error: "Please select a date range",
      },
    )
    .refine((data) => data.from <= data.to, {
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
  acceptTerms: z.boolean().refine((data) => data === true, {
    message: "You must accept the terms and conditions",
  }),
  confirmContributorsPermission: z.boolean().refine((data) => data === true, {
    message: "You must confirm that all contributors gave their permission",
  }),
  allowlistURL: z.union([z.string().url(), z.literal(""), z.null().optional()]),
  //   percentDistribution: z.number().nullable(),
  //   mergeDistribution: z.boolean().nullable(),
});

export type HypercertFormValues = z.infer<typeof formSchema>;

const formDefaultValues: HypercertFormValues = {
  title: "A Grave Matter",
  banner:
    "https://www.bungie.net/common/destiny2_content/icons/2f1a39b33e30b98402b2badaa13f8631.jpg",
  description: "Complete the 'Ghosts of the Deep' Dungeon solo, flawlessly.",
  logo: "https://www.bungie.net/common/destiny2_content/icons/cb01f3cbfd11000b1d19537e73922f55.jpg",
  link: "https://destinyemblemcollector.com/emblem?id=2069797998",
  cardImage: "",
  tags: ["ghosts,deep,legend,skeleton,skeleton-king,grave,helion,skald"],
  projectDates: {
    from: new Date(),
    to: new Date(),
  },
  contributors: ["0x123, 0xlos, peter.eth"],
  acceptTerms: false,
  confirmContributorsPermission: false,
  allowlistURL: "",
  // percentDistribution: null,
  // mergeDistribution: null,
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
      allowList: values.allowlistURL ?? undefined,
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
      workTimeframeStart: values.projectDates.from.getTime() / 1000,
      workTimeframeEnd: values.projectDates.to.getTime() / 1000,
      impactTimeframeStart: values.projectDates.from.getTime() / 1000,
      impactTimeframeEnd: values.projectDates.to.getTime() / 1000,
      contributors: values.contributors,
    });

    if (!formattedMetadata.valid) {
      console.log("Invalid metadata", { errors: formattedMetadata.errors });
      return;
    }

    console.log({ formattedMetadata });

    await mintClaim(
      formattedMetadata.data!,
      DEFAULT_NUM_FRACTIONS,
      TransferRestrictions.FromCreatorOnly,
    );

    form.reset();
    setCurrentStep(1);
  }

  return (
    <main className="flex flex-col px-8 pt-4 pb-20 container max-w-screen-lg">
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full">
        New hypercert
      </h1>
      <div className="p-3"></div>
      <section className="flex space-x-4 items-stretch md:justify-start">
        <section className="flex flex-col space-y-4 flex-1 md:pr-5 md:border-r-[1.5px] md:border-slate-200">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormSteps
                form={form}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
              />
            </form>
          </Form>
        </section>
        <div className="hidden md:flex flex-col p-6 items-center">
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
          />
        </div>
      </section>
      {mintStep !== "preparing" && (
        <StepProcessDialog
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
      )}
    </main>
  );
}
