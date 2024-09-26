import { ATTESTORS_PER_PAGE } from "../../configs/ui";
import EvaluatorsListRow from "./evaluators-list-row";
import EvaluatorsListSkeleton from "./evaluators-list-skeleton";
import EvaluatorsPagination from "./evaluators-pagination";
import { Suspense } from "react";
import { getTrustedAttestors } from "../../github/getTrustedAttestors";

async function EvaluatorsListInner({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const attestors = await getTrustedAttestors();
  const currentPage = Number(searchParams?.p) || 1;

  return (
    <section className="h-full flex flex-col space-y-8 items-center">
      <section className="w-full">
        {attestors
          .slice(
            (currentPage - 1) * ATTESTORS_PER_PAGE,
            currentPage * ATTESTORS_PER_PAGE,
          )
          .map((attestor, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-slate-700 font-medium"
            >
              <EvaluatorsListRow attestor={attestor} />{" "}
            </div>
          ))}
      </section>
      <EvaluatorsPagination
        searchParams={searchParams}
        attestorsCount={attestors.length}
      />
    </section>
  );
}

export default async function EvaluatorsList({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const currentPage = Number(searchParams?.p) || 1;
  return (
    <Suspense fallback={<EvaluatorsListSkeleton />} key={currentPage}>
      <EvaluatorsListInner {...{ searchParams }} />
    </Suspense>
  );
}
