import Comments from "@/components/evaluations/evaluation-list-item/comments";
import EnsName from "@/components/ens-name";
import EthAddress from "@/components/eth-address";
import { EvaluationData } from "@/eas/types/evaluation-data.type";
import Evaluations from "@/components/evaluations/evaluation-list-item/evaluations";
import FormattedDate from "@/components/formatted-date";
import Link from "next/link";
import Tags from "@/components/evaluations/evaluation-list-item/tags";
import { UserIcon } from "@/components/user-icon";
import type { AttestationResult } from "@/attestations/fragments/attestation-list.fragment";

interface EvaluationsListProps {
  initialEvaluations: {
    count: number;
    data: AttestationResult[];
  };
}

export default async function EvaluationsList({
  initialEvaluations,
}: EvaluationsListProps) {
  if (initialEvaluations.data.length === 0) {
    return <div>This Hypercert has not yet been evaluated.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 pb-4">
        {initialEvaluations.data.map((attestation) => {
          if (!attestation) return null;
          const data = attestation.data as EvaluationData;
          const attester = attestation.attester;

          if (!attester) return null;

          return (
            <div
              key={attestation.uid}
              className="flex-shrink-0 w-[300px] p-4 flex flex-col gap-2 rounded-lg border border-slate-200"
            >
              <div className="flex justify-between items-center">
                <FormattedDate seconds={attestation.creation_block_timestamp} />
                <Link
                  href={`/evaluators/${attestation.attester}`}
                  className="flex items-center gap-2"
                >
                  <UserIcon address={attester} size="small" />
                  <div className="flex flex-col justify-center items-start overflow-hidden">
                    <EnsName
                      address={attester}
                      className="text-sm font-semibold truncate"
                    />
                    <EthAddress
                      address={attester}
                      className="text-xs text-slate-500 truncate"
                    />
                  </div>
                </Link>
              </div>
              <Evaluations
                basic={data.evaluate_basic}
                work={data.evaluate_work}
                properties={data.evaluate_properties}
                contributors={data.evaluate_contributors}
              />
              <Tags tags={data.tags} />
              <div className="mt-2 flex-grow">
                <Comments comments={data.comments} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
