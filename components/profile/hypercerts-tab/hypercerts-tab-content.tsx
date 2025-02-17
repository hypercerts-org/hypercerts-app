import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
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
        <CreatedContent address={address} />
      )}

      {activeTab === "hypercerts-owned" && <OwnedContent address={address} />}

      {activeTab === "hypercerts-claimable" && (
        <ClaimableContent address={address} />
      )}
    </section>
  );
}
