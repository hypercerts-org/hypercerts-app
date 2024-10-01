import ExploreFiltersLayout from "@/components/explore/explore-filters-layout";
import ExploreList from "@/components/explore/explore-list";
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
      <section className="flex flex-col lg:flex-row gap-4 justify-between max-w-screen">
        <ExploreSearchBar />
        <ExploreFiltersLayout />
      </section>
      <ExploreList {...{ searchParams }} />
    </main>
  );
}
