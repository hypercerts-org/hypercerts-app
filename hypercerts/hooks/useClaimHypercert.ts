import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useClaimHypercertStrategy } from "./useClaimHypercertStrategy";

interface ClaimHypercertParams {
  tokenId: bigint;
  units: bigint;
  proof: `0x${string}`[];
}

export const useClaimHypercert = () => {
  const getStrategy = useClaimHypercertStrategy();

  return useMutation({
    mutationKey: ["CLAIM_HYPERCERT"],
    onError: (e: Error) => {
      console.error(e);
      toast({
        title: "Error",
        description: e.message,
        duration: 5000,
      });
    },
    mutationFn: async (params: ClaimHypercertParams) => {
      return getStrategy().execute(params);
    },
  });
};
