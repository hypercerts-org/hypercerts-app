import React, { Suspense } from "react";
import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import { getBlueprints } from "@/blueprints/getBlueprints";
import BlueprintsList from "@/components/blueprints/blueprints-list";
import { CreateBlueprintButton } from "@/components/blueprints/buttons";
import { OwnAccountOnly } from "@/components/own-account-only";
import { BlueprintsTable } from "@/components/blueprints/blueprints-table";
import { BLUEPRINTS_PER_PAGE } from "@/configs/ui";
import Pagination from "@/components/global/pagination/pagination";

const BlueprintTabContentInner = async ({
  address,
  activeTab,
  searchParams,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
  searchParams: Record<string, string>;
}) => {
  const currentPage = Number(searchParams?.p) || 1;

  const availableBlueprints = await getBlueprints({
    filters: { minterAddress: address as `0x${string}`, minted: false },
    first: BLUEPRINTS_PER_PAGE,
    offset: BLUEPRINTS_PER_PAGE * (currentPage - 1),
  });
  const mintedBlueprints = await getBlueprints({
    filters: { minterAddress: address as `0x${string}`, minted: true },
    first: BLUEPRINTS_PER_PAGE,
    offset: BLUEPRINTS_PER_PAGE * (currentPage - 1),
  });
  const blueprintsCreated = await getBlueprints({
    filters: { adminAddress: address as `0x${string}` },
    first: BLUEPRINTS_PER_PAGE,
    offset: BLUEPRINTS_PER_PAGE * (currentPage - 1),
  });

  const marketplaceSubTabs = subTabs.filter(
    (tab) => tab.key.split("-")[0] === "blueprints",
  );

  const tabBadgeCounts: Partial<
    Record<(typeof subTabs)[number]["key"], number>
  > = {
    "blueprints-claimable": availableBlueprints?.count ?? 0,
    "blueprints-claimed": mintedBlueprints?.count ?? 0,
    "blueprints-created": blueprintsCreated?.count ?? 0,
  };
  const currentCount =
    tabBadgeCounts[activeTab as (typeof subTabs)[number]["key"]];
  return (
    <section>
      <SubTabsWithCount
        address={address}
        activeTab={activeTab}
        tabBadgeCounts={tabBadgeCounts}
        tabs={marketplaceSubTabs}
      />

      <OwnAccountOnly addressToMatch={address}>
        <div className="flex justify-end mb-2">
          <CreateBlueprintButton />
        </div>
      </OwnAccountOnly>
      {activeTab === "blueprints-claimable" && (
        <BlueprintsList blueprints={availableBlueprints?.blueprints || []} />
      )}

      {activeTab === "blueprints-claimed" && (
        <BlueprintsList blueprints={mintedBlueprints?.blueprints || []} />
      )}

      {activeTab === "blueprints-created" && (
        <BlueprintsTable
          blueprints={blueprintsCreated?.blueprints || []}
          count={blueprintsCreated?.count}
        />
      )}
      {currentCount !== 0 && (
        <div className="mt-5">
          <Pagination
            searchParams={searchParams}
            totalItems={currentCount || 0}
            itemsPerPage={BLUEPRINTS_PER_PAGE}
            basePath={`/profile/${address}/blueprints`}
          />
        </div>
      )}
    </section>
  );
};

const BlueprintsTabContent = ({
  address,
  activeTab,
  searchParams,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
  searchParams: Record<string, string>;
}) => {
  return (
    <Suspense fallback={<ExploreListSkeleton length={9} />}>
      <BlueprintTabContentInner
        address={address}
        activeTab={activeTab}
        searchParams={searchParams}
      />
    </Suspense>
  );
};
export { BlueprintsTabContent };
