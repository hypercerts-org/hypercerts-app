"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import { Button } from "@/components/ui/button";
import { Drawer } from "vaul";
import { isChainIdSupported } from "@/lib/isChainIdSupported";
import { useAccount } from "wagmi";
import { CreatorFeedDrawer } from "./creator-feed-drawer";
import { getAddress } from "viem";

export default function CreatorFeedButton({
  hypercertId,
  creatorAddress,
  disabledForChain = false,
}: {
  hypercertId: string;
  creatorAddress: string;
  disabledForChain?: boolean;
}) {
  const { isConnected, address } = useAccount();

  const { chainId } = useAccount();

  if (disabledForChain) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button disabled={true}>Submit Addtional Information</Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            This feature is disabled on the connected chain.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getTooltipMessage = () => {
    if (!isConnected) {
      return "Connect your wallet to access this feature.";
    }

    if (!isChainIdSupported(chainId)) {
      return "Creator Feeds are only available on supported chains.";
    }

    if (address !== getAddress(creatorAddress)) {
      return "Only the creator of this Hypercert can submit additional information.";
    }
  };

  const enabled =
    address &&
    isChainIdSupported(chainId) &&
    address === getAddress(creatorAddress);

  if (enabled) {
    return (
      <Drawer.Root direction="right">
        <Drawer.Trigger asChild>
          <div>
            <Button>Submit Addtional Information</Button>
          </div>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-full w-[500px] mt-24 fixed bottom-0 right-0">
            <div className="p-4 bg-white flex-1 h-full">
              <div className="max-w-md mx-auto flex flex-col gap-5">
                <CreatorFeedDrawer hypercertId={hypercertId} />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button disabled={true}>Submit Addtional Information</Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>{getTooltipMessage()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
