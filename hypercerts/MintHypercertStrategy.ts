import { Address, Chain } from "viem";
import {
  HypercertClient,
  HypercertMetadata,
  TransferRestrictions,
  AllowlistEntry,
} from "@hypercerts-org/sdk";
import { UseWalletClientReturnType } from "wagmi";

import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";

export interface MintHypercertParams {
  metaData: HypercertMetadata;
  units: bigint;
  transferRestrictions: TransferRestrictions;
  allowlistRecords?: AllowlistEntry[] | string;
  blueprintId?: number;
}

export abstract class MintHypercertStrategy {
  constructor(
    protected address: Address,
    protected chain: Chain,
    protected client: HypercertClient,
    protected dialogContext: ReturnType<typeof useStepProcessDialogContext>,
    protected walletClient: UseWalletClientReturnType,
  ) {}

  abstract execute(params: MintHypercertParams): Promise<void>;
}
