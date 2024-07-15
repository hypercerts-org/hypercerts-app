import Comments from "../evaluation-list-item/comments";
import EnsName from "../ens-name";
import EthAddress from "../eth-address";
import { EvaluationData } from "../../eas/types/evaluation-data.type";
import Evaluations from "../evaluation-list-item/evaluations";
import FormattedDate from "../formatted-date";
import { HypercertFull } from "../../hypercerts/fragments/hypercert-full.fragment";
import Link from "next/link";
import { Separator } from "../ui/separator";
import Tags from "../evaluation-list-item/tags";
import { UserIcon } from "../user-icon";

export default async function EvaluationsList({
  hypercert,
}: {
  hypercert: HypercertFull;
}) {
  const attestations = hypercert.attestations?.data;

  if (!attestations || attestations.length === 0) {
    return <div>This Hypercert has not yet been evaluated.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {attestations.map((attestation, index) => {
        if (!attestation.attester) return null;
        const data: EvaluationData = attestation.data as EvaluationData;
        return (
          <div key={attestation.uid} className="pb-5 flex flex-col gap-5">
            <FormattedDate seconds={attestation.creation_block_timestamp} />

            <Link
              href={`/evaluators/${attestation.attester}`}
              className="w-full"
            >
              <div className="flex gap-2 w-full">
                <UserIcon address={attestation.attester} size="large" />
                <div className="flex flex-col justify-center items-start w-52">
                  <EnsName address={attestation.attester} />
                  <EthAddress address={attestation.attester} />
                </div>
              </div>
            </Link>
            <Evaluations
              basic={data.evaluate_basic}
              work={data.evaluate_work}
              properties={data.evaluate_properties}
              contributors={data.evaluate_contributors}
            />
            <Tags tags={data.tags} />
            <Comments comments={data.comments} />
            {index < attestations.length - 1 && <Separator />}
          </div>
        );
      })}
    </div>
  );
}
