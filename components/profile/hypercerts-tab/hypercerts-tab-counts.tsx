"use client";

import { ProfileSubTabKey, subTabs } from "@/app/profile/[address]/tabs";
import { SubTabsWithCount } from "@/components/profile/sub-tabs-with-count";
import { UnclaimedFraction } from "@/components/profile/unclaimed-hypercerts-list";
import { HypercertListFragment } from "@/hypercerts/fragments/hypercert-list.fragment";
import { useQuery } from "@tanstack/react-query";

export type TabData = {
  created?: {
    data: HypercertListFragment[];
    count: number;
  };
  owned?: {
    data: HypercertListFragment[];
    count: number;
  };
  claimable?: {
    data: UnclaimedFraction[];
    count: number;
  };
};

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
  const { data: claimable, isLoading } = useQuery({
    queryKey: ["hypercerts-claimable", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${address}/claimable`);
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: created } = useQuery({
    queryKey: ["hypercerts-created", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${address}/created`);
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: owned } = useQuery({
    queryKey: ["hypercerts-owned", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${address}/owned`);
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000,
  });

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
