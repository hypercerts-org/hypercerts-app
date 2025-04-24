"use client";

import { AllowListRecord } from "@/allowlists/actions/getAllowListRecordsForAddressByClaimed";
import { Button } from "../ui/button";
import { useAccount, useSwitchChain } from "wagmi";
import { useState } from "react";
import { getAddress, Hex, ByteArray } from "viem";
import { errorToast } from "@/lib/errorToast";
import { ChainFactory } from "@/lib/chainFactory";
import { useClaimHypercertStrategy } from "@/hypercerts/hooks/useClaimHypercertStrategy";
import { useAccountStore } from "@/lib/account-store";

interface TransformedClaimData {
  hypercertTokenIds: bigint[];
  units: bigint[];
  proofs: (Hex | ByteArray)[][];
  roots?: (Hex | ByteArray)[];
}

function transformAllowListRecords(
  records: AllowListRecord[],
): TransformedClaimData {
  return {
    hypercertTokenIds: records.map((record) => BigInt(record.token_id!)),
    units: records.map((record) => BigInt(record.units!)),
    proofs: records.map((record) => record.proof as (Hex | ByteArray)[]),
    roots: records.map((record) => record.root as Hex | ByteArray),
  };
}

export default function UnclaimedHypercertBatchClaimButton({
  allowListRecords,
  selectedChainId,
}: {
  allowListRecords: AllowListRecord[];
  selectedChainId: number | null;
}) {
  const account = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { switchChain } = useSwitchChain();
  const getStrategy = useClaimHypercertStrategy();
  const { selectedAccount } = useAccountStore();

  const selectedChain = selectedChainId
    ? ChainFactory.getChain(selectedChainId)
    : null;

  const claimHypercert = async () => {
    setIsLoading(true);
    try {
      const claimData = transformAllowListRecords(allowListRecords);
      const params = claimData.hypercertTokenIds.map((tokenId, index) => ({
        tokenId,
        units: claimData.units[index],
        proof: claimData.proofs[index] as `0x${string}`[],
      }));
      await getStrategy(params).execute(params);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeAddress = selectedAccount?.address || account.address;
  const isBatchClaimDisabled =
    isLoading ||
    !allowListRecords.length ||
    !activeAddress ||
    activeAddress !== getAddress(allowListRecords[0].user_address as string);

  return (
    <>
      {account.chainId === selectedChainId ? (
        <Button
          variant={"default"}
          size={"sm"}
          onClick={claimHypercert}
          disabled={isBatchClaimDisabled}
        >
          Claim Selected
        </Button>
      ) : (
        <Button
          variant={"outline"}
          size="sm"
          disabled={!account.isConnected || !selectedChainId}
          onClick={() => {
            if (!selectedChainId) return errorToast("Fraction is not selected");
            switchChain({ chainId: selectedChainId });
          }}
        >
          {selectedChainId
            ? `Switch to ${selectedChain?.name}`
            : "Select fraction"}
        </Button>
      )}
    </>
  );
}
