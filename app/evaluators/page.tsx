import { Suspense } from "react";
import EvaluatorsList from "../../components/evaluators/evaluators-list";
import EvaluatorsListSkeleton from "../../components/evaluators/evaluators-list-skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evaluators",
  description:
    "Hypercerts trusted evaluators attest to the correctness of hypercerts.",
};

export default async function EvaluatorsPage(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  return (
    <main className="flex flex-col p-8 md:px-24 pt-8 pb-24 md:pb-6 space-y-4 flex-1 container max-w-3xl">
      <h1 className="font-serif text-3xl lg:text-5xl tracking-tight">
        Evaluators
      </h1>
      <Suspense fallback={<EvaluatorsListSkeleton />}>
        <EvaluatorsList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
