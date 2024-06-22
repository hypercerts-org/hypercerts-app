import {
  CollectionsTabContent,
  HypercertsTabContent,
  ProfileTabSection,
} from "@/app/profile/[address]/tabs";

import EthAddress from "@/components/eth-address";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage({
  params,
  searchParams,
}: {
  params: { address: string };
  searchParams: Record<string, string>;
}) {
  const address = params.address;
  const tab = searchParams?.tab;

  return (
    <section className="flex flex-col gap-2">
      <section className="flex flex-wrap gap-2 items-center">
        <h1 className="font-serif text-2xl lg:text-3xl tracking-tight">
          Profile
        </h1>
        <EthAddress address={address} />
      </section>
      <Separator />
      <section className="flex space-x-2">
        <ProfileTabSection address={address} active={tab} />
      </section>
      <section className="flex flex-col gap-2">
        {(tab === undefined || tab === "hypercerts") && (
          <HypercertsTabContent address={address} />
        )}
        {tab === "collections" && <CollectionsTabContent address={address} />}
      </section>
    </section>
  );
}
