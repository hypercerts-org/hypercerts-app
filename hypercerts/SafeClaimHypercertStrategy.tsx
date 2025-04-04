import { Chain } from "viem";
import { ExternalLink } from "lucide-react";
import assert from "assert";

import { Button } from "@/components/ui/button";
import { generateSafeAppLink } from "@/lib/utils";

import {
  ClaimHypercertStrategy,
  ClaimHypercertParams,
} from "./ClaimHypercertStrategy";

export class SafeClaimHypercertStrategy extends ClaimHypercertStrategy {
  async execute(params: ClaimHypercertParams[]) {
    assert(params.length === 1, "Only one claim params object allowed");

    const { tokenId, units, proof } = params[0];
    const { setDialogStep, setSteps, setOpen, setTitle, setExtraContent } =
      this.dialogContext;

    if (!this.client) {
      setOpen(false);
      throw new Error("No client found");
    }

    setOpen(true);
    setTitle("Claim fraction from Allowlist");
    setSteps([
      { id: "preparing", description: "Preparing to claim fraction..." },
      { id: "submitting", description: "Submitting to Safe..." },
      { id: "queued", description: "Transaction queued in Safe" },
    ]);

    await setDialogStep("preparing", "active");

    try {
      await setDialogStep("submitting", "active");
      await this.client.claimFractionFromAllowlist({
        hypercertTokenId: tokenId,
        units,
        proof,
        overrides: {
          safeAddress: this.address as `0x${string}`,
        },
      });

      await setDialogStep("queued", "completed");

      setExtraContent(() => (
        <DialogFooter chain={this.chain} safeAddress={this.address} />
      ));
    } catch (error) {
      console.error(error);
      await setDialogStep(
        "submitting",
        "error",
        error instanceof Error ? error.message : "Unknown error",
      );
      throw error;
    }
  }
}

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
        We&apos;ve submitted the claim request to the connected Safe.
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
