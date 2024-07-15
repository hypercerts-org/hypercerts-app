import { Fragment, Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";

import Contributors from "@/components/hypercert/contributors";
import Creator from "@/components/hypercert/creator";
import EvaluateButton from "@/components/hypercert/evaluate-button";
import EvaluationsList from "@/components/hypercert/evaluations-list";
import ExternalUrl from "@/components/hypercert/external-url";
import Fractions from "@/components/hypercert/fractions";
import Image from "next/image";
import { ListForSaleButton } from "@/components/marketplace/list-for-sale-button";
import OrdersList from "@/components/marketplace/orders-list";
import PageSkeleton from "@/components/hypercert/page-skeleton";
import ReadMore from "@/components/read-more";
import { Separator } from "@/components/ui/separator";
import WorkScope from "@/components/hypercert/scope";
import TimeFrame from "@/components/hypercert/time-frame";
import { getHypercert } from "@/hypercerts/getHypercert";

type Props = {
  params: { hypercertId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { hypercertId } = params;

  const hypercert = await getHypercert(hypercertId);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  return {
    title: hypercert?.metadata?.name || "Untitled Hypercert",
    description: hypercert?.metadata?.description || "",
    openGraph: {
      images: [`/api/hypercerts/${hypercertId}/image`, ...previousImages],
    },
  };
}

async function HypercertPageInner({
  params,
}: {
  params: { hypercertId: string };
}) {
  const { hypercertId } = params;
  const hypercert = await getHypercert(hypercertId);

  if (!hypercert) {
    throw new Error("Hypercert not found.");
  }

  return (
    <section className="flex flex-col space-y-4">
      <article className="space-y-4 lg:flex lg:space-y-0 lg:space-x-6">
        <div className="h-[300px] lg:h-[350px] min-w-[300px] lg:min-w-[500px] max-w-[500px]">
          <div className="relative w-full h-full bg-black border border-slate-800 rounded-lg overflow-hidden ">
            <Image
              src={`/api/hypercerts/${hypercertId}/image`}
              alt={hypercert?.metadata?.name || ""}
              fill
              sizes="500px"
              className="object-contain object-top p-2"
            />
          </div>
        </div>
        <section className="space-y-4">
          <h1 className="font-serif text-3xl lg:text-4xl tracking-tight line-clamp-2 text-ellipsis w-full">
            {hypercert?.metadata?.name || "[Untitled]"}
          </h1>
          <Creator hypercert={hypercert} />
          <ReadMore text={hypercert?.metadata?.description} length={280} />
          <ExternalUrl url={hypercert?.metadata?.external_url} />
          {(hypercert?.metadata?.work_timeframe_from as string) && (
            <Fragment>
              <Separator />
              <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
                TIME OF WORK
              </h5>
              <TimeFrame
                from={hypercert.metadata?.work_timeframe_from}
                to={hypercert.metadata?.work_timeframe_to}
              />
            </Fragment>
          )}
        </section>
      </article>

      <Separator />
      <section className="space-y-4 lg:flex lg:space-y-0 lg:space-x-8">
        {hypercert?.metadata?.contributors && (
          <Fragment>
            <Contributors hypercert={hypercert} />
          </Fragment>
        )}

        <Fractions hypercert={hypercert} />
      </section>
      {hypercert?.metadata?.work_scope && (
        <Fragment>
          <Separator />
          <WorkScope hypercert={hypercert} />
        </Fragment>
      )}
      <Separator />
      <div className="flex justify-between">
        <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
          Evaluations
        </h5>
        <EvaluateButton hypercert={hypercert} />
      </div>
      <EvaluationsList hypercert={hypercert} />
      <Separator />
      <div className="flex justify-between">
        <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
          Marketplace
        </h5>

        <div className="flex gap-2">
          <ListForSaleButton hypercert={hypercert} />
        </div>
      </div>
      <OrdersList hypercert={hypercert} />
    </section>
  );
}

export default async function HypercertPage({
  params,
}: {
  params: {
    hypercertId: string;
  };
}) {
  return (
    <main className="flex flex-col p-8 md:px-24 md:pt-14 pb-24 space-y-4 flex-1">
      <Suspense fallback={<PageSkeleton />} key={params.hypercertId}>
        <HypercertPageInner {...{ params }} />
      </Suspense>
    </main>
  );
}
