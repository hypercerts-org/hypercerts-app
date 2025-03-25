import { Address, Chain } from "viem";
import { HypercertClient } from "@hypercerts-org/sdk";
import { UseWalletClientReturnType } from "wagmi";

import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";

export interface ClaimHypercertParams {
  tokenId: bigint;
  units: bigint;
  proof: `0x${string}`[];
}

export abstract class ClaimHypercertStrategy {
  constructor(
    protected address: Address,
    protected chain: Chain,
    protected client: HypercertClient,
    protected dialogContext: ReturnType<typeof useStepProcessDialogContext>,
    protected walletClient: UseWalletClientReturnType,
  ) {}

  abstract execute(params: ClaimHypercertParams): Promise<void>;
}
