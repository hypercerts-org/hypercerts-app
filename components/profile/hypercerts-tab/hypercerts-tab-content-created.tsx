"use client";

import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { EmptySection } from "@/components/global/sections";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import { useCreatedHypercerts } from "@/hooks/useCreatedHypercerts";

export const CreatedContent = ({ address }: { address: string }) => {
  const { data: response, isLoading } = useCreatedHypercerts(address);

  if (isLoading) return <ExploreListSkeleton length={4} />;
  if (!response?.data) return <EmptySection />;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(16.875rem,_20rem))] gap-4 py-4">
      {response.data.map((hypercert) => (
        <HypercertWindow
          key={hypercert.hypercert_id}
          hypercert={hypercert}
          priceDisplayCurrency="usd"
        />
      ))}
    </div>
  );
};
