"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const subTabs = [
  { key: "hypercerts-owned", triggerLabel: "Owned" },
  { key: "hypercerts-created", triggerLabel: "Created" },
  { key: "hypercerts-claimable", triggerLabel: "Claimable" },
  { key: "marketplace-listings", triggerLabel: "Listings" },
  { key: "marketplace-bought", triggerLabel: "Bought" },
  { key: "marketplace-sold", triggerLabel: "Sold" },
  { key: "blueprints-claimable", triggerLabel: "To be minted" },
  { key: "blueprints-claimed", triggerLabel: "Minted" },
  { key: "blueprints-created", triggerLabel: "Sent" },
] as const;

export type ProfileSubTabKey =
  | (typeof subTabs)[number]["key"]
  | "collections"
  | "marketplace-orders";

const mainTabs = [
  {
    prefix: "hypercerts",
    triggerLabel: "Hypercerts",
    defaultSubTabKey: "hypercerts-created" as ProfileSubTabKey,
  },
  {
    prefix: "collections",
    triggerLabel: "Collections",
    defaultSubTabKey: "collections" as ProfileSubTabKey,
  },
  {
    prefix: "marketplace",
    triggerLabel: "Marketplace",
    defaultSubTabKey: "marketplace-listings" as ProfileSubTabKey,
  },
  {
    prefix: "blueprints",
    triggerLabel: "Blueprints",
    defaultSubTabKey: "blueprints-claimable" as ProfileSubTabKey,
  },
];

export const createTabRoute = (address: string, tabKey: ProfileSubTabKey) =>
  `/profile/${address}?tab=${tabKey}`;

interface ProfileTabSectionProps {
  address: string;
  active: ProfileSubTabKey;
}

export const ProfileTabSection = ({
  address,
  active,
}: ProfileTabSectionProps) => {
  const router = useRouter();
  const tabPrefix = active.split("-")[0];

  const handleTabClick = (tabKey: ProfileSubTabKey) => {
    router.push(createTabRoute(address, tabKey));
  };

  return (
    <section className="w-full">
      <section className="flex items-end overflow-clip">
        {mainTabs.map(({ defaultSubTabKey, prefix, triggerLabel }) => (
          <button
            key={prefix}
            onClick={() => handleTabClick(defaultSubTabKey)}
            className={cn(
              "px-3 py-2 border-b-2 font-semibold text-lg",
              tabPrefix === prefix ? "border-black" : "opacity-45",
            )}
          >
            {triggerLabel}
          </button>
        ))}
        <Separator className="flex-1" />
      </section>
    </section>
  );
};
