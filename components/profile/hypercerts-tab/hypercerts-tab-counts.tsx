"use client";

import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import { useClaimableHypercerts } from "@/hooks/useClaimableHypercerts";
import { useCreatedHypercerts } from "@/hooks/useCreatedHypercerts";
import { useOwnedHypercerts } from "@/hooks/useOwnedHypercerts";

const hypercertSubTabs = subTabs.filter(
  (tab) => tab.key.split("-")[0] === "hypercerts",
);

export const HypercertsTabCounts = ({
  address,
  activeTab,
}: {
  address: string;
  activeTab: ProfileSubTabKey;
}) => {
  // TODO: when cache invalidation works for only count queries, replace this with a call for only the count
  const { data: claimable } = useClaimableHypercerts(address);
  const { data: created } = useCreatedHypercerts(address);
  const { data: owned } = useOwnedHypercerts(address);

  const data = {
    "hypercerts-created": created?.count ?? 0,
    "hypercerts-owned": owned?.count ?? 0,
    "hypercerts-claimable": claimable?.count ?? 0,
  };

  return (
    <SubTabsWithCount
      address={address}
      activeTab={activeTab}
      tabBadgeCounts={
        data ?? {
          "hypercerts-created": 0,
          "hypercerts-owned": 0,
          "hypercerts-claimable": 0,
        }
      }
      tabs={hypercertSubTabs}
    />
  );
};
