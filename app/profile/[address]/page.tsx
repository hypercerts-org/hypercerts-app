import {
  ProfileSubTabKey,
  ProfileTabSection,
} from "@/app/profile/[address]/tabs";

import EthAddress from "@/components/eth-address";
import { HypercertsTabContent } from "@/app/profile/[address]/hypercerts-tab-content";
import { CollectionsTabContent } from "@/app/profile/[address]/collections-tab-content";
import { MarketplaceTabContent } from "@/app/profile/[address]/marketplace-tab-content";
import { BlueprintsTabContent } from "@/app/profile/[address]/blueprint-tab-content";
import { ContractAccountBanner } from "@/components/profile/contract-accounts-banner";
import { ProfileAccountSwitcher } from "@/components/profile/account-switcher";

export default function ProfilePage({
  params,
  searchParams,
}: {
  params: { address: string };
  searchParams: Record<string, string>;
}) {
  const address = params.address;
  const tab = searchParams?.tab || "hypercerts-owned";
  const mainTab = tab?.split("-")[0] ?? "hypercerts";

  return (
    <section className="flex flex-col gap-2">
      <ContractAccountBanner address={address} />
      <ProfileAccountSwitcher address={address} />
      <section className="flex flex-wrap gap-2 items-center">
        <h1 className="font-serif text-3xl lg:text-5xl tracking-tight">
          Profile
        </h1>
        <EthAddress address={address} />
      </section>
      <ProfileTabSection address={address} active={tab} />
      <section className="flex flex-col gap-2">
        {(tab === undefined || mainTab === "hypercerts") && (
          <HypercertsTabContent
            address={address}
            activeTab={tab as ProfileSubTabKey}
          />
        )}
        {mainTab === "collections" && (
          <CollectionsTabContent
            address={address}
            searchParams={searchParams}
          />
        )}
        {mainTab === "marketplace" && (
          <MarketplaceTabContent
            address={address}
            activeTab={tab as ProfileSubTabKey}
          />
        )}
        {mainTab === "blueprints" && (
          <BlueprintsTabContent
            address={address}
            activeTab={tab as ProfileSubTabKey}
            searchParams={searchParams}
          />
        )}
      </section>
    </section>
  );
}
