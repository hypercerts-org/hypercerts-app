import {
  MintHypercertStrategy,
  MintHypercertParams,
} from "./MintHypercertStrategy";

import { Button } from "@/components/ui/button";
import { generateSafeAppLink } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { Chain } from "viem";

export class SafeMintHypercertStrategy extends MintHypercertStrategy {
  async execute({
    metaData,
    units,
    transferRestrictions,
    allowlistRecords,
  }: MintHypercertParams) {
    const { setDialogStep, setSteps, setOpen, setTitle, setExtraContent } =
      this.dialogContext;

    if (!this.client) {
      setOpen(false);
      throw new Error("No client found");
    }

    setOpen(true);
    setTitle("Minting hypercert");
    setSteps([
      { id: "preparing", description: "Preparing to mint hypercert..." },
      { id: "submitting", description: "Submitting to Safe..." },
      { id: "queued", description: "Transaction queued in Safe" },
    ]);

    await setDialogStep("preparing", "active");

    try {
      await setDialogStep("submitting", "active");
      await this.client.mintHypercert({
        metaData,
        totalUnits: units,
        transferRestriction: transferRestrictions,
        allowList: allowlistRecords,
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
