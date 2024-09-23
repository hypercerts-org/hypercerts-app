import { CollectionForm } from "@/components/collections/collection-form";

const CreateCollectionPage = () => {
  return (
    <main className="flex flex-col p-8 md:p-24 pb-24 space-y-4 container max-w-6xl">
      <div className="w-full">
        <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full mb-1">
          New collection
        </h1>
        <h4 className="mb-3 opacity-50">
          All fields and settings can be edited afterwards
        </h4>
        <CollectionForm />
      </div>
    </main>
  );
};

export default CreateCollectionPage;
