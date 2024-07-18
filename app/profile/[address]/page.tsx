import {
  CollectionsTabContent,
  HypercertsTabContent,
  ProfileSubTabKey,
  ProfileTabSection,
} from "@/app/profile/[address]/tabs";

import EthAddress from "@/components/eth-address";

export default function ProfilePage({
  params,
  searchParams,
}: {
  params: { address: string };
  searchParams: Record<string, string>;
}) {
  const address = params.address;
  const tab = searchParams?.tab || "hypercerts-created";
  const mainTab = tab?.split("-")[0] ?? "hypercerts";

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
        {(tab === undefined || mainTab === "hypercerts") && (
          <HypercertsTabContent
            address={address}
            activeTab={tab as ProfileSubTabKey}
          />
        )}
        {mainTab === "collections" && (
          <CollectionsTabContent address={address} />
        )}
      </section>
    </section>
  );
}
