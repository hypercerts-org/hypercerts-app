import { Circle, CircleCheck } from "lucide-react";

import { FormattedUnits } from "../formatted-units";
import { cn } from "@/lib/utils";
import { round } from "remeda";

type Fraction = {
  units: string | null | undefined;
  fraction_id: string | null;
};

export default function ListFractionSelect({
  fraction,
  units,
  selected,
  setSelected,
}: {
  fraction: Fraction;
  units: bigint;
  selected: boolean;
  setSelected: (fractionId: string) => void;
}) {
  if (!fraction.fraction_id) return;

  const fractionUnits = BigInt(fraction.units || "0");
  const fractionId =
    fraction.fraction_id.slice(0, 3) + "..." + fraction.fraction_id.slice(-3);
  const fractionShare = round(Number((fractionUnits / units) * BigInt(100)), 2);

  return (
    <tr
      onClick={() => setSelected(fraction.fraction_id || "")}
      className={cn(
        "h-12 border border-gray-200 rounded-2xl hover:bg-gray-100 text-sm",
        selected && "",
      )}
    >
      <td className="pl-3">{selected ? <CircleCheck /> : <Circle />}</td>
      <td>{fractionId}</td>
      <td>
        <FormattedUnits>{fractionUnits.toString()}</FormattedUnits>
      </td>
      <td className="pr-3">{fractionShare}%</td>
    </tr>
  );
}
