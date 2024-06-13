import { getEvaluatorAttestationsCount } from "../../attestations/getEvaluatorAttestationsCount";

export default async function EvaluationsCount({
  address,
}: {
  address: string;
}) {
  const count = await getEvaluatorAttestationsCount(address);

  if (!count) return <div>0</div>;

  return <div>{count}</div>;
}
