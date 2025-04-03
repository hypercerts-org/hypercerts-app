import { ChainFactory } from "./chainFactory";
import { EvmClientFactory } from "./evmClient";
import { unstable_cache } from "next/cache";

export const isContract = unstable_cache(
  async (address: string) => {
    const supportedChains = ChainFactory.getSupportedChains();
    const clients = supportedChains.map((chainId) =>
      EvmClientFactory.createClient(chainId),
    );

    const results = await Promise.allSettled(
      clients.map((client) =>
        client.getCode({ address: address as `0x${string}` }),
      ),
    );

    return results.some(
      (result) =>
        result.status === "fulfilled" &&
        result.value !== undefined &&
        result.value !== "0x",
    );
  },
  ["isContract"],
  { revalidate: 604800 }, // 1 week
);
