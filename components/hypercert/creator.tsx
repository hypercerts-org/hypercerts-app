import { type HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import EthAddress from "../eth-address";

export default function Creator({ hypercert }: { hypercert: HypercertFull }) {
  if (!hypercert) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
      {hypercert.owner_address && (
        <div className="flex space-x-1 items-center">
          <span>by</span>
          <EthAddress address={hypercert.owner_address} />
        </div>
      )}
      {hypercert?.block_number && (
        <div className="flex space-x-1 items-center">
          <span>•</span>
          {hypercert.block_number}
        </div>
      )}
    </div>
  );
}
