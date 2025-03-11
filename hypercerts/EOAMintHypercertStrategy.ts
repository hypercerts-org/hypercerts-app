import { track } from "@vercel/analytics";
import { waitForTransactionReceipt } from "viem/actions";

import { createExtraContent } from "@/components/global/extra-content";
import { generateHypercertIdFromReceipt } from "@/lib/generateHypercertIdFromReceipt";
import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";

import {
  MintHypercertParams,
  MintHypercertStrategy,
} from "./MintHypercertStrategy";
import { Address, Chain } from "viem";
import { HypercertClient } from "@hypercerts-org/sdk";
import { UseWalletClientReturnType } from "wagmi";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { useQueueMintBlueprint } from "@/blueprints/hooks/queueMintBlueprint";

export class EOAMintHypercertStrategy extends MintHypercertStrategy {
  constructor(
    protected address: Address,
    protected chain: Chain,
    protected client: HypercertClient,
    protected dialogContext: ReturnType<typeof useStepProcessDialogContext>,
    protected queueMintBlueprint: ReturnType<typeof useQueueMintBlueprint>,
    protected walletClient: UseWalletClientReturnType,
  ) {
    super(address, chain, client, dialogContext, walletClient);
  }

  // FIXME: this is a long ass method. Break it down into smaller ones.
  async execute({
    metaData,
    units,
    transferRestrictions,
    allowlistRecords,
    blueprintId,
  }: MintHypercertParams) {
    const { setDialogStep, setSteps, setOpen, setTitle, setExtraContent } =
      this.dialogContext;
    const { mutateAsync: queueMintBlueprint } = this.queueMintBlueprint;
    const { data: walletClient } = this.walletClient;

    if (!this.client) {
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
      hash = await this.client.mintHypercert({
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
      hypercertId = generateHypercertIdFromReceipt(receipt, this.chain.id);
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
      chain: this.chain,
    });
    setExtraContent(extraContent);

    await setDialogStep("done", "completed");

    await revalidatePathServerAction([
      "/collections",
      "/collections/edit/[collectionId]",
      `/profile/${this.address}`,
      { path: `/`, type: "layout" },
    ]);
  }
}
