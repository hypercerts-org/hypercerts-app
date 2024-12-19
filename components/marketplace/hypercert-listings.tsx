import PageSkeleton from "@/components/hypercert/page-skeleton";
import { LISTINGS_PER_PAGE } from "@/configs/ui";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import {
  getAllListings,
  GetAllListingsParams,
} from "@/marketplace/getAllListings";
import { cache, Suspense } from "react";
import { InfoSection } from "../global/sections";
import Pagination from "../global/pagination/pagination";
import HypercertListingsTable from "./hypercert-listings-table";

function ListingsListNoResults() {
  return "No listings found";
}

function ListingsListLoadError() {
  return <InfoSection>We couldn&apos;t find any listings...</InfoSection>;
}

const getListingsData = cache(async (params: GetAllListingsParams) => {
  const listings = await getAllListings(params);
  return listings;
});

export default async function HypercertListings({
  hypercertId,
  initialHypercert,
  searchParams,
  invalidated,
}: {
  hypercertId: string;
  initialHypercert: HypercertFull;
  searchParams: Record<string, string>;
  invalidated: boolean;
}) {
  const currentPage = Number(searchParams?.listings) || 1;
  const offset = Math.max(0, LISTINGS_PER_PAGE * (currentPage - 1));

  const orders = await getListingsData({
    filter: {
      hypercertId,
      invalidated,
    },
    first: LISTINGS_PER_PAGE,
    offset: offset,
  });

  if (!orders || orders.data.length === 0) {
    return <ListingsListNoResults />;
  }

  if (!orders) {
    return <ListingsListLoadError />;
  }

  if (!orders.count || orders.count === 0) {
    return <ListingsListNoResults />;
  }

  return (
    <div className="w-full">
      <Suspense fallback={<PageSkeleton />}>
        <HypercertListingsTable
          orders={orders.data}
          hypercertId={hypercertId}
          initialHypercert={initialHypercert}
          searchParams={searchParams}
        />
        <Pagination
          searchParams={searchParams}
          totalItems={orders.count}
          itemsPerPage={LISTINGS_PER_PAGE}
          basePath={`/hypercerts/${hypercertId}`}
          parameterName="listings"
          currentPage={currentPage}
        />
      </Suspense>
    </div>
  );
}
