import Link from "next/link";
import { createTabRoute, subTabs } from "@/app/profile/[address]/tabs";
import { cn } from "@/lib/utils";
import CountBadge from "@/components/count-badge";

interface SubTabsWithCountProps {
  address: string;
  activeTab: string;
  tabBadgeCounts: Partial<Record<(typeof subTabs)[number]["key"], number>>;
  tabs: {
    key: (typeof subTabs)[number]["key"];
    triggerLabel: string;
  }[];
}

export const SubTabsWithCount = ({
  address,
  activeTab,
  tabBadgeCounts,
  tabs,
}: SubTabsWithCountProps) => {
  return (
    <section className="bg-slate-100 w-max flex rounded-sm p-1 my-2">
      {tabs.map(({ key, triggerLabel }) => (
        <Link href={createTabRoute(address, key)} key={key}>
          <button
            className={cn(
              "flex gap-1.5 px-3 py-2 text-sm rounded-md tracking-tight transition duration-300 border-[1.5px] shadow-sm font-semibold",
              key === activeTab
                ? "bg-white border-slate-300"
                : "opacity-60 border-transparent",
            )}
          >
            {triggerLabel}
            {tabBadgeCounts[key] !== undefined &&
              tabBadgeCounts[key] !== null && (
                <CountBadge
                  count={tabBadgeCounts[key]}
                  variant={key === activeTab ? "default" : "secondary"}
                />
              )}
          </button>
        </Link>
      ))}
    </section>
  );
};
