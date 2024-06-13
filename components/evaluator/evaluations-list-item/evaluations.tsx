import { CheckCircle, MinusCircle } from "lucide-react";
import { fromBytes, hexToString } from "viem";

function EvaluationSymbols({ value }: { value: number }) {
  return (
    <div className="flex gap-2">
      <CheckCircle
        style={{
          color: value === 1 ? "limegreen" : "gray",
        }}
      />
      <MinusCircle
        style={{
          color: value === 2 ? "red" : "gray",
        }}
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
        <div className="flex justify-between w-full items-center">
          <span>Basic</span>
          <EvaluationSymbols value={basic} />
        </div>
      )}
      {work !== undefined && work > 0 && (
        <div className="flex justify-between w-full items-center">
          <span>Work</span>
          <EvaluationSymbols value={work} />
        </div>
      )}
      {properties !== undefined && properties > 0 && (
        <div className="flex justify-between w-full items-center">
          <span>Properties</span>
          <EvaluationSymbols value={properties} />
        </div>
      )}
      {contributors !== undefined && contributors > 0 && (
        <div className="flex justify-between w-full items-center">
          <span>Contributors</span>
          <EvaluationSymbols value={contributors} />
        </div>
      )}
    </div>
  );
}
