import { Suspense } from "react";
import { getCollectionsByAdminAddress } from "@/collections/getCollectionsByAdminAddress";
import { COLLECTIONS_PER_PAGE } from "@/configs/ui";
import CollectionsTabContent from "./collections-tab-content.client";
import CollectionsTabSkeleton from "@/components/profile/collections-tab-skeleton";

export default async function CollectionsTabContentServer({
  address,
  searchParams,
}: {
  address: string;
  searchParams: Record<string, string>;
}) {
  const currentPage = Number(searchParams?.p) || 1;

  // Fetch data server-side
  const result = await getCollectionsByAdminAddress({
    adminAddress: address,
    first: COLLECTIONS_PER_PAGE,
    offset: COLLECTIONS_PER_PAGE * (currentPage - 1),
  });

  if (!result) return null;

  const { hyperboards, count } = result;

  // Render client component with fetched data
  return (
    <Suspense fallback={<CollectionsTabSkeleton length={3} />}>
      <CollectionsTabContent
        address={address}
        hyperboards={hyperboards}
        count={count ?? 0}
      />
    </Suspense>
  );
}
