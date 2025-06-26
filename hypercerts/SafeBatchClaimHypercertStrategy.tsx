import { Chain } from "viem";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateSafeAppLink } from "@/lib/utils";

import {
  ClaimHypercertStrategy,
  ClaimHypercertParams,
} from "./ClaimHypercertStrategy";

function DialogFooter({
  chain,
  safeAddress,
}: {
  chain: Chain;
  safeAddress: string;
}) {
  return (
    <div className="flex flex-col space-y-2">
      <p className="text-lg font-medium">Success</p>
      <p className="text-sm font-medium">
        We&apos;ve submitted the transaction requests to the connected Safe.
      </p>
      <div className="flex space-x-4 py-4 justify-center">
        {chain && (
          <Button asChild>
            <a
              href={generateSafeAppLink(chain, safeAddress as `0x${string}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Safe <ExternalLink size={14} className="ml-2" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export class SafeBatchClaimHypercertStrategy extends ClaimHypercertStrategy {
  async execute(params: ClaimHypercertParams[]): Promise<void> {
    console.log("[SafeBatchClaim] Starting execution with params:", params);
    const { setDialogStep, setSteps, setOpen, setTitle, setExtraContent } =
      this.dialogContext;

    if (!this.client) {
      console.error("[SafeBatchClaim] No client found");
      setOpen(false);
      throw new Error("No client found");
    }

    console.log("[SafeBatchClaim] Setting up dialog UI");
    setOpen(true);
    setTitle("Claim fractions from Allowlist");
    setSteps([
      { id: "preparing", description: "Preparing to claim fractions..." },
      { id: "submitting", description: "Submitting to Safe..." },
      { id: "queued", description: "Transaction queued in Safe" },
    ]);

    await setDialogStep("preparing", "active");
    console.log("[SafeBatchClaim] Preparation step completed");

    try {
      console.log("[SafeBatchClaim] Starting submission to Safe");
      await setDialogStep("submitting", "active");
      const mappedParams = mapClaimParams(params);
      console.log("[SafeBatchClaim] Mapped params:", mappedParams);

      await this.client.batchClaimFractionsFromAllowlists({
        ...mappedParams,
        overrides: {
          safeAddress: this.address as `0x${string}`,
        },
      });

      console.log("[SafeBatchClaim] Successfully queued transaction in Safe");
      await setDialogStep("queued", "completed");

      setExtraContent(() => (
        <DialogFooter chain={this.chain} safeAddress={this.address} />
      ));
    } catch (error) {
      console.error("[SafeBatchClaim] Error during execution:", error);
      await setDialogStep(
        "submitting",
        "error",
        error instanceof Error ? error.message : "Unknown error",
      );
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
