import { useMutation } from "@tanstack/react-query";

import { toast } from "@/components/ui/use-toast";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";

import { MintHypercertParams } from "../MintHypercertStrategy";

import { useMintHypercertStrategy } from "./useMintHypercertStrategy";

export const useMintHypercert = () => {
  const { setDialogStep } = useStepProcessDialogContext();
  const getStrategy = useMintHypercertStrategy();

  return useMutation({
    mutationKey: ["MINT_HYPERCERT"],
    onError: async (e) => {
      console.error(e);
      await setDialogStep("minting", "error", e.message);
      toast({
        title: "Error",
        description: e.message,
        duration: 5000,
      });
    },
    mutationFn: async (params: MintHypercertParams) => {
      const strategy = getStrategy(params.blueprintId);
      return strategy.execute(params);
    },
  });
};
