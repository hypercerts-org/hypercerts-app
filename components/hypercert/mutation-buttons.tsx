"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlameIcon, MoreHorizontal, SendHorizontal, Split } from "lucide-react";
import type { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { Drawer } from "vaul";
import { TransferDrawer } from "@/components/hypercert/transfer-drawer";
import { BurnDrawer } from "@/components/hypercert/burn-drawer";
import { useAccount } from "wagmi";
import { isChainIdSupported } from "@/lib/isChainIdSupported";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SplitDrawer } from "@/components/hypercert/split-drawer";

type MutationButtonsProps = {
  hypercert: HypercertFull;
};

export default function MutationButtons({ hypercert }: MutationButtonsProps) {
  const [isTransferDrawerOpen, setIsTransferDrawerOpen] = useState(false);
  const [isBurnDrawerOpen, setIsBurnDrawerOpen] = useState(false);
  const [isSplitDrawerOpen, setIsSplitDrawerOpen] = useState(false);
  const { isConnected, address, chainId } = useAccount();

  const owners = hypercert.fractions?.data?.map(
    (fraction) => fraction.owner_address,
  );

  const owner = owners?.find((owner) => owner === address);
  const enabled = address && owner && isChainIdSupported(chainId);

  const handleTransferClick = () => {
    if (enabled) setIsTransferDrawerOpen(true);
  };

  const handleBurnClick = () => {
    if (enabled) setIsBurnDrawerOpen(true);
  };

  const handleSplitClick = () => {
    if (enabled) setIsSplitDrawerOpen(true);
  };

  const getTooltipMessage = () => {
    if (!isConnected) {
      return "Connect your wallet to access this feature.";
    }

    if (!isChainIdSupported(chainId)) {
      return "This action is only available on supported chains.";
    }

    if (!owner) {
      return "You don't appear to own a fraction of this hypercert.";
    }

    return "Click to perform this action.";
  };

  const renderButton = (
    Icon: typeof SendHorizontal | typeof FlameIcon,
    action: () => void,
  ) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div onClick={action}>
            <Icon
              className={`w-6 h-6 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200 ${
                enabled ? "cursor-pointer" : "stroke-slate-500"
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>{getTooltipMessage()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex flex-row items-center space-x-2 mt-2">
      <div className="hidden md:flex space-x-2">
        {renderButton(SendHorizontal, handleTransferClick)}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontal className="w-6 h-6" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleTransferClick} disabled={!enabled}>
            <SendHorizontal className="mr-2 w-6 h-6" /> Transfer
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleSplitClick} disabled={!enabled}>
            <Split className="mr-2 w-6 h-6" /> Split
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleBurnClick} disabled={!enabled}>
            <FlameIcon className="mr-2 w-6 h-6" /> Burn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Drawer.Root
        open={isTransferDrawerOpen}
        onOpenChange={setIsTransferDrawerOpen}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-white flex flex-col h-full w-[500px] mt-24 fixed bottom-0 right-0">
            <div className="p-4 bg-white flex-1 h-full max-w-md mx-auto flex flex-col gap-5">
              <TransferDrawer hypercert={hypercert} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <Drawer.Root open={isSplitDrawerOpen} onOpenChange={setIsSplitDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-white flex flex-col h-full w-[500px] mt-24 fixed bottom-0 right-0">
            <div className="p-4 bg-white flex-1 h-full max-w-md mx-auto flex flex-col gap-5">
              <SplitDrawer hypercert={hypercert} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <Drawer.Root open={isBurnDrawerOpen} onOpenChange={setIsBurnDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-white flex flex-col h-full w-[500px] mt-24 fixed bottom-0 right-0">
            <div className="p-4 bg-white flex-1 h-full max-w-md mx-auto flex flex-col gap-5">
              <BurnDrawer hypercert={hypercert} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
