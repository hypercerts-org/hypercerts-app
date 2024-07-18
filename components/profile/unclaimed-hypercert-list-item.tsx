import { AllowListRecord } from "@/allowlists/getAllowListRecordsForAddress";
import Image from "next/image";
import UnclaimedHypercertClaimButton from "./unclaimed-hypercert-claim-button";
import TimeFrame from "../hypercert/time-frame";
import { getHypercert } from "@/hypercerts/getHypercert";

export default async function UnclaimedHypercertListItem({
  allowListRecordFragment: allowListRecord,
}: {
  allowListRecordFragment: AllowListRecord;
}) {
  const hypercertId = allowListRecord.hypercert_id;
  if (!hypercertId) {
    return null;
  }

  const hypercert = await getHypercert(hypercertId);
  if (!hypercert) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Image
          src={`/api/hypercerts/${hypercertId}/image`}
          alt={hypercert?.metadata?.name || ""}
          className="object-cover object-top w-[100px] h-[100px]"
          width={100}
          height={100}
        />

        <div className="flex flex-col justify-center">
          <h6 className="text-lg font-semibold">
            {hypercert?.metadata?.name || "Untitled"}
          </h6>
          <TimeFrame
            from={hypercert?.metadata?.work_timeframe_from}
            to={hypercert?.metadata?.work_timeframe_to}
          />
        </div>

        <div className="flex-grow" />

        <UnclaimedHypercertClaimButton allowListRecord={allowListRecord} />
      </div>
    </div>
  );
}
