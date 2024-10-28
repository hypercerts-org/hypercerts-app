import { Suspense } from "react";
import { ProfileSubTabKey } from "@/app/profile/[address]/tabs";
import ExploreListSkeleton from "@/components/explore/explore-list-skeleton";
import HypercertsTabContentInner from "./hypercerts-tab-content.client";
import { getHypercertsByCreator } from "@/hypercerts/getHypercertsByCreator";
import { getHypercertsByOwner } from "@/hypercerts/getHypercertsByOwner";
import { getAllowListRecordsForAddressByClaimed } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import { getHypercertDataForUnclaimed } from "@/lib/getHypercertDataForUnclaimedHypercerts";
import { getHypercert } from "@/hypercerts/getHypercert";

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

  const claimableHypercerts = await Promise.all(
    claimableRecords.data.map(async (record) => ({
      hypercert: await getHypercert(record.hypercert_id),
      record,
    })),
  );

  return (
    <Suspense fallback={<ExploreListSkeleton length={4} />}>
      <HypercertsTabContentInner
        address={address}
        activeTab={activeTab}
        createdHypercerts={createdHypercerts}
        ownedHypercerts={ownedHypercerts}
        claimableHypercerts={claimableHypercerts}
      />
    </Suspense>
  );
};
