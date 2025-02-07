import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { SubTabsWithCountSkeleton } from "@/components/profile/sub-tabs-with-count";
import { UnclaimedFraction } from "@/components/profile/unclaimed-hypercerts-list";
import { HypercertListFragment } from "@/hypercerts/fragments/hypercert-list.fragment";
import { Suspense } from "react";
import { ClaimableContent } from "./hypercerts-tab-content-claimable";
import { CreatedContent } from "./hypercerts-tab-content-created";
import { OwnedContent } from "./hypercerts-tab-content-owned";
import { HypercertsTabCounts } from "./hypercerts-tab-counts";

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

const hypercertSubTabs = subTabs.filter(
  (tab) => tab.key.split("-")[0] === "hypercerts",
);

// Server Component
export function HypercertsTabContent({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) {
  return (
    <section>
      <Suspense
        fallback={
          <SubTabsWithCountSkeleton
            tabs={hypercertSubTabs}
            activeTab={activeTab}
          />
        }
      >
        <HypercertsTabCounts address={address} activeTab={activeTab} />
      </Suspense>

      {activeTab === "hypercerts-created" && (
        <Suspense fallback={<ExploreListSkeleton length={4} />}>
          <CreatedContent address={address} />
        </Suspense>
      )}

      {activeTab === "hypercerts-owned" && (
        <Suspense fallback={<ExploreListSkeleton length={4} />}>
          <OwnedContent address={address} />
        </Suspense>
      )}

      {activeTab === "hypercerts-claimable" && (
        <Suspense fallback={<ExploreListSkeleton length={4} />}>
          <ClaimableContent address={address} />
        </Suspense>
      )}
    </section>
  );
}
