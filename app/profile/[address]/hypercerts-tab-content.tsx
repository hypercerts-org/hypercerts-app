import { getHypercertsByCreator } from "@/hypercerts/getHypercertsByCreator";
import { getAllowListRecordsForAddressByClaimed } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import { EmptySection } from "@/app/profile/[address]/sections";
import UnclaimedHypercertsList from "@/components/profile/unclaimed-hypercerts-list";
import { Suspense } from "react";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import { getHypercertsByOwner } from "@/hypercerts/getHypercertsByOwner";

const HypercertsTabContentInner = async ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  const createdHypercerts = await getHypercertsByCreator({
    creatorAddress: address,
  });

  const ownedHypercerts = await getHypercertsByOwner({
    ownerAddress: address,
  });

  const claimableHypercerts = await getAllowListRecordsForAddressByClaimed(
    address,
    false,
  );

  const showCreatedHypercerts =
    createdHypercerts?.data && createdHypercerts.data.length > 0;
  const showOwnedHypercerts =
    ownedHypercerts?.data && ownedHypercerts.data.length > 0;
  const showClaimableHypercerts =
    claimableHypercerts?.data && claimableHypercerts.data.length > 0;
  const hypercertSubTabs = subTabs.filter(
    (tab) => tab.key.split("-")[0] === "hypercerts",
  );

  const tabBadgeCounts: Partial<
    Record<(typeof subTabs)[number]["key"], number>
  > = {
    "hypercerts-created": createdHypercerts?.count ?? 0,
    "hypercerts-owned": ownedHypercerts?.count ?? 0,
    "hypercerts-claimable": claimableHypercerts?.count ?? 0,
  };

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
            {ownedHypercerts.data.map((hypercert) => {
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

      {activeTab === "hypercerts-created" &&
        (showCreatedHypercerts ? (
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(16.875rem,_20rem))] gap-4 py-4">
            {createdHypercerts.data.map((hypercert) => {
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
          <UnclaimedHypercertsList
            unclaimedHypercerts={claimableHypercerts?.data}
          />
        ) : (
          <section className="pt-4">
            <EmptySection />
          </section>
        ))}
    </section>
  );
};

const HypercertsTabContent = ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  return (
    <Suspense fallback={<ExploreListSkeleton length={4} />}>
      <HypercertsTabContentInner address={address} activeTab={activeTab} />
    </Suspense>
  );
};
export { HypercertsTabContent };
