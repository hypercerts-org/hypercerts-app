import { Separator } from "@/components/ui/separator";
import { getEvaluationStatus } from "@/hypercerts/getEvaluationStatus";
import { supportedChains, type SupportedChainIdType } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

export type HypercertMiniDisplayProps = {
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
  percentAvailable?: number;
  lowestPrice?: string;
};

const HypercertWindow = ({
  hasTrustedEvaluator,
  percentAvailable,
  lowestPrice,
  hypercertId,
  name,
  chainId,
  attestations,
}: HypercertMiniDisplayProps) => {
  const cardChain = (chainId: SupportedChainIdType) => {
    return supportedChains.find((x) => x.id === chainId)?.name;
  };

  const evaluationStatus = getEvaluationStatus(attestations);

  return (
    <Link href={`/hypercerts/${hypercertId}`}>
      <article className="transition-transform duration-300 hover:-translate-y-2 relative group bg-black/10 rounded-lg overflow-hidden">
        <div className="h-[320px] w-full relative p-1">
          <Image
            src={`/api/hypercerts/${hypercertId}/image`}
            alt={name || "Untitled"}
            fill
            sizes="300px"
            className="object-contain object-center w-full h-full"
          />
        </div>
        <section className="absolute top-4 left-4 flex space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out">
          <div className="rounded-md px-2 py-0.5 bg-black border border-white/60 text-white text-xs shadow-sm">
            {cardChain(chainId)}
          </div>
          <div className="rounded-md px-2 py-0.5 bg-black border border-black/60 text-white text-xs shadow-sm">
            {evaluationStatus}
          </div>
        </section>
        <section className="bg-gray-200/80 backdrop-blur-md bottom-0 w-full p-4 text-black space-y-2">
          <p
            className={`flex-1 text-sm font-semibold line-clamp-2 text-ellipsis ${
              name ? "text-black" : "text-gray-700"
            }`}
          >
            {name || "[Untitled]"}
          </p>
          <Separator className="bg-black/40 my-2" />
          <section className="flex text-xs justify-between">
            <section>
              <h6 className="opacity-70">for sale</h6>
              <p> {percentAvailable ? `${percentAvailable}%` : "--"}</p>
            </section>
            <section>
              <h6 className="text-end opacity-70">lowest per %</h6>
              <p className="font-medium">
                {lowestPrice ? lowestPrice : "--"} ETH
              </p>
            </section>
          </section>
        </section>
      </article>
    </Link>
  );
};

export { HypercertWindow as default };
