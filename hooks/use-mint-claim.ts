"use client";
import { useState } from "react";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { usePublicClient } from "wagmi";
import {
  type HypercertMetadata,
  TransferRestrictions,
} from "@hypercerts-org/sdk";
import { type StepData } from "@/hooks/useProcessDialog";
import { TransactionReceipt } from "viem";

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
    mintSteps[0].id
  );

  const { client } = useHypercertClient();
  const publicClient = usePublicClient();

  const initializeWrite = async (
    metaData: HypercertMetadata,
    units: number,
    transferRestrictions: TransferRestrictions
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

      const hash = await client.mintClaim(
        metaData,
        BigInt(units),
        transferRestrictions
      );

      if (!hash) {
        // toast("No tx hash returned", {
        //   type: "error",
        // });
        console.error("No tx hash returned");
        return;
      }

      setCurrentStep("confirming");
      const receipt = await publicClient?.waitForTransactionReceipt({
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
      units: number,
      transferRestrictions: TransferRestrictions = TransferRestrictions.FromCreatorOnly
    ) => {
      console.log("Minting hypercert");
      await initializeWrite(metaData, units, transferRestrictions);
    },
    txPending,
    mintSteps,
    currentStep,
    readOnly: !client || client.readOnly,
  };
};
