import { Suspense } from "react";
import UserOrdersList from "@/components/marketplace/user-orders-list";
import { getOrders } from "@/marketplace/getOpenOrders";
import {
  createTabRoute,
  ProfileSubTabKey,
  subTabs,
} from "@/app/profile/[address]/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CountBadge from "@/components/count-badge";

const MarketplaceTabContent = async ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  const orders = await getOrders({
    filter: { signer: address as `0x${string}` },
  });

  const marketplaceSubTabs = subTabs.filter(
    (tab) => tab.key.split("-")[0] === "marketplace",
  );

  const tabBadgeCounts: Partial<
    Record<(typeof subTabs)[number]["key"], number>
  > = {
    "marketplace-listings": orders?.count || 0,
  };
  return (
    <>
      <section className="bg-neutral-100 w-max flex rounded-sm p-1">
        {marketplaceSubTabs.map(({ key, triggerLabel }) => (
          <Link href={createTabRoute(address, key)} key={key}>
            <button
              className={cn(
                "flex gap-1.5 px-3 py-2 text-sm rounded-md tracking-tight transition duration-300 border-[1.5px] shadow-sm font-semibold",
                key === activeTab
                  ? "bg-white border-neutral-300"
                  : "opacity-60 border-transparent",
              )}
            >
              {triggerLabel}
              {tabBadgeCounts[key] && (
                <CountBadge
                  count={tabBadgeCounts[key]}
                  variant={key === activeTab ? "default" : "secondary"}
                />
              )}
            </button>
          </Link>
        ))}
      </section>
      <Suspense fallback={<div>Loading...</div>}>
        <UserOrdersList address={address} orders={orders?.data || []} />
      </Suspense>
    </>
  );
};
export { MarketplaceTabContent };
