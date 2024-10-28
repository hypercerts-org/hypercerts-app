import { Separator } from "@/components/ui/separator";
import { getEvaluationStatus } from "@/hypercerts/getEvaluationStatus";
import Image from "next/image";
import Link from "next/link";
import { SUPPORTED_CHAINS, SupportedChainIdType } from "@/configs/constants";

export type HypercertDealMiniDisplayProps = {
  hypercertId: string;
  name: string;
  chainId: SupportedChainIdType;
  fromDateDisplay?: string | null;
  toDateDisplay?: string | null;
  attestations: {
    data:
      | {
          data: unknown;
        }[]
      | null;
    count: number | null;
  } | null;
  hasTrustedEvaluator?: boolean;
  percentTraded?: number;
  price?: string;
};

const HypercertDealWindow = ({
  hasTrustedEvaluator,
  percentTraded,
  price,
  hypercertId,
  name,
  chainId,
  attestations,
}: HypercertDealMiniDisplayProps) => {
  const cardChain = (chainId: SupportedChainIdType) => {
    return SUPPORTED_CHAINS.find((x) => x.id === chainId)?.name;
  };

  const evaluationStatus = getEvaluationStatus(attestations);

  return (
    <Link href={`/hypercerts/${hypercertId}`}>
      <article className="transition-transform duration-300 hover:-translate-y-2 relative group bg-accent rounded-lg overflow-hidden">
        <section className="p-2">
          <div className="h-[16.25rem] w-full relative">
            <Image
              src={`/api/hypercerts/${hypercertId}/image`}
              alt={name || "Untitled"}
              fill
              sizes="300px"
              className="object-contain object-center w-full h-full"
            />
          </div>
        </section>
        <section className="absolute top-4 left-4 flex space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out">
          <div className="rounded-md px-2 py-0.5 bg-black border border-white/60 text-white text-xs shadow-sm">
            {cardChain(chainId)}
          </div>
          <div className="rounded-md px-2 py-0.5 bg-black border border-black/60 text-white text-xs shadow-sm">
            {evaluationStatus}
          </div>
        </section>
        <section className="bg-accent backdrop-blur-md bottom-0 w-full p-4 text-black space-y-2">
          <h3
            className={`flex-1 text-base font-semibold h-[2.5em] overflow-hidden text-ellipsis tracking-tight leading-tight mb-2 ${
              name ? "text-black" : "text-slate-700"
            } line-clamp-2`}
          >
            {name || "[Untitled]"}
          </h3>
          <Separator className="bg-black/40 my-2" />
          <section className="flex text-xs justify-between"></section>
        </section>
      </article>
    </Link>
  );
};

export { HypercertDealWindow as default };
