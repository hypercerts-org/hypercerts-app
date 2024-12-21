"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Drawer } from "vaul";
import { EvaluateDrawer } from "./evaluate-drawer";
import { TrustedAttestor } from "@/github/types/trusted-attestor.type";
import { isChainIdSupported } from "@/lib/isChainIdSupported";
import { useAccount } from "wagmi";

export default function EvaluateButton({
  hypercertId,
}: {
  hypercertId: string;
}) {
  const { isConnected, address } = useAccount();
  const [evaluator, setEvaluator] = useState<TrustedAttestor>();
  const { chainId } = useAccount();

  useEffect(() => {
    if (address) {
      fetch(`/api/evaluators/${address}`)
        .then((res) => res.json())
        .catch(() => {
          console.error(`Failed to fetch evaluator for address: ${address}`);
          return null;
        })
        .then((data) => {
          setEvaluator(data);
        });
    }
  }, [address]);

  const getTooltipMessage = () => {
    if (!isConnected) {
      return "Connect your wallet to access this feature.";
    }

    if (!isChainIdSupported(chainId)) {
      return "Evaulations are only available on supported chains.";
    }

    return "Evaluation is only available to the group of trusted evaluators at this time.";
  };

  const enabled = address && evaluator && isChainIdSupported(chainId);

  if (enabled) {
    return (
      <Drawer.Root direction="right">
        <Drawer.Trigger asChild>
          <div>
            <Button>Evaluate this Hypercert</Button>
          </div>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-full w-[500px] mt-24 fixed bottom-0 right-0">
            <div className="p-4 bg-white flex-1 h-full">
              <div className="max-w-md mx-auto flex flex-col gap-5">
                <EvaluateDrawer hypercertId={hypercertId} />
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
            <Button disabled={true}>Evaluate</Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>{getTooltipMessage()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
