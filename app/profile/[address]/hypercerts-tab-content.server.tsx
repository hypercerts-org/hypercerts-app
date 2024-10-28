import { Suspense } from "react";
import { ProfileSubTabKey } from "@/app/profile/[address]/tabs";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import HypercertsTabContentInner from "./hypercerts-tab-content.client";
import { getHypercertsByCreator } from "@/hypercerts/getHypercertsByCreator";
import { getHypercertsByOwner } from "@/hypercerts/getHypercertsByOwner";
import { getAllowListRecordsForAddressByClaimed } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import { getHypercert } from "@/hypercerts/getHypercert";
import { InfoSection } from "@/app/profile/[address]/sections";

export const HypercertsTabContent = async ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  // Fetch data server-side
  const [createdHypercerts, ownedHypercerts, claimableRecords] =
    await Promise.all([
      getHypercertsByCreator({ creatorAddress: address }),
      getHypercertsByOwner({ ownerAddress: address }),
      getAllowListRecordsForAddressByClaimed(address, false),
    ]);

  if (!claimableRecords || claimableRecords?.data?.length === 0) {
    return <InfoSection>No unclaimed hypercerts</InfoSection>;
  }

  const claimableHypercerts = await Promise.all(
    claimableRecords.data.map(async (record) => {
      if (!record.hypercert_id) return [];
      return [
        {
          hypercert: await getHypercert(record.hypercert_id),
          record,
        },
      ];
    }),
  );

  const _claimableHypercerts = claimableHypercerts.flat();

  return (
    <Suspense fallback={<ExploreListSkeleton length={4} />}>
      <HypercertsTabContentInner
        address={address}
        activeTab={activeTab}
        createdHypercerts={createdHypercerts}
        ownedHypercerts={ownedHypercerts}
        claimableHypercerts={_claimableHypercerts}
      />
    </Suspense>
  );
};
