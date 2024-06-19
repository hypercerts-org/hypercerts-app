import {
  GetAllHypercertsParams,
  getAllHypercerts,
  isClaimsOrderBy,
} from "@/hypercerts/getAllHypercerts";
import HypercertMiniDisplay, {
  HypercertMiniDisplayProps,
} from "@/components/hypercert/hypercert-mini-display";

import ExploreListSkeleton from "./explore-list-skeleton";
import ExplorePagination from "./explore-pagination";
import { HYPERCERTS_PER_PAGE } from "@/configs/ui";
import { Suspense } from "react";
import { InfoSection } from "@/app/profile/[address]/sections";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { formatEther } from "viem";

function HypercertsListNoResults() {
  return "No results found";
}

function HypercertsListLoadError() {
  return <InfoSection>We couldn&apos;t find any hypercerts...</InfoSection>;
}

async function ExploreListInner({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const currentPage = Number(searchParams?.p) || 1;
  const chain = Number(searchParams?.chain);
  const search = searchParams?.search;
  const orderBy = searchParams?.orderBy;
  const params: GetAllHypercertsParams = {
    first: HYPERCERTS_PER_PAGE,
    offset: HYPERCERTS_PER_PAGE * (currentPage - 1),
  };
  if (chain) {
    params.chainId = chain;
  }
  if (search) {
    params.search = search;
  }
  if (isClaimsOrderBy(orderBy)) {
    params.orderBy = orderBy;
  }
  const hypercerts = await getAllHypercerts(params);

  if (!hypercerts) {
    return <HypercertsListLoadError />;
  }

  if (!hypercerts.count || hypercerts.count === 0) {
    return <HypercertsListNoResults />;
  }

  return (
    <div className="flex flex-col gap-5">
      {search && (
        <div>
          Showing search results for: <b>{search}</b>
        </div>
      )}
      <div className="flex flex-row flex-wrap gap-5 justify-center md:justify-start">
        {hypercerts?.data?.map((hypercert) => {
          const percentAvailable = calculateBigIntPercentage(
            hypercert.orders?.totalUnitsForSale,
            hypercert.units,
          );
          const unitsPerPercent = BigInt(hypercert.units || 0) / BigInt(100);
          const lowestPricePerPercent =
            unitsPerPercent *
            BigInt(hypercert.orders?.lowestAvailablePrice || 0);
          const props: HypercertMiniDisplayProps = {
            hypercertId: hypercert.hypercert_id as string,
            name: hypercert.metadata?.name as string,
            chainId: Number(hypercert.contract?.chain_id),
            attestations: hypercert.attestations,
            lowestPrice: formatEther(lowestPricePerPercent),
            percentAvailable,
          };
          return (
            <HypercertMiniDisplay {...props} key={hypercert.hypercert_id} />
          );
        })}
      </div>
      <ExplorePagination
        searchParams={searchParams}
        hypercertsCount={hypercerts.count}
      />
    </div>
  );
}

export default async function ExploreList({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const suspenseKey = new URLSearchParams(searchParams).toString();
  return (
    <Suspense fallback={<ExploreListSkeleton />} key={suspenseKey}>
      <ExploreListInner {...{ searchParams }} />
    </Suspense>
  );
}
