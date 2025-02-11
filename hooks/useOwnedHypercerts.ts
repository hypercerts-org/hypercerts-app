import { useQuery } from "@tanstack/react-query";
import { HypercertListFragment } from "@/hypercerts/fragments/hypercert-list.fragment";

interface OwnedResponse {
  data: HypercertListFragment[];
  count: number;
}

export function useOwnedHypercerts(address: string) {
  return useQuery({
    queryKey: ["hypercerts-owned", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${address}/owned`);
      const data: OwnedResponse = await response.json();
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
