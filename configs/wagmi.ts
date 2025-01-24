import { cookieStorage, createConfig, createStorage, http } from "wagmi";

import { siteConfig } from "./site";
import { walletConnect } from "wagmi/connectors";
import { fallback, HttpTransport } from "viem";
import { mainnet } from "viem/chains";
import { SUPPORTED_CHAINS } from "@/configs/constants";
import { EvmClientFactory } from "@/lib/evmClient";

const metadata = {
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.origin, // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/124626532"],
};

// Mainnet needs to be here for the ENS lookup
const supportedChainsWithMainnetForEnsLookup = [
  ...SUPPORTED_CHAINS,
  mainnet,
] as const;

// Create wagmiConfig
export const config = createConfig({
  chains: supportedChainsWithMainnetForEnsLookup,
  connectors: [
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
  ],
  pollingInterval: 2_000,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: supportedChainsWithMainnetForEnsLookup.reduce(
    (acc, chain) => {
      const urls = EvmClientFactory.getAllAvailableUrls(chain.id);
      // @ts-expect-error
      acc[chain.id] = fallback([...urls.map((url) => http(url)), http()]);
      return acc;
    },
    {} as Record<number, HttpTransport>,
  ),
});
