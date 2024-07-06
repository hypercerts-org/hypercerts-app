import { EmptySection } from "@/app/profile/[address]/sections";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import HypercertMiniDisplay from "@/components/hypercert/hypercert-mini-display";
import UnclaimedHypercertsList from "@/components/profile/unclaimed-hypercerts-list";
import { Button } from "@/components/ui/button";
import { getHypercertsByCreator } from "@/hypercerts/getHypercertsByCreator";
import { type SupportedChainIdType } from "@/lib/constants";
import Link from "next/link";
import { Suspense } from "react";
import { HyperboardRow } from "@/components/hyperboard/hyperboard-row";
import { getCollectionsByAdminAddress } from "@/collections/getCollectionsByAdminAddress";

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

const HypercertsTabContentInner = async ({ address }: { address: string }) => {
  const hypercerts = await getHypercertsByCreator({ creatorAddress: address });

  const showHypercerts = !!hypercerts?.data?.length;

  return (
    <>
      {showHypercerts ? (
        <>
          <div>
            <Button variant="secondary" size="sm" className={`space-x-1`}>
              <h2 className={`text-sm`}>Created by me</h2>
              <span
                className={`bg-black text-white text-xs px-1 py-0.5 rounded-lg h-max`}
              >
                {hypercerts?.count}
              </span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-5 justify-center lg:justify-start pt-3">
            {hypercerts?.data.map((hypercert, index) => {
              const props = {
                hypercertId: hypercert.hypercert_id as string,
                name: hypercert.metadata?.name as string,
                chainId: Number(
                  hypercert.contract?.chain_id,
                ) as SupportedChainIdType,
                attestations: hypercert.attestations,
              };
              return <HypercertMiniDisplay key={index} {...props} />; // TODO: show hypercert mini displays
            })}
          </div>
        </>
      ) : (
        <EmptySection />
      )}
      <h1 className="font-serif text-2xl lg:text-3xl tracking-tight">
        Unclaimed hypercerts
      </h1>
      <UnclaimedHypercertsList address={address} />
    </>
  );
};

const HypercertsTabContent = ({ address }: { address: string }) => {
  return (
    <Suspense fallback={<ExploreListSkeleton length={4} />}>
      <HypercertsTabContentInner address={address} />
    </Suspense>
  );
};

const ProfileTabSection = ({
  address,
  active = "hypercerts",
}: {
  address: string;
  active: string;
}) => {
  return (
    <section className="w-full space-y-2">
      <section className="space-x-1 w-full flex">
        <Link href={`/profile/${address}?tab=hypercerts`}>
          <Button
            variant={active === "hypercerts" ? "default" : "outline"}
            size={"default"}
            className={`space-x-1 border-[1.5px]`}
          >
            <h3 className={`text-lg`}>Hypercerts</h3>
          </Button>
        </Link>
        <Link href={`/profile/${address}?tab=collections`}>
          <Button
            variant={active === "collections" ? "default" : "outline"}
            size={"default"}
            className={`space-x-1 border-[1.5px]`}
          >
            <h3 className={`text-lg`}>Collections</h3>
          </Button>
        </Link>
      </section>
    </section>
  );
};

export { CollectionsTabContent, HypercertsTabContent, ProfileTabSection };
