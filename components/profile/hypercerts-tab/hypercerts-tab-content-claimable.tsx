"use client";

import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { EmptySection } from "@/components/global/sections";
import UnclaimedHypercertsList, {
  UnclaimedFraction,
} from "@/components/profile/unclaimed-hypercerts-list";
import { useQuery } from "@tanstack/react-query";

export const ClaimableContent = ({ address }: { address: string }) => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["hypercerts-claimable", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${address}/claimable`);
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return <ExploreListSkeleton length={4} />;
  if (!response) return <EmptySection />;

  const { data } = response;

  if (!data || data.length === 0) return <EmptySection />;

  return (
    <UnclaimedHypercertsList
      unclaimedHypercerts={data as UnclaimedFraction[]}
    />
  );
};
