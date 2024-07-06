import UnclaimedHypercertListItem from "./unclaimed-hypercert-list-item";
import { getAllowListRecordsForAddress } from "@/allowlists/getAllowListRecordsForAddress";

export default async function UnclaimedHypercertsList({
  address,
}: {
  address: string;
}) {
  const allowList = await getAllowListRecordsForAddress(address);

  // TODO: Do this in the query. Currently it doesn't support multiple filters at the same time
  const unclaimedCerts = allowList?.data.filter((item) => !item.claimed) || [];

  if (
    !allowList ||
    allowList.count === 0 ||
    !allowList.data ||
    !Array.isArray(allowList.data) ||
    unclaimedCerts.length === 0
  ) {
    return <div>No unclaimed hypercerts found</div>;
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {unclaimedCerts.map((unclaimedHypercert, i) => (
        <UnclaimedHypercertListItem
          allowListRecordFragment={unclaimedHypercert}
          key={i}
        />
      ))}
    </div>
  );
}
