import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { mainnet, sepolia } from "viem/chains";

import { siteConfig } from "./site";
import { walletConnect } from "wagmi/connectors";

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.origin, // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/124626532"],
};

export const supportedChains = [mainnet, sepolia];

// Create wagmiConfig
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [walletConnect({ projectId })],
  pollingInterval: 2_000,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    // [celo.id]: http(),
    // [base.id]: http(),
    // [baseSepolia.id]: http(),
    // [optimism.id]: http(),
  },
});
