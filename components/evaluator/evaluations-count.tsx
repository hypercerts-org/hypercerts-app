import { getEvaluatorAttestationsCount } from "@/attestations/getEvaluatorAttestationsCount";
import CountBadge from "@/components/count-badge";

export default async function EvaluationsCount({
  address,
}: {
  address: string;
}) {
  const count = await getEvaluatorAttestationsCount(address);

  return <CountBadge count={count} />;
}
