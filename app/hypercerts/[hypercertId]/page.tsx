import { Metadata, ResolvingMetadata } from "next";
import { Fragment, Suspense } from "react";

import { CurrencyButtons } from "@/components/currency-buttons";
import Contributors from "@/components/hypercert/contributors";
import Creator from "@/components/hypercert/creator";
import EvaluateButton from "@/components/hypercert/evaluate-button";
import EvaluationsList from "@/components/hypercert/evaluations-list";
import ExternalUrl from "@/components/hypercert/external-url";
import Fractions from "@/components/hypercert/fractions";
import PageSkeleton from "@/components/hypercert/page-skeleton";
import WorkScope from "@/components/hypercert/scope";
import TimeFrame from "@/components/hypercert/time-frame";
import HypercertListingsList from "@/components/marketplace/hypercert-listings-list";
import { ListForSaleButton } from "@/components/marketplace/list-for-sale-button";
import ReadMore from "@/components/read-more";
import { Separator } from "@/components/ui/separator";
import { getHypercert } from "@/hypercerts/getHypercert";
import { getOrders } from "@/marketplace/getOpenOrders";
import Image from "next/image";
import TransferButton from "@/components/hypercert/transfer-button";
import { FlameIcon } from "lucide-react";
import BurnButton from "@/components/hypercert/burn-button";

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
      images: [
        `/api/hypercerts/${hypercertId}/image`,
        "/hypercerts-opengraph.jpg",
        ...previousImages,
      ],
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
  const orders = await getOrders({
    filter: {
      hypercertId,
    },
  });

  if (!hypercert) {
    return (
      <section className="flex flex-col space-y-4">
        <section className="space-y-4 lg:flex lg:space-y-0 lg:space-x-8">
          <div className="flex justify-between">
            <h3 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
              Oops! Something went wrong...
            </h3>
          </div>
        </section>
        <section className="flex flex-col space-y-4">
          <h1 className="font-serif text-3xl lg:text-5xl tracking-tight">
            Hypercert not found.
          </h1>
          <Separator />
          <pre className="uppercase text-sm text-slate-500 font-medium tracking-wider">
            {`ID: ${hypercertId}`}
          </pre>
          <p className="md:text-lg">
            If this hypercert was freshly minted try refreshing in 30 seconds.
            Please try again or contact us at{" "}
            <a href="mailto:support@hypercerts.org">support@hypercerts.org</a>.
          </p>
        </section>
      </section>
    );
  }

  return (
    <section className="flex flex-col space-y-4">
      <article className="space-y-4 lg:flex lg:space-y-0 lg:space-x-6">
        <div className="h-[300px] lg:h-[350px] min-w-[300px] lg:min-w-[500px] max-w-[500px] flex flex-col">
          <div className="relative w-full flex-grow bg-accent border border-slate-300 rounded-lg overflow-hidden">
            <Image
              src={`/api/hypercerts/${hypercertId}/image`}
              alt={hypercert?.metadata?.name || ""}
              fill
              sizes="500px"
              className="object-contain object-top p-2"
            />
          </div>
          <div className="flex flex-row items-center space-x-2 mt-2">
            <TransferButton hypercert={hypercert} />
            <BurnButton hypercert={hypercert} />
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
              <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
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
        <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          Evaluations
        </h5>
        <EvaluateButton hypercert={hypercert} />
      </div>
      <EvaluationsList hypercert={hypercert} />
      <Separator />
      <div className="flex justify-between">
        <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          Marketplace
        </h5>

        <div className="flex gap-2">
          <CurrencyButtons />
          <ListForSaleButton hypercert={hypercert} />
        </div>
      </div>
      <HypercertListingsList hypercert={hypercert} orders={orders?.data} />
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
