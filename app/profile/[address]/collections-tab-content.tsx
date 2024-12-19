import { getCollectionsByAdminAddress } from "@/collections/getCollectionsByAdminAddress";
import { Suspense } from "react";
import { COLLECTIONS_PER_PAGE } from "@/configs/ui";
import Pagination from "@/components/global/pagination/pagination";
import { HyperboardsOverview } from "@/app/profile/[address]/collections-tab-content-inner";

const CollectionsTabContentInner = async ({
  address,
  searchParams,
}: {
  address: string;
  searchParams: Record<string, string>;
}) => {
  const currentPage = Number(searchParams?.p) || 1;
  const result = await getCollectionsByAdminAddress({
    adminAddress: address,
    first: COLLECTIONS_PER_PAGE,
    offset: COLLECTIONS_PER_PAGE * (currentPage - 1),
  });

  if (!result) {
    return null;
  }

  const { hyperboards } = result;

  return (
    <div>
      <HyperboardsOverview profileAddress={address} hyperboards={hyperboards} />

      <div className="mt-5">
        <Pagination
          searchParams={searchParams}
          totalItems={result.count || 0}
          itemsPerPage={COLLECTIONS_PER_PAGE}
          basePath={`/profile/${address}/collections`}
        />
      </div>
    </div>
  );
};

const CollectionsTabContent = ({
  address,
  searchParams,
}: {
  address: string;
  searchParams: Record<string, string>;
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollectionsTabContentInner
        address={address}
        searchParams={searchParams}
      />
    </Suspense>
  );
};
export { CollectionsTabContent };
