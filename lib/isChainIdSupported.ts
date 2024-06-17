import { supportedChains } from "../configs/wagmi";

export function isChainIdSupported(id: number | undefined) {
  if (id === undefined) return false;
  return supportedChains.find((c) => c.id === id) !== undefined;
}
