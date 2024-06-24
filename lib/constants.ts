import { mainnet, optimism, sepolia } from "viem/chains";

const chainEntries = [
  [sepolia.id, "Sepolia"],
  [mainnet.id, "Ethereum"],
  [optimism.id, "OP Mainnet"],
] as const;

export const SUPPORTED_CHAINS = new Map(chainEntries);

export type SupportedChainIdType = (typeof chainEntries)[number][0];

export const apiEnvironment: "test" | "production" = (process.env[
  "API_ENVIRONMENT"
] || "test") as "test" | "production";
