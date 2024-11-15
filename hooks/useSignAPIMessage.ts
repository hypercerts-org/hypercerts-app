import { useSignTypedData, useAccount } from "wagmi";
import { type SignTypedDataParameters } from "@wagmi/core";

import { hypercertApiSigningDomain } from "@/configs/constants";

/**
 * A function to sign a message with the Hypercerts API signing domain
 * @param config - The configuration for the message signing
 * @returns The signature of the message
 * @throws An error if the message cannot be signed
 */
export const useSignAPIMessage = () => {
  const { signTypedDataAsync } = useSignTypedData();
  const { address, chainId } = useAccount();

  const signMessage = async (
    config: Pick<
      SignTypedDataParameters,
      "types" | "primaryType" | "message" | "account"
    >,
  ): Promise<`0x${string}`> => {
    const { types, primaryType, message, account } = config;

    try {
      if (!chainId) {
        throw new Error("No chainId found");
      }

      const signature = await signTypedDataAsync({
        account: account || address,
        domain: hypercertApiSigningDomain(chainId),
        types,
        primaryType,
        message,
      });

      if (!signature) {
        throw new Error("No signature found");
      }

      return signature as `0x${string}`;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Error signing message");
    }
  };

  return { signMessage };
};
