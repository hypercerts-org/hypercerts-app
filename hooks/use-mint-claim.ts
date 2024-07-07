"use client";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { type StepData } from "@/hooks/use-process-dialog";
import {
  TransferRestrictions,
  type HypercertMetadata,
  AllowlistEntry,
} from "@hypercerts-org/sdk";
import { useState } from "react";
import { TransactionReceipt } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useWalletClient } from "wagmi";

export const mintSteps: StepData[] = [
  {
    id: "preparing",
    description: "Preparing to mint hypercert...",
  },
  {
    id: "minting",
    description: "Minting hypercert on-chain...",
  },
  {
    id: "confirming",
    description: "Awaiting confirmation...",
  },
  {
    id: "done",
    description: "Minting complete!",
  },
];

export const useMintClaim = ({
  onComplete,
}: {
  onComplete?: (receipt: TransactionReceipt) => void;
}) => {
  const [txPending, setTxPending] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepData["id"]>(
    mintSteps[0].id,
  );

  const { client } = useHypercertClient();
  const { data: walletClient } = useWalletClient();

  const initializeWrite = async (
    metaData: HypercertMetadata,
    units: bigint,
    transferRestrictions: TransferRestrictions,
    allowlistRecords?: AllowlistEntry[] | string,
  ) => {
    setCurrentStep("minting");
    try {
      setTxPending(true);

      if (!client) {
        // toast("No client found", {
        //   type: "error",
        // });
        console.error("No client found");
        return;
      }

      const hash = await client.mintHypercert({
        metaData,
        totalUnits: units,
        transferRestriction: transferRestrictions,
        allowList: allowlistRecords,
      });

      if (!hash) {
        // toast("No tx hash returned", {
        //   type: "error",
        // });
        console.error("No tx hash returned");
        return;
      }

      setCurrentStep("confirming");
      const receipt = await waitForTransactionReceipt(walletClient!, {
        confirmations: 3,
        hash,
      });

      if (receipt?.status === "reverted") {
        // toast("Minting failed", {
        //   type: "error",
        // });
        console.error("Minting failed");
        console.error(receipt);
      }
      if (receipt?.status === "success") {
        // toast(mintInteractionLabels.toastSuccess, { type: "success" });
        console.log("Minting succeeded");

        setCurrentStep("done");
        onComplete?.(receipt);
      }
    } catch (error) {
      // toast(parseError(error, mintInteractionLabels.toastError), {
      //   type: "error",
      // });
      console.error(error);
    } finally {
      // hideModal();
      setTxPending(false);
    }
  };

  return {
    write: async (
      metaData: HypercertMetadata,
      units: bigint,
      transferRestrictions: TransferRestrictions = TransferRestrictions.FromCreatorOnly,
      allowlistRecords?: AllowlistEntry[] | string,
    ) => {
      console.log("Minting hypercert");
      await initializeWrite(
        metaData,
        units,
        transferRestrictions,
        allowlistRecords,
      );
    },
    txPending,
    mintSteps,
    currentStep,
    readOnly: !client || client.readOnly,
  };
};
