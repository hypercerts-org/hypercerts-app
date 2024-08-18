"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { StepProcessDialogProvider } from "@/components/global/step-process-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { type HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { useState } from "react";
import { useAccount } from "wagmi";
import ListDialog from "./list-dialog";

import { isChainIdSupported } from "@/lib/isChainIdSupported";

export function ListForSaleButton({ hypercert }: { hypercert: HypercertFull }) {
  const { isConnected, address, chainId } = useAccount();
  const { client } = useHypercertClient();

  const [isOpen, setIsOpen] = useState(false);

  const hypercertId = hypercert.hypercert_id;
  const fractions = hypercert.fractions?.data || [];
  const fractionsOwnedByUser = fractions.filter(
    (fraction) => fraction.owner_address === address,
  );

  const disabled =
    !hypercert ||
    !hypercertId ||
    !client ||
    !client.isClaimOrFractionOnConnectedChain(hypercertId) ||
    !fractionsOwnedByUser.length;

  const getToolTipMessage = () => {
    if (!hypercert || !hypercertId) return;

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
