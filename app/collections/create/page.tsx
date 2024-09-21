import { CollectionForm } from "@/components/collections/collection-form";

const CreateCollectionPage = async () => {
  return (
    <main className="flex flex-col p-8 md:p-24 pb-24 space-y-4 container max-w-6xl">
      <div className="w-full">
        <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full mb-3">
          New collection
        </h1>
        <CollectionForm />
      </div>
    </main>
  );
};

export default CreateCollectionPage;