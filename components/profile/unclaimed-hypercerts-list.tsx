import { EmptySection } from "@/components/global/sections";
import { AllowListRecord } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import { UnclaimedFractionTable } from "./unclaimed-table/unclaimed-fraction-table";
import { UnclaimedFractionColumns } from "./unclaimed-table/unclaimed-fraction-columns";
import { HypercertMetadata } from "@/hypercerts/fragments/hypercert-metadata.fragment";

export type UnclaimedFraction = AllowListRecord & {
  metadata: HypercertMetadata | null;
};

export default async function UnclaimedHypercertsList({
  unclaimedHypercerts,
}: {
  unclaimedHypercerts: UnclaimedFraction[];
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
      <UnclaimedFractionTable
        columns={UnclaimedFractionColumns}
        data={unclaimedHypercerts}
      />
    </div>
  );
}
