import { Ban, Check } from "lucide-react";

import { Button } from "../ui/button";
import { EvaluationStates } from "../../eas/types/evaluation-states.type";
import { cn } from "../../lib/utils";

export default function EvaluateToggle({
  state,
  setState,
}: {
  state?: EvaluationStates;
  setState: (state: EvaluationStates) => void;
}) {
  const handleClick = (s: EvaluationStates) => {
    if (state === s) {
      setState("not-evaluated");
    } else {
      setState(s);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleClick("valid")}
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", state === "valid" ? "bg-black" : "bg-accent")}
      >
        <Check className="text-white w-5 h-5" strokeWidth={3} />
      </Button>
      <Button
        onClick={() => handleClick("invalid")}
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7",
          state === "invalid" ? "bg-black" : "bg-accent",
        )}
      >
        <Ban className="text-white w-5 h-5" strokeWidth={3} />
      </Button>
    </div>
  );
}
