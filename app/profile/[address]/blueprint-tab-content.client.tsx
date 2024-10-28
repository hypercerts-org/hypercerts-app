"use client";

import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import BlueprintsList from "@/components/blueprints/blueprints-list";
import { CreateBlueprintButton } from "@/components/blueprints/buttons";
import { OwnAccountOnly } from "@/components/own-account-only";
import { BlueprintsTable } from "@/components/blueprints/blueprints-table";
import Pagination from "@/components/pagination";
import { BLUEPRINTS_PER_PAGE } from "@/configs/ui";

export default function BlueprintsTabContentInner({
  address,
  activeTab,
  searchParams,
  availableBlueprints,
  mintedBlueprints,
  blueprintsCreated,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
  searchParams: Record<string, string>;
  availableBlueprints: any;
  mintedBlueprints: any;
  blueprintsCreated: any;
}) {
  const marketplaceSubTabs = subTabs.filter(
    (tab) => tab.key.split("-")[0] === "blueprints",
  );

  const tabBadgeCounts = {
    "blueprints-claimable": availableBlueprints?.count ?? 0,
    "blueprints-claimed": mintedBlueprints?.count ?? 0,
    "blueprints-created": blueprintsCreated?.count ?? 0,
  };

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

      {(availableBlueprints?.count ||
        mintedBlueprints?.count ||
        blueprintsCreated?.count) && (
        <div className="mt-5">
          <Pagination
            count={
              tabBadgeCounts[activeTab as keyof typeof tabBadgeCounts] || 0
            }
            pageSize={BLUEPRINTS_PER_PAGE}
          />
        </div>
      )}
    </section>
  );
}
