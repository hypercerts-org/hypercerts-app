import { Suspense } from "react";
import UserListingsList from "@/components/marketplace/user-listings-list";
import { getOrders } from "@/marketplace/getOpenOrders";
import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import { getDealsForAddress } from "@/marketplace/getDealsForAddress";
import UserDealsList from "@/components/marketplace/user-deals-list";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import { CurrencyButtons } from "@/components/currency-buttons";
import { TableSkeleton } from "@/components/global/table-skeleton";

const MarketplaceTabContentInner = async ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  const orders = await getOrders({
    filter: { signer: address as `0x${string}` },
  });

  const deals = await getDealsForAddress(address);
  console.log("DEALS", JSON.stringify(deals, null, 2));
  const { buys, sells } = deals || {};

  const marketplaceSubTabs = subTabs.filter(
    (tab) => tab.key.split("-")[0] === "marketplace",
  );

  const tabBadgeCounts: Partial<
    Record<(typeof subTabs)[number]["key"], number>
  > = {
    "marketplace-listings": orders?.count ?? 0,
    "marketplace-bought": buys?.count ?? 0,
    "marketplace-sold": sells?.count ?? 0,
  };
  console.log("TAB BADGE COUNTS", JSON.stringify(tabBadgeCounts, null, 2));
  return (
    <section>
      <SubTabsWithCount
        address={address}
        activeTab={activeTab}
        tabBadgeCounts={tabBadgeCounts}
        tabs={marketplaceSubTabs}
      />
      {activeTab === "marketplace-listings" && (
        <Suspense fallback={<TableSkeleton />}>
          <div className="flex justify-end">
            <CurrencyButtons />
          </div>
          <UserListingsList address={address} orders={orders?.data || []} />
        </Suspense>
      )}

      {activeTab === "marketplace-bought" && (
        <Suspense fallback={<div>Loading...</div>}>
          <UserDealsList address={address} deals={buys?.data || []} />
        </Suspense>
      )}

      {activeTab === "marketplace-sold" && (
        <Suspense fallback={<div>Loading...</div>}>
          <UserDealsList address={address} deals={sells?.data || []} />
        </Suspense>
      )}
    </section>
  );
};

const MarketplaceTabContent = ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  return (
    <Suspense
      fallback={
        activeTab === "marketplace-listings" ? (
          <TableSkeleton />
        ) : (
          <ExploreListSkeleton length={9} />
        )
      }
    >
      <MarketplaceTabContentInner address={address} activeTab={activeTab} />
    </Suspense>
  );
};
export { MarketplaceTabContent };
