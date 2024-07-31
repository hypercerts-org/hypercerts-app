import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const subTabs = [
  { key: "hypercerts-created", triggerLabel: "Created by me" },
  { key: "hypercerts-claimable", triggerLabel: "Claimable" },
  { key: "marketplace-listings", triggerLabel: "Open listings" },
] as const;

export type ProfileSubTabKey =
  | (typeof subTabs)[number]["key"]
  | "collections"
  | "marketplace-orders";

const mainTabs: {
  prefix: string;
  triggerLabel: string;
  defaultSubTabKey: ProfileSubTabKey;
}[] = [
  {
    prefix: "hypercerts",
    triggerLabel: "Hypercerts",
    defaultSubTabKey: "hypercerts-created",
  },
  {
    prefix: "collections",
    triggerLabel: "Collections",
    defaultSubTabKey: "collections",
  },
  {
    prefix: "marketplace",
    triggerLabel: "Marketplace",
    defaultSubTabKey: "marketplace-listings",
  },
];

export const createTabRoute = (address: string, tabKey: ProfileSubTabKey) =>
  `/profile/${address}?tab=${tabKey}`;

export const defaultDescription =
  "libp2p is an open source project for building network applications free from runtime and address services. You can help define the specification, create applications using libp2p, and craft examples and tutorials to get involved.";

const ProfileTabSection = ({
  address,
  active = "hypercerts-created",
}: {
  address: string;
  active: string;
}) => {
  const tabPrefix = active.split("-")[0];
  return (
    <section className="w-full">
      <section className="flex items-end overflow-clip">
        {mainTabs.map(({ defaultSubTabKey, prefix, triggerLabel }) => (
          <Link key={prefix} href={createTabRoute(address, defaultSubTabKey)}>
            <button
              className={cn(
                "px-3 py-2 border-b-2 font-semibold text-lg",
                tabPrefix === prefix ? "border-black" : "opacity-45",
              )}
            >
              {triggerLabel}
            </button>
          </Link>
        ))}
        <Separator className="flex-1" />
      </section>
    </section>
  );
};

export { ProfileTabSection };
