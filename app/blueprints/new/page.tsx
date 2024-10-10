import { HypercertMintingForm } from "@/components/hypercert/hypercert-minting-form";

export default function NewHypercertPage() {
  return (
    <main className="flex flex-col p-8 md:px-16 pt-8 pb-24 space-y-4 flex-1 container max-w-screen-lg">
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full">
        New blueprint
      </h1>
      <div className="p-3"></div>
      <HypercertMintingForm isBlueprint />
    </main>
  );
}
