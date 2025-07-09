"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import ListDialog from "./list-dialog";
import { StepProcessDialogProvider } from "../global/step-process-dialog";
import { useAccount, useReadContract } from "wagmi";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { type HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { useState } from "react";
import { getAddress } from "viem";

import { isChainIdSupported } from "@/lib/isChainIdSupported";
import { useReadTransferRestrictions } from "@/hooks/use-read-transfer-restrictions";
import { TransferRestrictions } from "@hypercerts-org/sdk";

export function ListForSaleButton({
  hypercert,
  disabledForChain = false,
}: {
  hypercert: HypercertFull;
  disabledForChain?: boolean;
}) {
  const { isConnected, address } = useAccount();
  const { client } = useHypercertClient();

  const hypercertId = hypercert.hypercert_id;
  const tokenId = hypercert.token_id ? BigInt(hypercert.token_id) : null;
  const { chain_id: chainId, contract_address: contractAddress } =
    hypercert.contract || {};

  const transferRestrictions = useReadTransferRestrictions(
    hypercert.hypercert_id || "",
  );

  const [isOpen, setIsOpen] = useState(false);

  if (disabledForChain) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button disabled>List for sale</Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            This feature is disabled on the connected chain.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const fractions = hypercert.fractions?.data || [];
  const fractionsOwnedByUser = fractions.filter(
    (fraction) => fraction.owner_address === address,
  );

  const disabled =
    !hypercertId ||
    !client ||
    !client.isClaimOrFractionOnConnectedChain(hypercertId) ||
    !fractionsOwnedByUser.length ||
    transferRestrictions === TransferRestrictions.DisallowAll ||
    (transferRestrictions === TransferRestrictions.FromCreatorOnly &&
      address?.toLowerCase() !== hypercert.creator_address?.toLowerCase());

  const getToolTipMessage = () => {
    if (!hypercertId) return;

    if (!isConnected || !address) {
      return "Connect your wallet to access this feature";
    }

    if (!isChainIdSupported(chainId)) {
      return "Please connect to a supported network";
    }

    if (!client) {
      return "Hypercert client is not connected";
    }

    if (!client.isClaimOrFractionOnConnectedChain(hypercertId)) {
      return "This hypercert is not on the connected chain";
    }

    if (!fractionsOwnedByUser.length) {
      return "You do not own any fractions of this hypercert";
    }

    if (transferRestrictions === TransferRestrictions.DisallowAll) {
      return "Secondary sales are not allowed for this hypercert";
    }

    if (transferRestrictions === TransferRestrictions.FromCreatorOnly) {
      return "Only the creator can sell this hypercert";
    }

    return null;
  };

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button disabled>List for sale</Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>{getToolTipMessage()}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>List for sale</Button>
      <StepProcessDialogProvider>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <ListDialog hypercert={hypercert} setIsOpen={setIsOpen} />
        </Dialog>
      </StepProcessDialogProvider>
    </>
  );
}
