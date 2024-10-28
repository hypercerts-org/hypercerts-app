"use client";

import React from "react";
import { SaleFragment } from "@/marketplace/fragments/sale.fragment";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { EmptySection } from "@/app/profile/[address]/sections";
import HypercertDealWindow, {
  HypercertDealMiniDisplayProps,
} from "@/components/hypercert/hypercert-deal-window";
import { SupportedChainIdType } from "@/configs/constants";

export default function UserDealsList({
  address,
  deals,
}: {
  address: string;
  deals: SaleFragment[];
}) {
  return (
    <div className="w-full">
      {deals && deals.length > 0 ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,_minmax(16.875rem,_18.75rem))] gap-4 py-4">
            {deals.map((deal) => {
              const percentTraded = calculateBigIntPercentage(
                deal?.amounts?.shift(),
                deal?.hypercert?.units,
              );

              if (!deal.hypercert_id) return;

              // TODO - get price of traded fraction
              // const price = getPricePerPercent(
              //     hypercert.orders?.lowestAvailablePrice || "0",
              //     BigInt(deal.hypercert?.units || "0"),
              // );

              const price = BigInt(0);

              const hypercertPointer = deal.hypercert_id.split("-");

              const props: HypercertDealMiniDisplayProps = {
                hypercertId: deal.hypercert_id,
                name: deal.hypercert?.metadata?.name as string,
                chainId: Number(hypercertPointer[0]) as SupportedChainIdType,
                attestations: { data: null, count: null },
                price: price.toString(),
                percentTraded,
              };
              return (
                <HypercertDealWindow {...props} key={deal.transaction_hash} />
              );
            })}
          </div>
        </div>
      ) : (
        <section className="pt-4">
          <EmptySection />
        </section>
      )}
    </div>
  );
}
