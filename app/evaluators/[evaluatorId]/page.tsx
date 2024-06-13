import EvaluatorDetail from "../../../components/evaluator/evaluator-detail";
import PageSkeleton from "../../../components/hypercert/page-skeleton";
import { Suspense } from "react";

export default async function EvaluatorPage({
  params,
}: {
  params: { evaluatorId: string };
}) {
  return (
    <main className="flex flex-col p-8 md:p-24 pb-24 space-y-4">
      <section>
        <Suspense fallback={<PageSkeleton />}>
          <EvaluatorDetail evaluatorId={params.evaluatorId} />
        </Suspense>
      </section>
    </main>
  );
}
