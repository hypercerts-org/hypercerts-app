"use client";

import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import { EmptySection } from "@/components/global/sections";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import UnclaimedHypercertsList from "@/components/profile/unclaimed-hypercerts-list";
import { useQuery } from "@tanstack/react-query";
import { TabData } from "./hypercerts-tab-content";
import { getAddress } from "viem";

export function HypercertsTabContentInner({
  address,
  activeTab,
  initialData,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
  initialData: TabData;
}) {
  const { data } = useQuery({
    queryKey: ["hypercerts-data", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(
        `/api/profile/${getAddress(address)}/hypercerts`,
      );
      return response.json();
    },
    initialData,
    refetchInterval: 30000,
  });

  const hypercertSubTabs = subTabs.filter(
    (tab) => tab.key.split("-")[0] === "hypercerts",
  );

  const tabBadgeCounts = {
    "hypercerts-created": data ? data.created?.count ?? 0 : 0,
    "hypercerts-owned": data ? data.owned?.count ?? 0 : 0,
    "hypercerts-claimable": data ? data.claimable?.count ?? 0 : 0,
  };

  if (!data) {
    return (
      <>
        <SubTabsWithCount
          address={address}
          activeTab={activeTab}
          tabBadgeCounts={tabBadgeCounts}
          tabs={hypercertSubTabs}
        />
        <EmptySection />
      </>
    );
  }

  const showCreatedHypercerts =
    data.created?.data && data.created.data.length > 0;
  const showOwnedHypercerts = data.owned?.data && data.owned.data.length > 0;
  const showClaimableHypercerts =
    data.claimable?.data && data.claimable.data.length > 0;

  return (
    <section>
      <SubTabsWithCount
        address={address}
        activeTab={activeTab}
        tabBadgeCounts={tabBadgeCounts}
        tabs={hypercertSubTabs}
      />

      {activeTab === "hypercerts-owned" &&
        (showOwnedHypercerts ? (
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(16.875rem,_20rem))] gap-4 py-4">
            {data.owned?.data.map((hypercert) => (
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
            {data.created?.data.map((hypercert) => {
              return (
                <HypercertWindow
                  key={hypercert.hypercert_id}
                  hypercert={hypercert}
                  priceDisplayCurrency="usd"
                />
              );
            })}
          </div>
        ) : (
          <section className="pt-4">
            <EmptySection />
          </section>
        ))}

      {activeTab === "hypercerts-claimable" &&
        (showClaimableHypercerts ? (
          <UnclaimedHypercertsList unclaimedHypercerts={data.claimable.data} />
        ) : (
          <section className="pt-4">
            <EmptySection />
          </section>
        ))}
    </section>
  );
}
