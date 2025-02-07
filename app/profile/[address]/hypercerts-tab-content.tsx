import {
  claimableFractionsWithMetadataCache,
  hypercertsByCreatorCache,
  hypercertsByOwnerCache,
} from "@/app/api/profile/[address]/hypercerts/route";
import { ProfileSubTabKey } from "@/app/profile/[address]/tabs";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { UnclaimedFraction } from "@/components/profile/unclaimed-hypercerts-list";
import { HypercertListFragment } from "@/hypercerts/fragments/hypercert-list.fragment";
import { Suspense } from "react";
import { HypercertsTabContentInner } from "./hypercerts-tab-content-inner";

export type TabData = {
  created?: {
    data: HypercertListFragment[];
    count: number;
  };
  owned?: {
    data: HypercertListFragment[];
    count: number;
  };
  claimable?: {
    data: UnclaimedFraction[];
    count: number;
  };
};

// Server Component
export async function HypercertsTabContent({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) {
  // Initial server data fetch
  const initialData = {
    created: await hypercertsByCreatorCache(address),
    owned: await hypercertsByOwnerCache(address),
    claimable: await claimableFractionsWithMetadataCache(address),
  };

  return (
    <Suspense fallback={<ExploreListSkeleton length={4} />}>
      <HypercertsTabContentInner
        address={address}
        activeTab={activeTab}
        initialData={initialData}
      />
    </Suspense>
  );
}
