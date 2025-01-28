import { LoaderCircle, ArrowUpRight } from "lucide-react";
import { generateBlockExplorerLink } from "@/lib/utils";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useEffect } from "react";
import { Hash } from "viem";

type TransactionStatusProps = {
  txHash: Hash | undefined;
  onCompleted: () => void;
};

export const TransactionStatus = ({
  txHash,
  onCompleted,
}: TransactionStatusProps) => {
  const { chain } = useAccount();
  const { data: receipt, isPending } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: chain?.id,
  });

  useEffect(() => {
    if (receipt) {
      onCompleted();
    }
  }, [receipt, onCompleted]);

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-md w-full">
      <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider mb-2">
        Transaction Status
      </h5>
      {isPending && (
        <div className="flex items-center text-sm mb-2">
          <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
          <span>Transaction is pending...</span>
        </div>
      )}
      {receipt && receipt?.status === "success" && (
        <p className="text-green-600 text-sm font-medium mb-2">
          Transaction successful!
        </p>
      )}
      {receipt && receipt?.status === "reverted" && (
        <p className="text-red-600 text-sm font-medium mb-2">
          Transaction failed.
        </p>
      )}
      <a
        href={generateBlockExplorerLink(chain, txHash as `0x${string}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline text-sm flex items-center"
      >
        View on block explorer
        <ArrowUpRight className="w-4 w-4 ml-1" />
      </a>
    </div>
  );
};
