import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { toast } from "@/components/ui/use-toast";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { generateHypercertIdFromReceipt } from "@/lib/generateHypercertIdFromReceipt";
import {
  AllowlistEntry,
  HypercertMetadata,
  TransferRestrictions,
} from "@hypercerts-org/sdk";
import { useMutation } from "@tanstack/react-query";
import { waitForTransactionReceipt } from "viem/actions";
import { useAccount, useWalletClient } from "wagmi";
import { useQueueMintBlueprint } from "@/blueprints/hooks/queueMintBlueprint";
import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";
import { track } from "@vercel/analytics";
import { createExtraContent } from "@/components/global/extra-content";

export const useMintHypercert = () => {
  const { client } = useHypercertClient();
  const { data: walletClient } = useWalletClient();
  const { chain, address } = useAccount();
  const { setDialogStep, setSteps, setOpen, setTitle, setExtraContent } =
    useStepProcessDialogContext();
  const { mutateAsync: queueMintBlueprint } = useQueueMintBlueprint();

  return useMutation({
    mutationKey: ["MINT_HYPERCERT"],
    onError: async (e) => {
      console.error(e);
      await setDialogStep("minting", "error", e.message);
      toast({
        title: "Error",
        description: e.message,
        duration: 5000,
      });
    },
    onSuccess: async (hash) => {
      await setDialogStep("confirming", "active");
      console.log("Mint submitted", {
        hash,
      });
      track("Mint submitted", {
        hash,
      });
      let receipt;

      try {
        receipt = await waitForTransactionReceipt(walletClient!, {
          confirmations: 3,
          hash,
        });
        console.log({ receipt });
      } catch (error: unknown) {
        console.error("Error waiting for transaction receipt:", error);
        await setDialogStep(
          "confirming",
          "error",
          error instanceof Error ? error.message : "Unknown error",
        );
        throw new Error(
          `Failed to confirm transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      if (receipt?.status === "reverted") {
        throw new Error("Transaction reverted: Minting failed");
      }

      await setDialogStep("route", "active");

      let hypercertId;
      try {
        hypercertId = generateHypercertIdFromReceipt(receipt, chain?.id!);
        console.log("Mint completed", {
          hypercertId: hypercertId || "not found",
        });
        track("Mint completed", {
          hypercertId: hypercertId || "not found",
        });
        console.log({ hypercertId });
      } catch (error) {
        console.error("Error generating hypercert ID:", error);
        await setDialogStep(
          "route",
          "error",
          error instanceof Error ? error.message : "Unknown error",
        );
      }

      const extraContent = createExtraContent({
        receipt,
        hypercertId,
        chain: chain!,
      });
      setExtraContent(extraContent);

      await setDialogStep("done", "completed");

      await revalidatePathServerAction([
        "/collections",
        "/collections/edit/[collectionId]",
        `/profile/${address}`,
        { path: `/`, type: "layout" },
      ]);
      return { hypercertId, receipt, chain };
    },
    mutationFn: async ({
      metaData,
      units,
      transferRestrictions,
      allowlistRecords,
      blueprintId,
    }: {
      metaData: HypercertMetadata;
      units: bigint;
      transferRestrictions: TransferRestrictions;
      allowlistRecords?: AllowlistEntry[] | string;
      blueprintId?: number;
    }) => {
      if (!client) {
        setOpen(false);
        throw new Error("No client found");
      }

      const isBlueprint = !!blueprintId;
      setOpen(true);
      setSteps([
        { id: "preparing", description: "Preparing to mint hypercert..." },
        { id: "minting", description: "Minting hypercert on-chain..." },
        ...(isBlueprint
          ? [{ id: "blueprint", description: "Queueing blueprint mint..." }]
          : []),
        { id: "confirming", description: "Waiting for on-chain confirmation" },
        { id: "route", description: "Creating your new hypercert's link..." },
        { id: "done", description: "Minting complete!" },
      ]);
      setTitle("Minting hypercert");
      await setDialogStep("preparing", "active");
      console.log("preparing...");

      let hash;
      try {
        await setDialogStep("minting", "active");
        console.log("minting...");
        hash = await client.mintHypercert({
          metaData,
          totalUnits: units,
          transferRestriction: transferRestrictions,
          allowList: allowlistRecords,
        });
      } catch (error: unknown) {
        console.error("Error minting hypercert:", error);
        throw new Error(
          `Failed to mint hypercert: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      if (!hash) {
        throw new Error("No transaction hash returned");
      }

      if (blueprintId) {
        try {
          await setDialogStep("blueprint", "active");
          await queueMintBlueprint({
            blueprintId,
            txHash: hash,
          });
        } catch (error: unknown) {
          console.error("Error queueing blueprint mint:", error);
          throw new Error(
            `Failed to queue blueprint mint: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      return hash;
    },
  });
};
