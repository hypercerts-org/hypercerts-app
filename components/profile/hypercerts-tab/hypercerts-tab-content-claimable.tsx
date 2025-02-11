"use client";

import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { EmptySection } from "@/components/global/sections";
import UnclaimedHypercertsList from "@/components/profile/unclaimed-hypercerts-list";
import { useClaimableHypercerts } from "@/hooks/useClaimableHypercerts";

export const ClaimableContent = ({ address }: { address: string }) => {
  const { data: response, isLoading } = useClaimableHypercerts(address);

  if (isLoading) return <ExploreListSkeleton length={4} />;
  if (!response) return <EmptySection />;

  const { data } = response;

  if (!data || data.length === 0) return <EmptySection />;

  return <UnclaimedHypercertsList unclaimedHypercerts={data} />;
};
