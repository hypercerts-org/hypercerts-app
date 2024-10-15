import { Suspense } from "react";
import { HyperboardWidget } from "@/components/hyperboard/hyperboardWidget";
import { getCollectionById } from "@/collections/getCollectionById";

const CollectionPageInner = async ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const data = await getCollectionById(collectionId);

  if (!data) {
    return <div>Collection not found</div>;
  }

  return (
    <div>
      <h3 className="text-2xl font-medium">{data.name}</h3>
      <p className="text-sm text-slate-500 pb-2">
        {data.sections.data[0].collection.description}
      </p>

      <div className="pt-8 justify-center flex w-full">
        <div className="w-full">
          <HyperboardWidget hyperboardId={collectionId} showTable />
        </div>
      </div>
    </div>
  );
};

export default async function CollectionPage({
  params,
}: {
  params: {
    collectionId: string;
  };
}) {
  return (
    <main className="flex flex-col p-8 md:p-24 pb-24 space-y-4">
      <Suspense fallback={"Loading"}>
        <CollectionPageInner collectionId={params.collectionId} />
      </Suspense>
    </main>
  );
}
