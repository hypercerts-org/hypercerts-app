import { useQuery } from "@tanstack/react-query";
import { UnclaimedFraction } from "@/components/profile/unclaimed-hypercerts-list";

interface ClaimableResponse {
  data: UnclaimedFraction[];
  count: number;
}

export function useClaimableHypercerts(address: string) {
  return useQuery({
    queryKey: ["hypercerts-claimable", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${address}/claimable`);
      const data: ClaimableResponse = await response.json();
      return data;
    },
    refetchInterval: 30000,
  });
}
