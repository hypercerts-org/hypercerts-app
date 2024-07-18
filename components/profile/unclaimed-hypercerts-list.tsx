import { EmptySection } from "@/app/profile/[address]/sections";
import UnclaimedHypercertListItem from "./unclaimed-hypercert-list-item";

export default async function UnclaimedHypercertsList({
  unclaimedHypercerts,
  isEmptyAllowlist,
}: {
  unclaimedHypercerts: any[];
  isEmptyAllowlist: boolean;
}) {
  if (isEmptyAllowlist || unclaimedHypercerts.length === 0) {
    return <EmptySection />;
  }

  return (
    <div className="flex flex-col gap-5 w-full pt-4">
      {unclaimedHypercerts.map((unclaimedHypercert, i) => (
        <UnclaimedHypercertListItem
          allowListRecordFragment={unclaimedHypercert}
          key={i}
        />
      ))}
    </div>
  );
}
