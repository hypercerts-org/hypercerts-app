import { Suspense } from "react";
import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import { getBlueprints } from "@/blueprints/getBlueprints";
import BlueprintsList from "@/components/blueprints/blueprints-list";

const BlueprintTabContentInner = async ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  const availableBlueprints = await getBlueprints({
    filters: { minterAddress: address as `0x${string}`, minted: false },
  });
  const mintedBlueprints = await getBlueprints({
    filters: { minterAddress: address as `0x${string}`, minted: true },
  });

  const marketplaceSubTabs = subTabs.filter(
    (tab) => tab.key.split("-")[0] === "blueprints",
  );

  const tabBadgeCounts: Partial<
    Record<(typeof subTabs)[number]["key"], number>
  > = {
    "blueprints-claimable": availableBlueprints?.count ?? 0,
    "blueprints-claimed": mintedBlueprints?.count ?? 0,
    "blueprints-created": availableBlueprints?.count ?? 0,
  };
  return (
    <section>
      <SubTabsWithCount
        address={address}
        activeTab={activeTab}
        tabBadgeCounts={tabBadgeCounts}
        tabs={marketplaceSubTabs}
      />
      {activeTab === "blueprints-claimable" && (
        <BlueprintsList blueprints={availableBlueprints?.blueprints || []} />
      )}

      {activeTab === "blueprints-claimed" && (
        <BlueprintsList blueprints={mintedBlueprints?.blueprints || []} />
      )}

      {activeTab === "blueprints-created" && (
        <BlueprintsList blueprints={availableBlueprints?.blueprints || []} />
      )}
    </section>
  );
};

const BlueprintsTabContent = ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  return (
    <Suspense fallback={<ExploreListSkeleton length={9} />}>
      <BlueprintTabContentInner address={address} activeTab={activeTab} />
    </Suspense>
  );
};
export { BlueprintsTabContent };
