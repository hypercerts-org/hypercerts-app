import Comments from "./evaluations-list-item/comments";
import { EvaluationData } from "../../eas/types/evaluation-data.type";
import Evaluations from "./evaluations-list-item/evaluations";
import FormattedDate from "../formatted-date";
import HypercertRow from "./evaluations-list-item/hypercert-row";
import Link from "next/link";
import Tags from "./evaluations-list-item/tags";

export default function EvaluatorEvaluationsListItem({
  blockTimestamp,
  data,
}: {
  blockTimestamp: string | null | undefined;
  data: EvaluationData;
}) {
  const hypercertId = `${data.chain_id}-${data.contract_address}-${data.token_id}`;
  return (
    <Link href={`/hypercerts/${hypercertId}`}>
      <FormattedDate seconds={blockTimestamp} />
      <HypercertRow hypercertId={hypercertId} />
      <Evaluations
        basic={data.evaluate_basic}
        work={data.evaluate_work}
        properties={data.evaluate_properties}
        contributors={data.evaluate_contributors}
      />
      <Tags tags={data.tags} />
      <Comments comments={data.comments} />
    </Link>
  );
}
