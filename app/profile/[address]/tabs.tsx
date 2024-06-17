import { EmptySection } from "@/app/profile/[address]/sections";
import { Button } from "@/components/ui/button";
import { HypercertMetadata } from "@hypercerts-org/sdk";
import { Dispatch, ReactNode, SetStateAction } from "react";
import Script from "next/script";

type ProfileTabKey = "hypercerts" | "hyperboards";

type ProfileTabDetails = {
  tabLabel: string;
  tabKey: ProfileTabKey;
  count: number;
};

type ProfileTabProps = ProfileTabDetails & {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<ProfileTabKey>>;
};

const profileTabs: ProfileTabDetails[] = [
  { tabLabel: "Hypercerts", tabKey: "hypercerts", count: 0 }, // TODO: update count based on data
  { tabLabel: "Hyperboards", tabKey: "hyperboards", count: 0 }, // TODO: update count based on data
];

const ProfileTabButton = ({
  tabLabel,
  tabKey,
  activeTab,
  setActiveTab,
  count = 0,
}: ProfileTabProps) => {
  const isActive = activeTab === tabKey;

  const badgeActiveClasses = isActive
    ? "bg-black text-white"
    : "text-slate-400 bg-white border-[1.5px] border-slate-300";

  const textActiveClasses = isActive ? "text-primary" : "text-slate-400";

  const buttonActiveClasses = isActive ? "border-primary" : "border-slate-300";

  return (
    <Button
      variant={"outline"}
      className={`space-x-1 ${buttonActiveClasses}`}
      onClick={() => setActiveTab(tabKey)}
    >
      <h2 className={`font-serif text-2xl ${textActiveClasses}`}>{tabLabel}</h2>
      <span
        className={`text-xs ${badgeActiveClasses} px-1 py-0.5 rounded-lg h-max`}
      >
        {count}
      </span>
    </Button>
  );
};

const HypercertsTabContent = ({
  ownedHypercerts,
}: {
  ownedHypercerts: HypercertMetadata[]; // TODO: update type
}) => {
  if (!ownedHypercerts || !ownedHypercerts.length) {
    return <EmptySection />;
  }
  return (
    <div className="flex flex-col gap-2">
      {ownedHypercerts.map((hypercert) => {
        return <div key={hypercert.ref}>{hypercert.name}</div>; // TODO: show hypercert mini displays
      })}
    </div>
  );
};

const HyperboardsTabContent = ({
  ownedHyperboards,
}: {
  ownedHyperboards: string[]; // TODO: update to hyperboards
}) => {
  if (!ownedHyperboards?.length) {
    return <EmptySection />;
  }

  return (
    <div>
      <Script
        src="https://hyperboards-git-feature-hyperboard-widget-hypercerts-foundation.vercel.app/widget/hyperboard-widget.js"
        type="module"
      />
      <div className="flex flex-col gap-4">
        {ownedHyperboards.map((hyperboard) => (
          <div
            key={hyperboard}
            className="hyperboard-widget"
            data-hyperboard-id={hyperboard}
          ></div>
        ))}
      </div>
    </div>
  );
};

const ProfileTabContent = ({
  activeTab,
  data,
}: {
  activeTab: "hypercerts" | "hyperboards";
  data: { hyperboardIds: string[]; ownedHypercerts: HypercertMetadata[] };
}) => {
  const tabContent: { [key in ProfileTabKey]: ReactNode } = {
    hypercerts: <HypercertsTabContent ownedHypercerts={data.ownedHypercerts} />,
    hyperboards: (
      <HyperboardsTabContent ownedHyperboards={data.hyperboardIds} />
    ),
  };

  return <section className="py-2">{tabContent[activeTab]}</section>;
};

export { ProfileTabButton, ProfileTabContent, profileTabs, type ProfileTabKey };
