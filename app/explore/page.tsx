import { Suspense } from "react";
import ExploreFiltersLayout from "@/components/explore/explore-filters-layout";
import ExploreList from "@/components/explore/explore-list";
import ExploreSearchBar from "@/components/explore/explore-search-bar";
import { Metadata } from "next";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import { HYPERCERTS_PER_PAGE } from "@/configs/ui";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "The best place to discover and contribute to hypercerts and hyperboards.",
};

export default async function ExplorePage(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  return (
    <main className="flex flex-col p-8 md:px-24 pt-8 pb-24 space-y-4 flex-1 container max-w-screen-2xl">
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight w-full">
        Explore
      </h1>
      <section className="flex flex-col lg:flex-row gap-4 justify-between max-w-screen">
        <ExploreSearchBar />
        <ExploreFiltersLayout />
      </section>
      <Suspense
        key={new URLSearchParams(searchParams).toString()}
        fallback={<ExploreListSkeleton length={HYPERCERTS_PER_PAGE} />}
      >
        <ExploreList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
