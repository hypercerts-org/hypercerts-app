import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

import { getHypercert } from "@/hypercerts/getHypercert";

import PageSkeleton from "@/components/hypercert/page-skeleton";
import HypercertDetails from "@/components/hypercert/hypercert-details";
import EvaluateButton from "@/components/hypercert/evaluate-button";
import { CurrencyButtons } from "@/components/currency-buttons";
import { ListForSaleButton } from "@/components/marketplace/list-for-sale-button";
import ErrorState from "@/components/global/error-state";
import HypercertListings from "@/components/marketplace/hypercert-listings";
import HypercertEvaluations from "@/components/evaluations/hypercert-evaluations";
import { Separator } from "@/components/ui/separator";
import CreatorFeedButton from "@/components/creator-feed/creator-feed-button";
import CreatorFeeds from "@/components/creator-feed/creator-feeds";

type Props = {
  params: { hypercertId: string };
  searchParams: Record<string, string>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { hypercertId } = params;
  const hypercert = await getHypercert(hypercertId);

  const previousImages = (await parent).openGraph?.images || [];
  return {
    title: hypercert?.metadata?.name || "Untitled Hypercert",
    description: hypercert?.metadata?.description || "",
    openGraph: {
      images: [
        `/api/hypercerts/${hypercertId}/image`,
        "/hypercerts-opengraph.jpg",
        ...previousImages,
      ],
    },
  };
}
export default async function HypercertPage({ params, searchParams }: Props) {
  const { hypercertId } = params;

  const [hypercert] = await Promise.all([getHypercert(hypercertId)]);

  if (!hypercert) {
    return (
      <ErrorState message="Hypercert not found" hypercertId={hypercertId} />
    );
  }

  return (
    <main className="flex flex-col p-8 md:px-24 md:pt-14 pb-24 space-y-4 flex-1">
      <HypercertDetails hypercertId={hypercertId} />
      <div className="flex justify-between">
        <h2 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          Evaluations
        </h2>
        <EvaluateButton hypercertId={hypercertId} />
      </div>
      <HypercertEvaluations
        hypercertId={hypercertId}
        searchParams={searchParams}
      />
      <Separator />
      {/* marketplace */}
      <div className="flex justify-between mb-4">
        <h2 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          Marketplace
        </h2>
        <div className="flex gap-2">
          <CurrencyButtons />
          <ListForSaleButton hypercert={hypercert} />
        </div>
      </div>
      <HypercertListings
        hypercertId={hypercertId}
        initialHypercert={hypercert}
        searchParams={searchParams}
        invalidated={false}
      />
      <Separator />
      {/* creator feed */}
      <div className="flex justify-between mb-4">
        <h2 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          {"CREATOR'S FEED"}
        </h2>
        <CreatorFeedButton
          hypercertId={hypercertId}
          creatorAddress={hypercert.creator_address!}
        />
      </div>
      <CreatorFeeds hypercertId={hypercertId} />
    </main>
  );
}
