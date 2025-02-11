import { Metadata, ResolvingMetadata } from "next";

import { getHypercert } from "@/hypercerts/getHypercert";

import CreatorFeedButton from "@/components/creator-feed/creator-feed-button";
import CreatorFeeds from "@/components/creator-feed/creator-feeds";
import { CurrencyButtons } from "@/components/currency-buttons";
import HypercertEvaluations from "@/components/evaluations/hypercert-evaluations";
import ErrorState from "@/components/global/error-state";
import EvaluateButton from "@/components/hypercert/evaluate-button";
import HypercertDetails from "@/components/hypercert/hypercert-details";
import HypercertListings from "@/components/marketplace/hypercert-listings";
import { ListForSaleButton } from "@/components/marketplace/list-for-sale-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  creatorFeedFlag,
  evaluationsFlag,
  marketplaceListingsFlag,
} from "@/flags/chain-actions-flag";

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

  const hypercert = await getHypercert(hypercertId);
  const isCreatorFeedEnabledOnChain = await creatorFeedFlag();
  const isEvaluationsEnabledOnChain = await evaluationsFlag();
  const isMarketplaceListingsEnabledOnChain = await marketplaceListingsFlag();

  if (!hypercert) {
    return (
      <ErrorState message="Hypercert not found" hypercertId={hypercertId} />
    );
  }

  const getDefaultAccordionItems = () => {
    if (isMarketplaceListingsEnabledOnChain) return ["marketplace-listings"];
    if (isEvaluationsEnabledOnChain) return ["evaluations"];
    if (isCreatorFeedEnabledOnChain) return ["creator-feed"];
    return [];
  };

  const defaultAccordionItems = getDefaultAccordionItems();

  return (
    <main className="flex flex-col p-8 md:px-24 md:pt-14 pb-24 space-y-4 flex-1">
      <HypercertDetails hypercertId={hypercertId} />
      <Accordion
        type="multiple"
        defaultValue={defaultAccordionItems}
        className="w-full"
      >
        <AccordionItem value="creator-feed">
          {/* creator feed */}
          <AccordionTrigger className="uppercase text-sm text-slate-500 font-medium tracking-wider">
            CREATOR&apos;S FEED
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex justify-end mb-4">
              <CreatorFeedButton
                hypercertId={hypercertId}
                creatorAddress={hypercert.creator_address!}
                disabledForChain={!isCreatorFeedEnabledOnChain}
              />
            </div>
            <CreatorFeeds hypercertId={hypercertId} />
          </AccordionContent>
        </AccordionItem>

        {/* evaluations */}
        <AccordionItem value="evaluations">
          <AccordionTrigger className="uppercase text-sm text-slate-500 font-medium tracking-wider">
            Evaluations
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex justify-end mb-4">
              <EvaluateButton hypercertId={hypercertId} />
            </div>
            <HypercertEvaluations
              hypercertId={hypercertId}
              searchParams={searchParams}
              disabledForChain={!isEvaluationsEnabledOnChain}
            />
          </AccordionContent>
        </AccordionItem>

        {/* marketplace */}
        <AccordionItem value="marketplace-listings">
          <AccordionTrigger className="uppercase text-sm text-slate-500 font-medium tracking-wider">
            Marketplace
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex justify-end mb-4">
              <div className="flex gap-2">
                <CurrencyButtons />
                <ListForSaleButton
                  hypercert={hypercert}
                  disabledForChain={!isMarketplaceListingsEnabledOnChain}
                />
              </div>
            </div>
            <HypercertListings
              hypercertId={hypercertId}
              initialHypercert={hypercert}
              searchParams={searchParams}
              invalidated={false}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
