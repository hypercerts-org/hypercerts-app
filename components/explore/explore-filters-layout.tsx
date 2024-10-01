"use client";
import ExploreChainFilterSelect from "@/components/explore/explore-chain-filter-select";
import ExploreEvaluationsFilterSelect from "@/components/explore/explore-evaluations-filter-select";
import ExploreOrderBySelect from "@/components/explore/explore-order-by-select";
import { CurrencyButtons } from "@/components/currency-buttons";
import { useMediaQuery } from "@/hooks/use-media-query";

const ExploreFiltersLayout = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  if (isDesktop) {
    return (
      <section className="flex space-x-2 w-full max-w-screen-sm">
        <ExploreChainFilterSelect />
        <ExploreEvaluationsFilterSelect />
        <ExploreOrderBySelect />
        <CurrencyButtons />
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <div className="flex space-x-2 w-full">
        <ExploreChainFilterSelect />
        <ExploreEvaluationsFilterSelect />
      </div>
      <div className="flex space-x-2 w-full">
        <CurrencyButtons />
        <ExploreOrderBySelect />
      </div>
    </section>
  );
};

export default ExploreFiltersLayout;
