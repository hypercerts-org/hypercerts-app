import ExploreChainFilterSelect from "@/components/explore/explore-chain-filter-select";
import ExploreEvaluationsFilterSelect from "../../components/explore/explore-evaluations-filter-select";
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
    <main className="flex flex-col p-8 md:px-24 pt-8 pb-24 space-y-4 flex-1 container max-w-screen-2xl">
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full">
        Explore
      </h1>
      <section className="flex flex-col gap-4 justify-between">
        <div className="flex space-x-2">
          <ExploreSearchBar />
          <ExploreChainFilterSelect />
          <ExploreEvaluationsFilterSelect />
          <ExploreOrderBySelect />
        </div>
      </section>
      <div className="max-w-screen-xl">
        <ExploreList {...{ searchParams }} />
      </div>
    </main>
  );
}
