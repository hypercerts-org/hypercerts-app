import {
  GetAllHypercertsParams,
  getAllHypercerts,
  isClaimsFilter,
  isClaimsOrderBy,
} from "@/hypercerts/getAllHypercerts";

import ExploreListSkeleton from "./explore-list-skeleton";
import ExplorePagination from "./explore-pagination";
import { HYPERCERTS_PER_PAGE } from "@/configs/ui";
import { InfoSection } from "@/app/profile/[address]/sections";
import { Suspense } from "react";
import HypercertWindow from "@/components/hypercert/hypercert-window";

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
  const displayCurrency = searchParams?.currency;

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
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,_minmax(16.875rem,_18.75rem))] gap-4 py-4">
        {hypercerts?.data?.map((hypercert) => {
          return (
            <HypercertWindow
              key={hypercert.hypercert_id}
              hypercert={hypercert}
              priceDisplayCurrency={displayCurrency}
            />
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
    <Suspense
      fallback={<ExploreListSkeleton length={HYPERCERTS_PER_PAGE} />}
      key={suspenseKey}
    >
      <ExploreListInner {...{ searchParams }} />
    </Suspense>
  );
}
