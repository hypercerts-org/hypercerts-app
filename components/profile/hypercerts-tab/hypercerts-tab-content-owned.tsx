import { EmptySection } from "@/components/global/sections";
import HypercertWindow from "@/components/hypercert/hypercert-window";
import { getHypercertsByOwner } from "@/hypercerts/actions/getHypercertsByOwner";

export const OwnedContent = async ({ address }: { address: string }) => {
  const response = await getHypercertsByOwner({ ownerAddress: address });

  if (!response || !response.data || response.data.length === 0) {
    return <EmptySection />;
  }

  const { data } = response;
  return (
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(16.875rem,_20rem))] gap-4 py-4">
      {data.map((hypercert) => (
        <HypercertWindow
          key={hypercert.hypercert_id}
          hypercert={hypercert}
          priceDisplayCurrency="usd"
        />
      ))}
    </div>
  );
};
