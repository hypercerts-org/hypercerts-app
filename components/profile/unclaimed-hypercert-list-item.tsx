import { FragmentOf, readFragment } from "../../lib/graphql";

import { AllowListRecordFragment } from "../../allowlists/getAllowListRecordsForAddress";
import Image from "next/image";
import UnclaimedHypercertClaimButton from "./unclaimed-hypercert-claim-button";
import WorkTimeFrame from "../hypercert/time-frame";
import { getHypercert } from "../../hypercerts/getHypercert";

export default async function UnclaimedHypercertListItem({
  allowListRecordFragment,
}: {
  allowListRecordFragment: FragmentOf<typeof AllowListRecordFragment>;
}) {
  const allowListRecord = readFragment(
    AllowListRecordFragment,
    allowListRecordFragment,
  );

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
          <p>{hypercert?.metadata?.name || "Untitled"}</p>
          <WorkTimeFrame hypercert={hypercert} />
        </div>

        <div className="flex-grow" />

        <UnclaimedHypercertClaimButton allowListRecord={allowListRecord} />
      </div>
    </div>
  );
}
