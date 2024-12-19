import { use, cache } from "react";
import {
  GetAllHypercertsParams,
  getAllHypercerts,
  isClaimsFilter,
  isClaimsOrderBy,
} from "@/hypercerts/getAllHypercerts";
import { HYPERCERTS_PER_PAGE } from "@/configs/ui";
import { InfoSection } from "@/components/global/sections";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import Pagination from "../global/pagination/pagination";

function HypercertsListNoResults() {
  return "No results found";
}

function HypercertsListLoadError() {
  return <InfoSection>We couldn&apos;t find any hypercerts...</InfoSection>;
}

const getHypercertsData = cache(async (params: GetAllHypercertsParams) => {
  const hypercerts = await getAllHypercerts(params);
  return hypercerts;
});

export default function ExploreList({
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
    chainId: chain || undefined,
    search: search || undefined,
    filter: isClaimsFilter(filter) ? filter : undefined,
    orderBy: isClaimsOrderBy(orderBy) ? orderBy : undefined,
  };

  const hypercerts = use(getHypercertsData(params));
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
        {hypercerts?.data?.map((hypercert) => (
          <HypercertWindow
            key={hypercert.hypercert_id}
            hypercert={hypercert}
            priceDisplayCurrency={displayCurrency}
          />
        ))}
      </div>
      <Pagination
        searchParams={searchParams}
        totalItems={hypercerts.count}
        itemsPerPage={HYPERCERTS_PER_PAGE}
        basePath="/explore"
      />
    </div>
  );
}
