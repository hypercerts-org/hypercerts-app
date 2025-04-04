import { EvaluationData } from "@/eas/types/evaluation-data.type";

export type EvaluationStatus =
  | "unverified"
  | "verified"
  | "disputed"
  | "conflicting";

function countEvaluationValue(data: EvaluationData, value: number): number {
  let count = 0;
  if (data.evaluate_basic === value) {
    count++;
  }
  if (data.evaluate_work === value) {
    count++;
  }
  if (data.evaluate_contributors === value) {
    count++;
  }
  return count;
}

export type HypercertAttestations = {
  data:
    | {
        data: unknown;
      }[]
    | null;
  count: number | null;
} | null;

export function getEvaluationStatus(
  hypercertAttestations: HypercertAttestations,
): EvaluationStatus {
  if (!hypercertAttestations || hypercertAttestations.count === 0) {
    return "unverified";
  }

  const attestations = hypercertAttestations.data;

  if (!attestations || attestations.length === 0) {
    return "unverified";
  }

  let evaluationStatus: EvaluationStatus = "unverified";

  for (const attestation of attestations) {
    const data: EvaluationData = attestation.data as EvaluationData;

    const approvedCount = countEvaluationValue(data, 1);
    const notApprovedCount = countEvaluationValue(data, 2);

    if (approvedCount === 3) {
      if (evaluationStatus === "unverified") {
        evaluationStatus = "verified";
      } else if (evaluationStatus === "disputed") {
        evaluationStatus = "conflicting";
        break;
      }
    } else if (notApprovedCount === 3) {
      if (evaluationStatus === "verified") {
        evaluationStatus = "conflicting";
        break;
      }
      evaluationStatus = "disputed";
    } else if (approvedCount > 0 && notApprovedCount > 0) {
      evaluationStatus = "conflicting";
      break;
    }
  }

  return evaluationStatus;
}
