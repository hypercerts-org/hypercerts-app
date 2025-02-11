import { useQuery } from "@tanstack/react-query";
import { HypercertListFragment } from "@/hypercerts/fragments/hypercert-list.fragment";

interface CreatedResponse {
  data: HypercertListFragment[];
  count: number;
}

export function useCreatedHypercerts(address: string) {
  return useQuery({
    queryKey: ["hypercerts-created", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${address}/created`);
      const data: CreatedResponse = await response.json();
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
