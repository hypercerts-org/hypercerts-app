import { Suspense } from "react";
import { getHypercertAttestations } from "../../attestations/getHypercertAttestations";

async function EvaluationsListInner({ hypercertId }: { hypercertId: string }) {
  const attetstations = await getHypercertAttestations(hypercertId);

  if (!attetstations) {
    return <div>No attestations found</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {attetstations.data.map((attestation) => (
        <div key={attestation.id}>
          <div className="flex items-center gap-2">
            <div className="flex-grow">
              <p className="text-sm text-gray-700 font-medium">
                {attestation.attester}
              </p>
            </div>
            <div className="flex-grow">
              <p className="text-sm text-gray-700 font-medium">
                {attestation.block_timestamp}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EvaluationsList({
  hypercertId,
}: {
  hypercertId: string;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EvaluationsListInner hypercertId={hypercertId} />
    </Suspense>
  );
}
