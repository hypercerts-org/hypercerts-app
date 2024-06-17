import { Fragment, Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";

import { ArrowLeftIcon } from "lucide-react";
import Contributors from "@/components/hypercert/contributors";
import Creator from "@/components/hypercert/creator";
import EvaluateButton from "@/components/hypercert/evaluate-button";
import EvaluationsList from "@/components/hypercert/evaluations-list";
import ExternalUrl from "@/components/hypercert/external-url";
import Fractions from "@/components/hypercert/fractions";
import Image from "next/image";
import Link from "next/link";
import PageSkeleton from "../../../components/hypercert/page-skeleton";
import ReadMore from "@/components/read-more";
import { Separator } from "@/components/ui/separator";
import WorkScope from "@/components/hypercert/scope";
import WorkTimeFrame from "@/components/hypercert/time-frame";
import { getHypercert } from "@/hypercerts/getHypercert";
import { ListForSaleButton } from "@/components/marketplace/list-for-sale-button";
import OrdersList from "@/components/marketplace/orders-list";

type Props = {
  params: { hypercertId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
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
              <WorkTimeFrame hypercert={hypercert} />
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

        <ListForSaleButton hypercertId={hypercertId} />
      </div>
      <OrdersList hypercertId={hypercertId} />
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
    <main className="flex flex-col p-8 md:px-24 md:pt-14 pb-24 space-y-4">
      <Link href={`/explore`}>
        <div className="flex items-center space-x-2 text-sm text-gray-700 font-medium">
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Explore more hypercerts</span>
        </div>
      </Link>
      <Suspense fallback={<PageSkeleton />} key={params.hypercertId}>
        <HypercertPageInner {...{ params }} />
      </Suspense>
    </main>
  );
}
