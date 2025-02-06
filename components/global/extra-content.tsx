import { Button } from "@/components/ui/button";
import type { Chain, TransactionReceipt } from "viem";
import { generateBlockExplorerLink } from "@/lib/utils";

export const createExtraContent = (
  receipt: TransactionReceipt,
  hypercertId?: string,
  chain?: Chain,
) => {
  const receiptButton = receipt && (
    <>
      <a
        href={generateBlockExplorerLink(chain, receipt.transactionHash)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button size="default" variant={"secondary"}>
          View transaction
        </Button>
      </a>
    </>
  );

  const hypercertButton = hypercertId && (
    <>
      <a
        href={`/hypercerts/${hypercertId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button size="default" variant={"default"}>
          View hypercert
        </Button>
      </a>
    </>
  );

  return (
    <div className="flex flex-col space-y-2">
      <p className="text-sm font-medium">
        Your hypercert has been minted successfully!
      </p>
      <div className="flex space-x-4">
        {receiptButton}
        {hypercertButton}
      </div>
    </div>
  );
};
