import { isAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";

import { useAccountStore } from "@/lib/account-store";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { useQueueMintBlueprint } from "@/blueprints/hooks/queueMintBlueprint";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";

import { EOAMintHypercertStrategy } from "../EOAMintHypercertStrategy";
import { MintHypercertStrategy } from "../MintHypercertStrategy";
import { SafeMintHypercertStrategy } from "../SafeMintHypercertStrategy";

export const useMintHypercertStrategy = () => {
  const { address, chain } = useAccount();
  const { client } = useHypercertClient();
  const { selectedAccount } = useAccountStore();
  const dialogContext = useStepProcessDialogContext();
  const queueMintBlueprint = useQueueMintBlueprint();
  const walletClient = useWalletClient();

  return (blueprintId?: number): MintHypercertStrategy => {
    const activeAddress =
      selectedAccount?.address || (address as `0x${string}`);

    if (!activeAddress || !isAddress(activeAddress))
      throw new Error("No address found");
    if (!chain) throw new Error("No chain found");
    if (!client) throw new Error("No HypercertClient found");
    if (!walletClient) throw new Error("No walletClient found");
    if (!dialogContext) throw new Error("No dialogContext found");

    // If there's a blueprintId in the search params, we can't use the Safe strategy.
    if (selectedAccount?.type === "safe" && !blueprintId) {
      return new SafeMintHypercertStrategy(
        activeAddress,
        chain,
        client,
        dialogContext,
        walletClient,
      );
    }

    return new EOAMintHypercertStrategy(
      activeAddress,
      chain,
      client,
      dialogContext,
      queueMintBlueprint,
      walletClient,
    );
  };
};
