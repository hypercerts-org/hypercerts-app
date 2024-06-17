import { EvaluationStates } from "./types/evaluation-states.type";

export function evaluationStateToUint8(state: EvaluationStates): number {
  switch (state) {
    case "not-evaluated":
      return 0;
    case "valid":
      return 1;
    case "invalid":
      return 2;
  }
}
