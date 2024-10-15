"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import { Button } from "@/components/ui/button";
import { Drawer } from "vaul";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { isChainIdSupported } from "@/lib/isChainIdSupported";
import { useAccount } from "wagmi";
import { TransferDrawer } from "@/components/hypercert/transfer-drawer";
import { ArrowUpRight, SendHorizonal } from "lucide-react";

export default function TransferButton({
  hypercert,
}: {
  hypercert: HypercertFull;
}) {
  const { isConnected, address } = useAccount();
  const { chainId } = useAccount();
  const owners = hypercert.fractions?.data?.map(
    (fraction) => fraction.owner_address,
  );

  const owner = owners?.find((owner) => owner === address);

  const getTooltipMessage = () => {
    if (!isConnected) {
      return "Connect your wallet to access this feature.";
    }

    if (!isChainIdSupported(chainId)) {
      return "Transfers are only available on supported chains.";
    }

    if (!owner) {
      return "You don't appear to own a fraction of this hypercert.";
    }

    return "Transfers are only available on supported chains.";
  };

  const enabled = address && owner && isChainIdSupported(chainId);

  if (enabled) {
    return (
      <Drawer.Root direction="right">
        <Drawer.Trigger asChild>
          <div>
            <SendHorizonal className="w-6 h-6 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200" />
          </div>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-full w-[500px] mt-24 fixed bottom-0 right-0">
            <div className="p-4 bg-white flex-1 h-full">
              <div className="max-w-md mx-auto flex flex-col gap-5">
                <TransferDrawer hypercert={hypercert} />
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
            <SendHorizonal className="w-6 h-6 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200 stroke-slate-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent>{getTooltipMessage()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
