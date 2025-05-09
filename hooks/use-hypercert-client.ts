"use client";
import { HypercertClient } from "@hypercerts-org/sdk";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ENVIRONMENT, SUPPORTED_CHAINS } from "@/configs/constants";
import { EvmClientFactory } from "@/lib/evmClient";
import { PublicClient } from "viem";

export const useHypercertClient = () => {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const [client, setClient] = useState<HypercertClient>();

  let publicClient: PublicClient | undefined;
  try {
    publicClient = walletClient?.chain.id
      ? EvmClientFactory.createClient(walletClient.chain.id)
      : undefined;
  } catch (error) {
    console.error(`Error creating public client: ${error}`);
  }

  useEffect(() => {
    if (!walletClient || !isConnected) {
      return;
    }

    if (!SUPPORTED_CHAINS.find((chain) => chain.id === walletClient.chain.id)) {
      return;
    }
    setClient(
      new HypercertClient({
        environment: ENVIRONMENT,
        // @ts-ignore - wagmi and viem have different typing
        walletClient,
        // @ts-ignore - wagmi and viem have different typing
        publicClient,
      }),
    );
  }, [walletClient, isConnected]);

  return { client };
};
