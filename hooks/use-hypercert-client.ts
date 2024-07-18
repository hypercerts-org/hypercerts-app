"use client";
import { HypercertClient } from "@hypercerts-org/sdk";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { apiEnvironment, supportedChains } from "@/lib/constants";

export const useHypercertClient = () => {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const [client, setClient] = useState<HypercertClient>();

  useEffect(() => {
    if (!walletClient || !isConnected) {
      return;
    }

    if (!supportedChains.find((chain) => chain.id === walletClient.chain.id)) {
      return;
    }
    setClient(
      new HypercertClient({
        environment: apiEnvironment,
        // @ts-ignore - wagmi and viem have different typing
        walletClient,
      }),
    );
  }, [walletClient, isConnected]);

  return { client };
};
