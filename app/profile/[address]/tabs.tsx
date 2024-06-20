import { Button } from "@/components/ui/button";
import { EmptySection } from "@/app/profile/[address]/sections";
import HypercertMiniDisplay from "@/components/hypercert/hypercert-mini-display";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import UnclaimedHypercertsList from "../../../components/profile/unclaimed-hypercerts-list";
import { getHypercertsByCreator } from "../../../hypercerts/getHypercertsByCreator";
import { supabaseData } from "../../../lib/supabase";

const HyperBoardsTabContentInner = async ({ address }: { address: string }) => {
  const hyperboards = await supabaseData
    .from("hyperboards")
    .select("id")
    .eq("admin_id", address.toLowerCase());

  if (!hyperboards || !hyperboards.data) {
    return <EmptySection />;
  }

  return (
    <div>
      <Script
        src="https://hyperboards-git-feature-hyperboard-widget-hypercerts-foundation.vercel.app/widget/hyperboard-widget.js"
        type="module"
      />
      <div className="flex flex-col gap-4">
        {hyperboards.data.map((hyperboard) => (
          <div
            key={hyperboard.id}
            className="hyperboard-widget"
            data-hyperboard-id={hyperboard.id}
          ></div>
        ))}
      </div>
    </div>
  );
};

const HyperboardsTabContent = ({ address }: { address: string }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HyperBoardsTabContentInner address={address} />
    </Suspense>
  );
};

const HypercertsTabContentInner = async ({ address }: { address: string }) => {
  const hypercerts = await getHypercertsByCreator({ creatorAddress: address });

  if (!hypercerts || hypercerts.data?.length === 0) {
    return <EmptySection />;
  }

  return (
    <>
      <div>
        <Button variant="secondary" size="sm" className={`space-x-1`}>
          <h2 className={`text-sm`}>Created by me</h2>
          <span
            className={`bg-black text-white text-xs px-1 py-0.5 rounded-lg h-max`}
          >
            {hypercerts.count}
          </span>
        </Button>
      </div>
      <div className="flex flex-wrap gap-5 justify-center lg:justify-start pt-3">
        {hypercerts.data.map((hypercert, index) => {
          const props = {
            hypercertId: hypercert.hypercert_id as string,
            name: hypercert.metadata?.name as string,
            chainId: Number(hypercert.contract?.chain_id),
            attestations: hypercert.attestations,
          };
          return <HypercertMiniDisplay key={index} {...props} />; // TODO: show hypercert mini displays
        })}
      </div>
      <h1 className="font-serif text-2xl lg:text-3xl tracking-tight">
        Unclaimed hypercerts
      </h1>
      <UnclaimedHypercertsList address={address} />
    </>
  );
};

const HypercertsTabContent = ({ address }: { address: string }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HypercertsTabContentInner address={address} />
    </Suspense>
  );
};

const ProfileTabSection = ({
  address,
  active = "hypercerts",
}: {
  address: string;
  active: string;
}) => {
  return (
    <section className="w-full space-y-2">
      <section className="space-x-1 w-full flex">
        <Link href={`/profile/${address}?tab=hypercerts`}>
          <Button
            variant={active === "hypercerts" ? "default" : "outline"}
            size={"default"}
            className={`space-x-1 border-[1.5px]`}
          >
            <h3 className={`text-lg`}>Hypercerts</h3>
          </Button>
        </Link>
        <Link href={`/profile/${address}?tab=hyperboards`}>
          <Button
            variant={active === "hyperboards" ? "default" : "outline"}
            size={"default"}
            className={`space-x-1 border-[1.5px]`}
          >
            <h3 className={`text-lg`}>Hyperboards</h3>
          </Button>
        </Link>
      </section>
    </section>
  );
};

export { HypercertsTabContent, HyperboardsTabContent, ProfileTabSection };
