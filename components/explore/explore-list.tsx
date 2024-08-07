import {
  GetAllHypercertsParams,
  getAllHypercerts,
  isClaimsFilter,
  isClaimsOrderBy,
} from "@/hypercerts/getAllHypercerts";
import { HypercertMiniDisplayProps } from "@/components/hypercert/hypercert-mini-display";

import ExploreListSkeleton from "./explore-list-skeleton";
import ExplorePagination from "./explore-pagination";
import { HYPERCERTS_PER_PAGE } from "@/configs/ui";
import { InfoSection } from "@/app/profile/[address]/sections";
import { Suspense } from "react";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { type SupportedChainIdType } from "@/lib/constants";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import { formatPrice, getPricePerPercent } from "@/marketplace/utils";

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
  const filter = searchParams?.filter;
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
  if (isClaimsFilter(filter)) {
    params.filter = filter;
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
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-4">
        {hypercerts?.data?.map((hypercert) => {
          const percentAvailable = calculateBigIntPercentage(
            hypercert.orders?.totalUnitsForSale,
            hypercert.units,
          );
          const lowestPrice =
            hypercert?.orders?.cheapestOrder && hypercert
              ? formatPrice(
                  hypercert.orders.cheapestOrder.chainId,
                  getPricePerPercent(
                    hypercert.orders.cheapestOrder.price,
                    BigInt(hypercert.units || "0"),
                  ),
                  hypercert.orders.cheapestOrder.currency,
                )
              : "0";

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
          return <HypercertWindow {...props} key={hypercert.hypercert_id} />;
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
    <Suspense
      fallback={<ExploreListSkeleton length={HYPERCERTS_PER_PAGE} />}
      key={suspenseKey}
    >
      <ExploreListInner {...{ searchParams }} />
    </Suspense>
  );
}
