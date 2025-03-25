import { useAccount, useWalletClient } from "wagmi";
import { useRouter } from "next/navigation";

import { useAccountStore } from "@/lib/account-store";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";

import { BuyFractionalStrategy } from "./BuyFractionalStrategy";
import { EOABuyFractionalStrategy } from "./EOABuyFractionalStrategy";
import { SafeBuyFractionalStrategy } from "./SafeBuyFractionalStrategy";
import { getAddress, isAddress } from "viem";

export const useBuyFractionalStrategy = (): (() => BuyFractionalStrategy) => {
  const { address, chainId } = useAccount();
  const { client: exchangeClient } = useHypercertExchangeClient();
  const { selectedAccount } = useAccountStore();
  const dialogContext = useStepProcessDialogContext();
  const router = useRouter();
  const walletClient = useWalletClient();

  const activeAddress = selectedAccount?.address || address;

  return () => {
    if (!activeAddress || !isAddress(activeAddress))
      throw new Error("No address found");
    if (!chainId) throw new Error("No chainId found");
    if (!exchangeClient) throw new Error("No HypercertExchangeClient found");
    if (!walletClient) throw new Error("No walletClient found");
    if (!dialogContext) throw new Error("No dialogContext found");
    if (!router) throw new Error("No router found");

    const buyerAddress = getAddress(activeAddress);

    if (selectedAccount?.type === "safe") {
      if (!selectedAccount) throw new Error("No selected account found");
      return new SafeBuyFractionalStrategy(
        buyerAddress,
        chainId,
        exchangeClient,
        dialogContext,
        walletClient,
        router,
      );
    }

    return new EOABuyFractionalStrategy(
      buyerAddress,
      chainId,
      exchangeClient,
      dialogContext,
      walletClient,
      router,
    );
  };
};
