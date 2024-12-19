import Comments from "../evaluation-list-item/comments";
import EnsName from "../ens-name";
import EthAddress from "../eth-address";
import { EvaluationData } from "../../eas/types/evaluation-data.type";
import Evaluations from "../evaluation-list-item/evaluations";
import FormattedDate from "../formatted-date";
import Link from "next/link";
import Tags from "../evaluation-list-item/tags";
import { UserIcon } from "../user-icon";
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
    <div className="flex flex-wrap justify-start gap-4">
      {initialEvaluations.data.map((attestation) => {
        if (!attestation) return null;
        const data = attestation.data as EvaluationData;
        const attester = attestation.attester;

        if (!attester) return null;

        return (
          <div
            key={attestation.uid}
            className="p-4 flex flex-col gap-3 rounded-lg border border-slate-200 w-[280px]"
          >
            <FormattedDate seconds={attestation.creation_block_timestamp} />

            <Link
              href={`/evaluators/${attestation.attester}`}
              className="w-full"
            >
              <div className="flex items-center gap-2 w-full">
                <UserIcon address={attester} size="small" />
                <div className="flex flex-col justify-center items-start overflow-hidden">
                  <EnsName
                    address={attester}
                    className="text-sm font-semibold truncate"
                  />
                  <EthAddress address={attester} />
                </div>
              </div>
            </Link>
            <div className="flex flex-col flex-grow gap-2">
              <Evaluations
                basic={data.evaluate_basic}
                work={data.evaluate_work}
                properties={data.evaluate_properties}
                contributors={data.evaluate_contributors}
              />
              <Tags tags={data.tags} />
              <div className="flex-grow flex flex-col">
                <Comments comments={data.comments} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
