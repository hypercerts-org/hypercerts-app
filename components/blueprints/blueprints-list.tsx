import { BlueprintFragment } from "@/blueprints/blueprint.fragment";
import Image from "next/image";
import TimeFrame from "@/components/hypercert/time-frame";
import { HypercertFormValues } from "@/components/hypercert/hypercert-minting-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUnixTime } from "date-fns";

export const BlueprintsList = ({
  blueprints,
}: {
  blueprints: readonly BlueprintFragment[];
}) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-4">
      {blueprints.map((blueprint, i) => (
        <BlueprintListItem blueprint={blueprint} key={i} />
      ))}
    </div>
  );
};

const BlueprintListItem = ({ blueprint }: { blueprint: BlueprintFragment }) => {
  const formValues = blueprint.form_values as HypercertFormValues;
  return (
    <div>
      <div className="flex items-center gap-2">
        <Image
          src={formValues.cardImage || ""}
          alt={formValues.title || ""}
          className="object-cover object-top w-[100px] h-[100px]"
          width={100}
          height={100}
        />

        <div className="flex flex-col justify-center">
          <h6 className="text-lg font-semibold">
            {formValues?.title || "Untitled"}
          </h6>
          <TimeFrame
            from={getUnixTime(
              new Date(formValues.projectDates.from),
            ).toString()}
            to={getUnixTime(new Date(formValues.projectDates.to)).toString()}
          />
        </div>

        <div className="flex-grow" />

        {!blueprint.minted && (
          <Button asChild>
            <Link href={`/hypercerts/new?blueprintId=${blueprint.id}`}>
              Claim
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default BlueprintsList;
