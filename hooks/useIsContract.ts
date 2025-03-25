import { useState, useEffect } from "react";

import { ChainFactory } from "../lib/chainFactory";
import { EvmClientFactory } from "../lib/evmClient";

const contractCache = new Map<string, boolean>();

export function useIsContract(address: string) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading || contractCache.has(address)) return;

    async function checkContract() {
      setIsLoading(true);
      try {
        const supportedChains = ChainFactory.getSupportedChains();
        const clients = supportedChains.map((chainId) =>
          EvmClientFactory.createClient(chainId),
        );

        const results = await Promise.allSettled(
          clients.map((client) =>
            client.getCode({ address: address as `0x${string}` }),
          ),
        );

        const result = results.some(
          (result) =>
            result.status === "fulfilled" &&
            result.value !== undefined &&
            result.value !== "0x",
        );

        contractCache.set(address, result);
      } finally {
        setIsLoading(false);
      }
    }

    checkContract();
  }, [address]);

  return {
    isContract: contractCache.get(address) ?? null,
    isLoading,
  };
}
