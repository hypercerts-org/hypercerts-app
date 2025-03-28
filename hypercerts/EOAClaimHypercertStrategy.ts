import { waitForTransactionReceipt } from "viem/actions";

import { createExtraContent } from "@/components/global/extra-content";
import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";

import {
  ClaimHypercertStrategy,
  ClaimHypercertParams,
} from "./ClaimHypercertStrategy";

export class EOAClaimHypercertStrategy extends ClaimHypercertStrategy {
  async execute({ tokenId, units, proof }: ClaimHypercertParams) {
    const { setDialogStep, setSteps, setOpen, setTitle, setExtraContent } =
      this.dialogContext;
    const { data: walletClient } = this.walletClient;

    if (!this.client) throw new Error("No client found");
    if (!walletClient) throw new Error("No wallet client found");

    setOpen(true);
    setSteps([
      { id: "preparing", description: "Preparing to claim fraction..." },
      { id: "claiming", description: "Claiming fraction on-chain..." },
      { id: "confirming", description: "Waiting for on-chain confirmation" },
      { id: "route", description: "Creating your new fraction's link..." },
      { id: "done", description: "Claiming complete!" },
    ]);
    setTitle("Claim fraction from Allowlist");

    try {
      await setDialogStep("claiming", "active");
      const tx = await this.client.mintClaimFractionFromAllowlist(
        tokenId,
        units,
        proof,
        undefined,
      );

      if (!tx) throw new Error("Failed to claim fraction");

      await setDialogStep("confirming", "active");
      const receipt = await waitForTransactionReceipt(walletClient, {
        hash: tx,
      });

      if (receipt.status === "success") {
        await setDialogStep("route", "active");
        const extraContent = createExtraContent({
          receipt,
          hypercertId: `${this.chain.id}-${tokenId}`,
          chain: this.chain,
        });
        setExtraContent(extraContent);
        await setDialogStep("done", "completed");

        await revalidatePathServerAction([
          `/hypercerts/${this.chain.id}-${tokenId}`,
          `/profile/${this.address}?tab=hypercerts-claimable`,
          `/profile/${this.address}?tab=hypercerts-owned`,
        ]);
      } else {
        await setDialogStep("confirming", "error", "Transaction reverted");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
