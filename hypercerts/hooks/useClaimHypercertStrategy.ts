import { isAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useRouter } from "next/navigation";

import { useAccountStore } from "@/lib/account-store";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";

import { ClaimHypercertStrategy } from "../ClaimHypercertStrategy";
import { EOAClaimHypercertStrategy } from "../EOAClaimHypercertStrategy";
import { SafeClaimHypercertStrategy } from "../SafeClaimHypercertStrategy";

export const useClaimHypercertStrategy = (): (() => ClaimHypercertStrategy) => {
  const { address, chain } = useAccount();
  const { client } = useHypercertClient();
  const { selectedAccount } = useAccountStore();
  const dialogContext = useStepProcessDialogContext();
  const walletClient = useWalletClient();
  const router = useRouter();

  return () => {
    const activeAddress =
      selectedAccount?.address || (address as `0x${string}`);

    if (!activeAddress || !isAddress(activeAddress))
      throw new Error("No address found");
    if (!chain) throw new Error("No chain found");
    if (!client) throw new Error("No HypercertClient found");
    if (!walletClient) throw new Error("No walletClient found");
    if (!dialogContext) throw new Error("No dialogContext found");

    return selectedAccount?.type === "safe"
      ? new SafeClaimHypercertStrategy(
            router,
            router,
          activeAddress,
          chain,
          client,
          dialogContext,
          walletClient,
          router,
        )
      : new EOAClaimHypercertStrategy(
          activeAddress,
          chain,
          client,
          dialogContext,
          walletClient,
          router,
        );
  };
};
