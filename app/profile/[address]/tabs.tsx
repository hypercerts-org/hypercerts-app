import { getAllowListRecordsForAddress } from "@/allowlists/getAllowListRecordsForAddress";
import { EmptySection } from "@/app/profile/[address]/sections";
import { getCollectionsByAdminAddress } from "@/collections/getCollectionsByAdminAddress";
import CountBadge from "@/components/count-badge";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { HyperboardRow } from "@/components/hyperboard/hyperboard-row";
import { HypercertMiniDisplayProps } from "@/components/hypercert/hypercert-mini-display";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import UnclaimedHypercertsList from "@/components/profile/unclaimed-hypercerts-list";
import { Separator } from "@/components/ui/separator";
import { getHypercertsByCreator } from "@/hypercerts/getHypercertsByCreator";
import { type SupportedChainIdType } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { getPricePerPercent } from "@/marketplace/utils";

const subTabs = [
  { key: "hypercerts-created", triggerLabel: "Created by me" },
  { key: "hypercerts-claimable", triggerLabel: "Claimable" },
] as const;

export type ProfileSubTabKey = (typeof subTabs)[number]["key"] | "collections";

const mainTabs: {
  prefix: string;
  triggerLabel: string;
  defaultSubTabKey: ProfileSubTabKey;
}[] = [
  {
    prefix: "hypercerts",
    triggerLabel: "Hypercerts",
    defaultSubTabKey: "hypercerts-created",
  },
  {
    prefix: "collections",
    triggerLabel: "Collections",
    defaultSubTabKey: "collections",
  },
];

const createTabRoute = (address: string, tabKey: ProfileSubTabKey) =>
  `/profile/${address}?tab=${tabKey}`;

export const defaultDescription =
  "libp2p is an open source project for building network applications free from runtime and address services. You can help define the specification, create applications using libp2p, and craft examples and tutorials to get involved.";

const CollectionsTabContentInner = async ({ address }: { address: string }) => {
  const hyperboards = await getCollectionsByAdminAddress(address.toLowerCase());

  if (!hyperboards) {
    return <EmptySection />;
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {hyperboards.map((hyperboard) => (
          <HyperboardRow
            key={hyperboard.id}
            hyperboardId={hyperboard.id}
            name={hyperboard.name}
            description={defaultDescription}
          />
        ))}
      </div>
    </div>
  );
};

const CollectionsTabContent = ({ address }: { address: string }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollectionsTabContentInner address={address} />
    </Suspense>
  );
};

const HypercertsTabContentInner = async ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  const createdHypercerts = await getHypercertsByCreator({
    creatorAddress: address,
  });
  const allowlist = await getAllowListRecordsForAddress(address);

  // TODO: Do this in the query. Currently it doesn't support multiple filters at the same time
  const unclaimedHypercerts =
    allowlist?.data.filter((item) => !item.claimed) || [];

  const isEmptyAllowlist =
    !allowlist ||
    allowlist.count === 0 ||
    !allowlist.data ||
    !Array.isArray(allowlist.data);

  const showCreatedHypercerts = !!createdHypercerts?.data?.length;
  const hypercertSubTabs = subTabs.filter(
    (tab) => tab.key.split("-")[0] === "hypercerts",
  );

  const tabBadgeCounts = {
    "hypercerts-created": createdHypercerts?.count ?? 0,
    "hypercerts-claimable": unclaimedHypercerts.length,
  };

  return (
    <section>
      <section className="bg-neutral-100 w-max flex rounded-sm p-1">
        {hypercertSubTabs.map(({ key, triggerLabel }) => (
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
              <CountBadge
                count={tabBadgeCounts[key]}
                variant={key === activeTab ? "default" : "secondary"}
              />
            </button>
          </Link>
        ))}
      </section>

      {activeTab === "hypercerts-created" &&
        (showCreatedHypercerts ? (
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-3">
            {createdHypercerts?.data.map((hypercert) => {
              const percentAvailable = calculateBigIntPercentage(
                hypercert.orders?.totalUnitsForSale,
                hypercert.units,
              );
              const lowestPrice = getPricePerPercent(
                hypercert.orders?.lowestAvailablePrice || "0",
                BigInt(hypercert?.units || "0"),
              );

              const props: HypercertMiniDisplayProps = {
                hypercertId: hypercert.hypercert_id as string,
                name: hypercert.metadata?.name as string,
                chainId: Number(
                  hypercert.contract?.chain_id,
                ) as SupportedChainIdType,
                attestations: hypercert.attestations,
                lowestPrice,
                percentAvailable,
              };
              return (
                <HypercertWindow {...props} key={hypercert.hypercert_id} />
              );
            })}
          </div>
        ) : (
          <section className="pt-4">
            <EmptySection />
          </section>
        ))}

      {activeTab === "hypercerts-claimable" && (
        <section className="pt-4">
          <UnclaimedHypercertsList
            unclaimedHypercerts={unclaimedHypercerts}
            isEmptyAllowlist={isEmptyAllowlist}
          />
        </section>
      )}
    </section>
  );
};

const HypercertsTabContent = ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  return (
    <Suspense fallback={<ExploreListSkeleton length={4} />}>
      <HypercertsTabContentInner address={address} activeTab={activeTab} />
    </Suspense>
  );
};

const ProfileTabSection = ({
  address,
  active = "hypercerts-created",
}: {
  address: string;
  active: string;
}) => {
  const tabPrefix = active.split("-")[0];
  return (
    <section className="w-full">
      <section className="flex items-end overflow-clip">
        {mainTabs.map(({ defaultSubTabKey, prefix, triggerLabel }) => (
          <Link key={prefix} href={createTabRoute(address, defaultSubTabKey)}>
            <button
              className={cn(
                "px-3 py-2 border-b-2 font-semibold text-lg",
                tabPrefix === prefix ? "border-black" : "opacity-45",
              )}
            >
              {triggerLabel}
            </button>
          </Link>
        ))}
        <Separator className="flex-1" />
      </section>
    </section>
  );
};

export { CollectionsTabContent, HypercertsTabContent, ProfileTabSection };
