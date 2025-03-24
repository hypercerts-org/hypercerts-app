"use client";

import { useIsContract } from "@/hooks/useIsContract";

export function ContractAccountBanner({ address }: { address: string }) {
  const { isContract, isLoading } = useIsContract(address);

  if (!isContract || isLoading) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="text-sm text-yellow-700">
        This is a smart contract address. Contract ownership may vary across
        networks. Please verify ownership details for each network.
      </div>
    </div>
  );
}
