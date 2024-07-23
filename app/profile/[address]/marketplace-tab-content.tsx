import { Suspense } from "react";
import UserOrdersList from "@/components/marketplace/user-orders-list";
import { getOrders } from "@/marketplace/getOpenOrders";

const MarketplaceTabContent = async ({ address }: { address: string }) => {
  const orders = await getOrders({
    filter: { signer: address as `0x${string}` },
  });
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserOrdersList address={address} orders={orders?.data || []} />
    </Suspense>
  );
};
export { MarketplaceTabContent };
