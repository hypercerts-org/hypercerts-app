import { Suspense } from "react";
import { ProfileSubTabKey } from "@/app/profile/[address]/tabs";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import MarketplaceTabContentInner from "./marketplace-tab-content.client";
import { getOrders } from "@/marketplace/getOpenOrders";
import { getDealsForAddress } from "@/marketplace/getDealsForAddress";
import MarketplaceTabSkeleton from "@/components/profile/marketplace-tab-skeleton";

export default async function MarketplaceTabContent({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) {
  if (!activeTab || !address) {
    return null;
  }

  // Fetch data server-side
  const orders = await getOrders({
    filter: { signer: address as `0x${string}` },
  });
  const deals = await getDealsForAddress(address);
  const { buys, sells } = deals || {};

  return (
    <Suspense fallback={<MarketplaceTabSkeleton length={9} />}>
      <MarketplaceTabContentInner
        address={address}
        activeTab={activeTab}
        orders={orders?.data || []}
        buys={buys?.data || []}
        sells={sells?.data || []}
      />
    </Suspense>
  );
}
