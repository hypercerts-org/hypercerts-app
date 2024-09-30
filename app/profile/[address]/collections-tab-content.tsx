import { getCollectionsByAdminAddress } from "@/collections/getCollectionsByAdminAddress";
import { EmptySection } from "@/app/profile/[address]/sections";
import { HyperboardRow } from "@/components/hyperboard/hyperboard-row";
import { Suspense } from "react";
import { defaultDescription } from "@/app/profile/[address]/tabs";
import { CreateCollectionButton } from "@/components/collections/buttons";
import { COLLECTIONS_PER_PAGE } from "@/configs/ui";
import CollectionPagination from "@/components/collections/collection-pagination";

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

  const { hyperboards, count } = result;

  if (!hyperboards?.length) {
    return (
      <div>
        <div className="flex justify-end mb-2">
          <CreateCollectionButton />
        </div>
        <EmptySection>
          <p>
            No collections yet. If you want to create a collection, please reach
            out to{" "}
            <a href="mailto:team@hypercerts.org" className="underline">
              team@hypercerts.org
            </a>
          </p>
        </EmptySection>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <CreateCollectionButton />
      </div>
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

      <div className="mt-5">
        <CollectionPagination collectionsCount={count || 0} />
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
