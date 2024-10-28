import { Suspense } from "react";
import { ProfileSubTabKey } from "@/app/profile/[address]/tabs";
import BlueprintsTabContentInner from "./blueprint-tab-content.client";
import { getBlueprints } from "@/blueprints/getBlueprints";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { BLUEPRINTS_PER_PAGE } from "@/configs/ui";

export default async function BlueprintsTabContent({
  address,
  activeTab,
  searchParams,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
  searchParams: Record<string, string>;
}) {
  const currentPage = Number(searchParams?.p) || 1;

  // Fetch data server-side
  const [availableBlueprints, mintedBlueprints, blueprintsCreated] =
    await Promise.all([
      getBlueprints({
        filters: { minterAddress: address as `0x${string}`, minted: false },
        first: BLUEPRINTS_PER_PAGE,
        offset: BLUEPRINTS_PER_PAGE * (currentPage - 1),
      }),
      getBlueprints({
        filters: { minterAddress: address as `0x${string}`, minted: true },
        first: BLUEPRINTS_PER_PAGE,
        offset: BLUEPRINTS_PER_PAGE * (currentPage - 1),
      }),
      getBlueprints({
        filters: { adminAddress: address as `0x${string}` },
        first: BLUEPRINTS_PER_PAGE,
        offset: BLUEPRINTS_PER_PAGE * (currentPage - 1),
      }),
    ]);

  return (
    <Suspense fallback={<ExploreListSkeleton length={9} />}>
      <BlueprintsTabContentInner
        address={address}
        activeTab={activeTab}
        searchParams={searchParams}
        availableBlueprints={availableBlueprints}
        mintedBlueprints={mintedBlueprints}
        blueprintsCreated={blueprintsCreated}
      />
    </Suspense>
  );
}
