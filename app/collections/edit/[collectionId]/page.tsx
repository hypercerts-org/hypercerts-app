import {
  CollectionForm,
  CollectionCreateFormValues,
} from "@/components/collections/collection-form";
import { getCollectionById } from "@/collections/getCollectionById";

const EditCollectionPage = async ({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) => {
  const data = await getCollectionById(collectionId);

  if (!data) {
    return null;
  }

  const prefilledValues: CollectionCreateFormValues = {
    id: collectionId,
    collectionId: data.sections.data[0].collection.id,
    title: data.name,
    description: data.sections.data[0].collection.description,
    borderColor: data.tile_border_color || "#000000",
    backgroundImg: data.background_image || "",
    hypercerts:
      data.sections.data[0].entries?.map((hc) => ({
        hypercertId: hc.id,
        factor: hc.display_size,
        id: hc.id,
      })) || [],
    newHypercertId: "",
    newFactor: 1,
  };

  return (
    <main className="flex flex-col p-8 md:p-24 pb-24 space-y-4 container max-w-6xl">
      <div className="w-full">
        <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full mb-3">
          Edit collection
        </h1>
        <CollectionForm presetValues={prefilledValues} />
      </div>
    </main>
  );
};

export default EditCollectionPage;
