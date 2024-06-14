import ExploreChainFilterSelect from "@/components/explore/explore-chain-filter-select";
import ExploreList from "@/components/explore/explore-list";
import ExploreOrderBySelect from "@/components/explore/explore-order-by-select";
import ExploreSearchBar from "@/components/explore/explore-search-bar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "The best place to discover and contribute to hypercerts and hyperboards.",
};

export default async function ExplorePageInner({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  return (
    <main className="flex flex-col p-8 md:p-24 pb-24 space-y-4">
      <section>
        <h1 className="font-serif text-3xl lg:text-5xl tracking-tight">
          Explore
        </h1>
        <div className="p-1"></div>
        <p className="md:text-lg">
          The best place to discover and contribute to hypercerts and
          hyperboards.
        </p>
      </section>
      <section className="flex flex-col md:flex-row gap-4">
        <ExploreSearchBar />
        <div className="flex gap-2">
          <ExploreChainFilterSelect />
          <ExploreOrderBySelect />
        </div>
      </section>
      <div className="max-w-screen-xl">
        <ExploreList {...{ searchParams }} />
      </div>
    </main>
  );
}
