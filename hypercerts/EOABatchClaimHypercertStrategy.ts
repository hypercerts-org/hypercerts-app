import { waitForTransactionReceipt } from "viem/actions";

import { createExtraContent } from "@/components/global/extra-content";
import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";

import {
  ClaimHypercertStrategy,
  ClaimHypercertParams,
} from "./ClaimHypercertStrategy";

export class EOABatchClaimHypercertStrategy extends ClaimHypercertStrategy {
  async execute(params: ClaimHypercertParams[]): Promise<void> {
    const { setDialogStep, setSteps, setOpen, setTitle, setExtraContent } =
      this.dialogContext;
    const { data: walletClient } = this.walletClient;

    if (!this.client) throw new Error("No client found");
    if (!walletClient) throw new Error("No wallet client found");

    setOpen(true);
    setSteps([
      { id: "preparing", description: "Preparing to claim fractions..." },
      { id: "claiming", description: "Claiming fractions on-chain..." },
      { id: "confirming", description: "Waiting for on-chain confirmation" },
      { id: "done", description: "Claiming complete!" },
    ]);
    setTitle("Claim fractions from Allowlist");

    try {
      await setDialogStep("preparing", "active");
      await setDialogStep("claiming", "active");

      const tx = await this.client.batchClaimFractionsFromAllowlists(
        mapClaimParams(params),
      );
      if (!tx) {
        await setDialogStep("claiming", "error");
        throw new Error("Failed to claim fractions");
      }

      await setDialogStep("confirming", "active");
      const receipt = await waitForTransactionReceipt(walletClient, {
        hash: tx,
      });

      if (receipt.status === "success") {
        await setDialogStep("done", "completed");
        const extraContent = createExtraContent({
          receipt,
          chain: this.chain,
        });
        setExtraContent(extraContent);

        const hypercertViewInvalidationPaths = params.map((param) => {
          return `/hypercerts/${param.tokenId}`;
        });

        // Revalidate all relevant paths
        await revalidatePathServerAction([
          `/profile/${this.address}`,
          `/profile/${this.address}?tab`,
          `/profile/${this.address}?tab=hypercerts-claimable`,
          `/profile/${this.address}?tab=hypercerts-owned`,
          ...hypercertViewInvalidationPaths,
        ]);

        // Wait 5 seconds before refreshing and navigating
        setTimeout(() => {
          this.router.refresh();
          this.router.push(`/profile/${this.address}?tab=hypercerts-claimable`);
        }, 5000);
      } else if (receipt.status === "reverted") {
        await setDialogStep("confirming", "error", "Transaction reverted");
      }
    } catch (error) {
      console.error("Claim error:", error);
      await setDialogStep("claiming", "error", "Transaction failed");
      throw error;
    }
  }
}

function mapClaimParams(params: ClaimHypercertParams[]) {
  return {
    hypercertTokenIds: params.map((p) => p.tokenId),
    units: params.map((p) => p.units),
    proofs: params.map((p) => p.proof),
  };
}
