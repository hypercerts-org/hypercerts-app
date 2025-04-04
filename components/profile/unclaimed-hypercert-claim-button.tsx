"use client";

import { AllowListRecord } from "@/allowlists/actions/getAllowListRecordsForAddressByClaimed";
import { Button } from "../ui/button";
import { useAccount, useSwitchChain } from "wagmi";
import { Row } from "@tanstack/react-table";
import { useState } from "react";
import { useAccountStore } from "@/lib/account-store";
import { useClaimHypercert } from "@/hypercerts/hooks/useClaimHypercert";

interface UnclaimedHypercertClaimButtonProps {
  allowListRecord: Row<AllowListRecord>;
}

export default function UnclaimedHypercertClaimButton({
  allowListRecord,
}: UnclaimedHypercertClaimButtonProps) {
  const { address, chain: currentChain } = useAccount();
  const { selectedAccount } = useAccountStore();
  const [isLoading, setIsLoading] = useState(false);
  const { switchChain } = useSwitchChain();
  const selectedHypercert = allowListRecord.original;
  const hypercertChainId = selectedHypercert?.hypercert_id?.split("-")[0];
  const activeAddress = selectedAccount?.address || (address as `0x${string}`);
  const { mutateAsync: claimHypercert } = useClaimHypercert();

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      if (
        !selectedHypercert.token_id ||
        !selectedHypercert.units ||
        !selectedHypercert.proof
      ) {
        throw new Error("Invalid allow list record");
      }

      await claimHypercert([
        {
          tokenId: BigInt(selectedHypercert.token_id),
          units: BigInt(selectedHypercert.units),
          proof: selectedHypercert.proof as `0x${string}`[],
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={
        hypercertChainId === currentChain?.id?.toString()
          ? "default"
          : "outline"
      }
      size={"sm"}
      onClick={() => {
        if (hypercertChainId === currentChain?.id?.toString()) {
          handleClaim();
        } else {
          switchChain({
            chainId: Number(hypercertChainId),
          });
        }
      }}
      disabled={selectedHypercert?.user_address !== activeAddress || isLoading}
    >
      {hypercertChainId === activeAddress && !currentChain?.id?.toString()
        ? "Switch chain"
        : "Claim"}
    </Button>
  );
}
