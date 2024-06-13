import { EvaluationData } from "../../eas/types/evaluation-data.type";
import EvaluatorEvaluationsListItem from "./evaluator-evaluations-list-item";
import EvaluatorEvaluationsListSkeleton from "./evaluator-evaluations-list-skeleton";
import { Suspense } from "react";
import { getEvaluatorAttestations } from "../../attestations/getEvaluatorAttestations";

async function EvaluatorEvaluationsListInner({ address }: { address: string }) {
  const attestations = await getEvaluatorAttestations(address);

  if (!attestations) {
    return <div>No evaluations found.</div>;
  }

  return (
    <div>
      {attestations.data.map((attestation, i) => {
        if (!attestation) return null;
        return (
          <EvaluatorEvaluationsListItem
            key={i}
            data={attestation.data as EvaluationData}
            blockTimestamp={attestation.block_timestamp}
          />
        );
      })}
    </div>
  );
}

export default async function EvaluatorEvaluationsList({
  address,
}: {
  address: string;
}) {
  return (
    <Suspense fallback={<EvaluatorEvaluationsListSkeleton />} key={address}>
      <EvaluatorEvaluationsListInner {...{ address }} />
    </Suspense>
  );
}
