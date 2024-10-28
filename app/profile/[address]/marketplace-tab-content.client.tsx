"use client";

import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import UserListingsList from "@/components/marketplace/user-listings-list";
import UserDealsList from "@/components/marketplace/user-deals-list";
import { CurrencyButtons } from "@/components/currency-buttons";

export default function MarketplaceTabContentInner({
  address,
  activeTab,
  orders,
  buys,
  sells,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
  orders: any[];
  buys: any[];
  sells: any[];
}) {
  const marketplaceSubTabs = subTabs.filter(
    (tab) => tab.key.split("-")[0] === "marketplace",
  );

  const tabBadgeCounts = {
    "marketplace-listings": orders.length,
    "marketplace-bought": buys.length,
    "marketplace-sold": sells.length,
  };

  return (
    <section>
      <div className="flex flex-row justify-between mb-2 align-middle">
        <SubTabsWithCount
          address={address}
          activeTab={activeTab}
          tabBadgeCounts={tabBadgeCounts}
          tabs={marketplaceSubTabs}
        />
        {activeTab === "marketplace-listings" && <CurrencyButtons />}
      </div>

      {activeTab === "marketplace-listings" && (
        <div className="flex justify-end">
          <UserListingsList address={address} orders={orders} />
        </div>
      )}

      {activeTab === "marketplace-bought" && (
        <UserDealsList address={address} deals={buys} />
      )}

      {activeTab === "marketplace-sold" && (
        <UserDealsList address={address} deals={sells} />
      )}
    </section>
  );
}
