import { EmptySection } from "@/components/global/sections";
import { getHypercertsByCreator } from "@/hypercerts/actions/getHypercertsByCreator"; // Server Action
import HypercertWindow from "@/components/hypercert/hypercert-window";

interface CreatedContentProps {
  address: string;
}

export async function CreatedContent({ address }: CreatedContentProps) {
  const response = await getHypercertsByCreator({ creatorAddress: address });

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
}
