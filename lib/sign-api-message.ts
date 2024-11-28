import { type SignTypedDataParameters } from "@wagmi/core";
import { signTypedData } from "@wagmi/core";

import { config as wagmiConfig } from "@/configs/wagmi";
import { hypercertApiSigningDomain } from "@/configs/constants";

export async function signMessage(
  signerAddress: string,
  chainId: number,
  config: Pick<SignTypedDataParameters, "types" | "primaryType" | "message">,
): Promise<`0x${string}`> {
  if (!chainId) {
    throw new Error("No chainId found");
  }

  // The type assertion to any is necessary because TS will otherwise complain,
  // but the config is valid.
  const signature = await signTypedData(wagmiConfig as any, {
    account: signerAddress,
    domain: hypercertApiSigningDomain(chainId),
    types: config.types,
    primaryType: config.primaryType,
    message: config.message,
  });

  if (!signature) {
    throw new Error("No signature found");
  }

  return signature as `0x${string}`;
}
