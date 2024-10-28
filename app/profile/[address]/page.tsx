import { Suspense } from "react";
import {
  ProfileSubTabKey,
  ProfileTabSection,
} from "@/app/profile/[address]/tabs";
import EthAddress from "@/components/eth-address";
import MarketplaceTabContent from "@/app/profile/[address]/marketplace-tab-content.server";
import BlueprintsTabContent from "@/app/profile/[address]/blueprint-tab-content.server";
import TabContentSkeleton from "@/components/tab-content-skeleton";
import { HypercertsTabContent } from "@/app/profile/[address]/hypercerts-tab-content.server";
import CollectionsTabContent from "@/app/profile/[address]/collections-tab-content.server";

export default function ProfilePage({
  params,
  searchParams,
}: {
  params: { address: string };
  searchParams: Record<string, string>;
}) {
  const address = params.address;
  const tab = (searchParams?.tab || "hypercerts-owned") as ProfileSubTabKey;
  const mainTab = tab.split("-")[0];

  return (
    <section className="flex flex-col gap-2">
      <section className="flex flex-wrap gap-2 items-center">
        <h1 className="font-serif text-3xl lg:text-5xl tracking-tight">
          Profile
        </h1>
        <EthAddress address={address} />
      </section>
      <ProfileTabSection address={address} active={tab} />
      <section className="flex flex-col gap-2">
        <Suspense fallback={<TabContentSkeleton />}>
          {mainTab === "hypercerts" && (
            <HypercertsTabContent address={address} activeTab={tab} />
          )}
          {mainTab === "collections" && (
            <CollectionsTabContent
              address={address}
              searchParams={searchParams}
            />
          )}
          {mainTab === "marketplace" && (
            <MarketplaceTabContent address={address} activeTab={tab} />
          )}
          {mainTab === "blueprints" && (
            <BlueprintsTabContent
              address={address}
              activeTab={tab}
              searchParams={searchParams}
            />
          )}
        </Suspense>
      </section>
    </section>
  );
}
