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

function HypercertsListNoResults() {
  return "No results found";
}

function HypercertsListLoadError() {
  return "Unable to load hypercerts";
}

async function ExploreListInner({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const currentPage = Number(searchParams?.p) || 1;
  const chainId = Number(searchParams?.chain);
  const search = searchParams?.search;
  const orderBy = searchParams?.orderBy;
  const params: GetAllHypercertsParams = {
    first: HYPERCERTS_PER_PAGE,
    offset: HYPERCERTS_PER_PAGE * (currentPage - 1),
  };
  if (chainId) {
    params.chainId = chainId;
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
          const props: HypercertMiniDisplayProps = {
            hypercertId: hypercert.hypercert_id as string,
            name: hypercert.metadata?.name as string,
            chainId: Number(hypercert.contract?.chain_id),
            attestations: hypercert.attestations,
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
