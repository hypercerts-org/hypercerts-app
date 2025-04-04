import { getAllowListRecordsForAddressByClaimedWithMetadata } from "@/allowlists/actions/getAllowListRecordsForAddressByClaimedWithMetadata";
import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import { getHypercertsByCreator } from "@/hypercerts/actions/getHypercertsByCreator";
import { getHypercertsByOwner } from "@/hypercerts/actions/getHypercertsByOwner";

const hypercertSubTabs = subTabs.filter(
  (tab) => tab.key.split("-")[0] === "hypercerts",
);

export const HypercertsTabCounts = async ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  const claimable = await getAllowListRecordsForAddressByClaimedWithMetadata({
    address,
    claimed: false,
  });
  const created = await getHypercertsByCreator({ creatorAddress: address });
  const owned = await getHypercertsByOwner({ ownerAddress: address });

  const data = {
    "hypercerts-created": created?.count ?? 0,
    "hypercerts-owned": owned?.count ?? 0,
    "hypercerts-claimable": claimable?.count ?? 0,
  };

  return (
    <SubTabsWithCount
      address={address}
      activeTab={activeTab}
      tabBadgeCounts={data}
      tabs={hypercertSubTabs}
    />
  );
};
