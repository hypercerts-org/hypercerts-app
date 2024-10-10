import { useMutation } from "@tanstack/react-query";
import { useAccount, useSignTypedData } from "wagmi";
import { hypercertApiSigningDomain } from "@/configs/constants";
import { HYPERCERTS_API_URL_REST } from "@/configs/hypercerts";

interface BlueprintMintRequest {
  signature: string;
  chain_id: number;
  minter_address: string;
  tx_hash: string;
}

export const useQueueMintBlueprint = () => {
  const { address, chainId } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  return useMutation({
    mutationKey: ["queueMintBlueprint"],
    mutationFn: async ({
      blueprintId,
      txHash,
    }: {
      blueprintId: number;
      txHash: string;
    }) => {
      if (!chainId) {
        throw new Error("No chainId found");
      }

      if (!address) {
        throw new Error("No address found");
      }

      const signature = await signTypedDataAsync({
        account: address,
        domain: hypercertApiSigningDomain(chainId),
        types: {
          Blueprint: [
            { name: "id", type: "uint256" },
            {
              name: "tx_hash",
              type: "string",
            },
          ],
          BlueprintQueueMintRequest: [{ name: "blueprint", type: "Blueprint" }],
        },
        primaryType: "BlueprintQueueMintRequest",
        message: {
          blueprint: { id: BigInt(blueprintId), tx_hash: txHash },
        },
      });

      const body: BlueprintMintRequest = {
        signature: signature,
        chain_id: chainId,
        minter_address: address,
        tx_hash: txHash,
      };
      await fetch(`${HYPERCERTS_API_URL_REST}/blueprints/mint/${blueprintId}`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Error updating blueprint");
        }
      });
    },
  });
};
