import { getHypercertsByCreator } from "@/hypercerts/getHypercertsByCreator";
import { getAllowListRecordsForAddress } from "@/allowlists/getAllowListRecordsForAddress";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CountBadge from "@/components/count-badge";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { getPricePerPercent } from "@/marketplace/utils";
import { HypercertMiniDisplayProps } from "@/components/hypercert/hypercert-mini-display";
import type { SupportedChainIdType } from "@/lib/constants";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import { EmptySection } from "@/app/profile/[address]/sections";
import UnclaimedHypercertsList from "@/components/profile/unclaimed-hypercerts-list";
import { Suspense } from "react";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import {
  createTabRoute,
  ProfileSubTabKey,
  subTabs,
} from "@/app/profile/[address]/tabs";

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

  const tabBadgeCounts: Partial<
    Record<(typeof subTabs)[number]["key"], number>
  > = {
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

      {activeTab === "hypercerts-created" &&
        (showCreatedHypercerts ? (
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-4">
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
export { HypercertsTabContent };
