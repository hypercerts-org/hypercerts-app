"use client";

import { useQuery } from "@tanstack/react-query";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { EmptySection } from "@/components/global/sections";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import { HypercertListFragment } from "@/hypercerts/fragments/hypercert-list.fragment";

export const CreatedContent = ({ address }: { address: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["created-hypercerts", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${address}/created`);
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) return <ExploreListSkeleton length={4} />;
  if (!data?.data) return <EmptySection />;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(16.875rem,_20rem))] gap-4 py-4">
      {data.data.map((hypercert: HypercertListFragment) => (
        <HypercertWindow
          key={hypercert.hypercert_id}
          hypercert={hypercert}
          priceDisplayCurrency="usd"
        />
      ))}
    </div>
  );
};
