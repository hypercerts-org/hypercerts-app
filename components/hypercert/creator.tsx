import EthAddress from "../eth-address";
import { Cuboid } from "lucide-react";
import { SUPPORTED_CHAINS, SupportedChainIdType } from "@/configs/constants";
import CopyableHypercertId from "@/components/copyable-hypercert-id";
import { HypercertState } from "@/hypercerts/fragments/hypercert-state.fragment";
import TransferRestrictionsLabel from "./transfer-restrictions-label";

export default function Creator({ hypercert }: { hypercert: HypercertState }) {
  if (!hypercert) return null;
  return (
    <div className="flex flex-wrap items-center space-x-1 text-sm text-slate-600 font-medium space-y-1">
      {hypercert.hypercert_id && (
        <CopyableHypercertId id={hypercert.hypercert_id} />
      )}
      {hypercert.creator_address && (
        <div className="flex space-x-1 items-center">
          <span>by</span>
          <EthAddress address={hypercert.creator_address} showEnsName />
        </div>
      )}
      <div className="flex space-x-1 items-center">
        <TransferRestrictionsLabel
          hypercertId={hypercert.hypercert_id || ""}
          showSeparator
        />
      </div>
      {hypercert.contract?.chain_id && (
        <div className="flex space-x-2 items-center">
          <span className="text-slate-400">•</span>
          <span>
            {
              SUPPORTED_CHAINS.find(
                (x) =>
                  x.id ===
                  (Number(
                    hypercert.contract?.chain_id,
                  ) as SupportedChainIdType),
              )?.name
            }
          </span>
        </div>
      )}
      {hypercert?.creation_block_number && (
        <div className="flex space-x-2 items-center">
          <span className="text-slate-400"> — </span>
          <span
            className="flex space-x-1 items-center"
            title={`Minted on block ${hypercert.creation_block_number}`}
            aria-label={`Minted on block ${hypercert.creation_block_number}`}
          >
            <Cuboid className="w-4 h-4" />
            <p>{hypercert.creation_block_number}</p>
          </span>
        </div>
      )}
    </div>
  );
}
