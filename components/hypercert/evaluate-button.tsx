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
import { HypercertFull } from "../../hypercerts/fragments/hypercert-full.fragment";
import { TrustedAttestor } from "../../github/types/trusted-attestor.type";
import { useAccount } from "wagmi";

export default function EvaluateButton({
  hypercert,
}: {
  hypercert: HypercertFull;
}) {
  const { address } = useAccount();
  const [evaluator, setEvaluator] = useState<TrustedAttestor>();

  useEffect(() => {
    if (address) {
      fetch(`/api/evaluators/${address}`)
        .then((res) => res.json())
        .then((data) => {
          setEvaluator(data);
        });
    }
  }, [address]);

  const enabled = address && evaluator;

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
                <EvaluateDrawer hypercert={hypercert} />
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
            <Button disabled={true}>Evaluate this Hypercert</Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Evaluation is only available to the group of trusted evaluators at
          this time.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
