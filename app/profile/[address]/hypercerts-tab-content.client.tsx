"use client";

import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import { EmptySection } from "@/app/profile/[address]/sections";
import UnclaimedHypercertsList from "@/components/profile/unclaimed-hypercerts-list";
import { AllowListRecord } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import UnclaimedHypercertsListContent from "@/components/profile/unclaimed-hypercerts-list-content";

export default function HypercertsTabContentInner({
  address,
  activeTab,
  createdHypercerts,
  ownedHypercerts,
  claimableHypercerts,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
  createdHypercerts?: { data: any[]; count: number };
  ownedHypercerts?: { data: any[]; count: number };
  claimableHypercerts?: { hypercert: any; record: AllowListRecord }[];
}) {
  const showCreatedHypercerts = !!(
    createdHypercerts && createdHypercerts?.data?.length > 0
  );
  const showOwnedHypercerts = !!(
    ownedHypercerts && ownedHypercerts?.data?.length > 0
  );
  const showClaimableHypercerts = !!(
    claimableHypercerts && claimableHypercerts?.length > 0
  );

  const tabBadgeCounts = {
    "hypercerts-created": createdHypercerts?.count ?? 0,
    "hypercerts-owned": ownedHypercerts?.count ?? 0,
    "hypercerts-claimable": claimableHypercerts?.length ?? 0,
  };

  return (
    <section>
      <SubTabsWithCount
        address={address}
        activeTab={activeTab}
        tabBadgeCounts={tabBadgeCounts}
        tabs={subTabs.filter((tab) => tab.key.startsWith("hypercerts"))}
      />

      {activeTab === "hypercerts-owned" &&
        (showOwnedHypercerts ? (
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(16.875rem,_20rem))] gap-4 py-4">
            {ownedHypercerts.data.map((hypercert) => (
              <HypercertWindow
                key={hypercert.hypercert_id}
                hypercert={hypercert}
                priceDisplayCurrency="usd"
              />
            ))}
          </div>
        ) : (
          <section className="pt-4">
            <EmptySection />
          </section>
        ))}

      {activeTab === "hypercerts-created" &&
        (showCreatedHypercerts ? (
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(16.875rem,_20rem))] gap-4 py-4">
            {createdHypercerts.data.map((hypercert) => (
              <HypercertWindow
                key={hypercert.hypercert_id}
                hypercert={hypercert}
                priceDisplayCurrency="usd"
              />
            ))}
          </div>
        ) : (
          <section className="pt-4">
            <EmptySection />
          </section>
        ))}

      {activeTab === "hypercerts-claimable" &&
        (showClaimableHypercerts ? (
          <UnclaimedHypercertsListContent
            unclaimedHypercertsData={claimableHypercerts}
          />
        ) : (
          <section className="pt-4">
            <EmptySection />
          </section>
        ))}
    </section>
  );
}
