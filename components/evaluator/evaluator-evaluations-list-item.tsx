import Comments from "@/components/evaluations/evaluation-list-item/comments";
import { EvaluationData } from "@/eas/types/evaluation-data.type";
import Evaluations from "@/components/evaluations/evaluation-list-item/evaluations";
import FormattedDate from "@/components/formatted-date";
import HypercertRow from "@/components/evaluations/evaluation-list-item/hypercert-row";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import Tags from "@/components/evaluations/evaluation-list-item/tags";

export default function EvaluatorEvaluationsListItem({
  blockTimestamp,
  data,
}: {
  blockTimestamp: string | null | undefined;
  data: EvaluationData;
}) {
  const hypercertId = `${data.chain_id}-${data.contract_address}-${data.token_id}`;
  return (
    <Link href={`/hypercerts/${hypercertId}`} className="flex flex-col gap-5">
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
      <Separator />
    </Link>
  );
}
