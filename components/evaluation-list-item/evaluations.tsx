import { Ban, Check } from "lucide-react";

import { cn } from "../../lib/utils";

function EvaluationSymbols({ value }: { value: number }) {
  return (
    <div className="flex gap-2">
      <Check
        className={cn(
          "text-white w-7 h-7 p-1 rounded-sm",
          value === 1 ? "bg-black" : "bg-gray-200"
        )}
        strokeWidth={3}
      />
      <Ban
        className={cn(
          "text-white w-7 h-7 p-1 rounded-sm",
          value === 2 ? "bg-black" : "bg-gray-200"
        )}
      />
    </div>
  );
}

export default function Evaluations({
  basic,
  work,
  properties,
  contributors,
  ...props
}: {
  basic?: number;
  work?: number;
  properties?: number;
  contributors?: number;
  [key: string]: any;
}) {
  return (
    <div className="flex flex-col items-start w-full" {...props}>
      {basic !== undefined && basic > 0 && (
        <div className="flex justify-between w-full items-center pb-2">
          <span>Basic</span>
          <EvaluationSymbols value={basic} />
        </div>
      )}
      {work !== undefined && work > 0 && (
        <div className="flex justify-between w-full items-center pb-2">
          <span>Work</span>
          <EvaluationSymbols value={work} />
        </div>
      )}
      {properties !== undefined && properties > 0 && (
        <div className="flex justify-between w-full items-center pb-2">
          <span>Properties</span>
          <EvaluationSymbols value={properties} />
        </div>
      )}
      {contributors !== undefined && contributors > 0 && (
        <div className="flex justify-between w-full items-center pb-2">
          <span>Contributors</span>
          <EvaluationSymbols value={contributors} />
        </div>
      )}
    </div>
  );
}
