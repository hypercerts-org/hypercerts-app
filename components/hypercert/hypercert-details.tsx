import Contributors from "@/components/hypercert/contributors";
import Creator from "@/components/hypercert/creator";
import ExternalUrl from "@/components/hypercert/external-url";
import WorkScope from "@/components/hypercert/scope";
import TimeFrame from "@/components/hypercert/time-frame";
import ReadMore from "@/components/read-more";

import HypercertImage from "@/components/hypercert/hypercert-image";
import MutationButtons from "@/components/hypercert/mutation-buttons";
import { BuyButton } from "../marketplace/buy-button";
import { Separator } from "../ui/separator";
import Fractions from "./fractions";

import { InfoSection } from "../global/sections";
import PageSkeleton from "./page-skeleton";
import { cache, Suspense } from "react";
import { getHypercertState } from "@/hypercerts/getHypercertState";

function HypercertDetailsNotFound() {
  return <InfoSection>Hypercert not found</InfoSection>;
}

function HypercertDetailsLoadError() {
  return <InfoSection>Error loading hypercert</InfoSection>;
}

function HypercertDetailsSkeleton() {
  return <PageSkeleton />;
}

const getHypercertDetails = cache(async (hypercertId: string) => {
  return await getHypercertState(hypercertId);
});

export default async function HypercertDetails({
  hypercertId,
}: {
  hypercertId: string;
}) {
  const hypercert = await getHypercertDetails(hypercertId);

  if (!hypercert) {
    return <HypercertDetailsNotFound />;
  }

  return (
    <section className="flex flex-col space-y-4">
      <Suspense fallback={<HypercertDetailsSkeleton />}>
        <article className="space-y-4 lg:flex lg:space-y-0 lg:space-x-6">
          <HypercertImage
            hypercertId={hypercert.hypercert_id || ""}
            name={hypercert?.metadata?.name || ""}
          />
          <section className="space-y-4 w-full">
            <div className="flex flex-row w-full align-center justify-between">
              <h1 className="font-serif text-3xl lg:text-4xl tracking-tight line-clamp-2 text-ellipsis">
                {hypercert?.metadata?.name || "[Untitled]"}
              </h1>
              <div className="flex space-x-2">
                <BuyButton />
                <MutationButtons hypercert={hypercert} />
              </div>
            </div>
            <Creator hypercert={hypercert} />
            <ReadMore text={hypercert?.metadata?.description} length={280} />
            <ExternalUrl url={hypercert?.metadata?.external_url} />
            {(hypercert?.metadata?.work_timeframe_from as string) && (
              <>
                <Separator />
                <h2 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
                  TIME OF WORK
                </h2>
                <TimeFrame
                  from={hypercert.metadata?.work_timeframe_from}
                  to={hypercert.metadata?.work_timeframe_to}
                />
              </>
            )}
          </section>
        </article>

        <Separator />
        <section className="space-y-4 lg:flex lg:space-y-0 lg:space-x-8">
          {hypercert?.metadata?.contributors && (
            <Contributors hypercert={hypercert} />
          )}
          <Fractions hypercert={hypercert} />
        </section>
        {hypercert?.metadata?.work_scope && (
          <>
            <Separator />
            <WorkScope hypercert={hypercert} />
          </>
        )}
        <Separator />
      </Suspense>
    </section>
  );
}
