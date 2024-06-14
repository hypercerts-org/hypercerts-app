import { useAccount, useChainId, useWalletClient } from "wagmi";
import {
  WETHAbi,
  addressesByNetwork,
  utils,
} from "@hypercerts-org/marketplace-sdk";
import { readContract } from "viem/actions";

export const useGetCurrentERC20Allowance = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const hypercertsExchangeAddress =
    addressesByNetwork[utils.asDeployedChain(chainId)].EXCHANGE_V2;

  const { data: walletClient } = useWalletClient();

  return async (currency: `0x${string}`) => {
    if (!walletClient) {
      return BigInt(0);
    }

    const data = await readContract(walletClient, {
      abi: WETHAbi,
      address: currency as `0x${string}`,
      functionName: "allowance",
      args: [address, hypercertsExchangeAddress],
    });

    return data as bigint;
  };
};
