import { EmptySection } from "@/app/profile/[address]/sections";
import UnclaimedHypercertListItem from "./unclaimed-hypercert-list-item";
import { AllowListRecord } from "@/allowlists/getAllowListRecordsForAddressByClaimed";

export default async function UnclaimedHypercertsList({
  unclaimedHypercerts,
}: {
  unclaimedHypercerts: readonly AllowListRecord[];
}) {
  if (unclaimedHypercerts.length === 0) {
    return (
      <section className="pt-4">
        <EmptySection />
      </section>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-4">
      {unclaimedHypercerts.map((unclaimedHypercert, i) => (
        <UnclaimedHypercertListItem
          allowListRecordFragment={unclaimedHypercert}
          key={i}
        />
      ))}
    </div>
  );
}
