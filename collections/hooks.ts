import { useMutation } from "@tanstack/react-query";
import { CollectionCreateFormValues } from "@/components/collections/collection-create-form";
import { HYPERCERTS_API_URL_REST } from "@/configs/hypercerts";
import { useAccount, useSignMessage } from "wagmi";

interface HyperboardCreateRequest {
  chainId: number;
  title: string;
  collections: {
    title: string;
    description: string;
    hypercerts: {
      hypercertId: string;
      factor: number;
    }[];
  }[];
  backgroundImg?: string;
  borderColor: string;
  adminAddress: string;
  signature: string;
}

export const useCreateCollection = () => {
  const { chainId, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  return useMutation({
    mutationKey: ["collection", "create"],
    mutationFn: async (data: CollectionCreateFormValues) => {
      if (!chainId) {
        throw new Error("Chain ID not found");
      }

      if (!address) {
        throw new Error("Address not found");
      }

      const signature = await signMessageAsync({
        message: "Create hyperboard",
      });
      const body: HyperboardCreateRequest = {
        title: data.title,
        collections: [
          {
            title: data.title,
            description: data.description,
            hypercerts: data.hypercerts.map((hc) => {
              return {
                hypercertId: hc.hypercertId,
                factor: hc.factor,
              };
            }),
          },
        ],
        borderColor: data.borderColor,
        chainId: chainId,
        backgroundImg: data.backgroundImg,
        adminAddress: address,
        signature: signature,
      };
      return await fetch(`${HYPERCERTS_API_URL_REST}/hyperboards`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
};

export const useDeleteCollection = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  return useMutation({
    mutationKey: ["collection", "delete"],
    mutationFn: async (hyperboardId: string) => {
      const signature = await signMessageAsync({
        message: "Delete hyperboard",
      });
      return await fetch(
        `${HYPERCERTS_API_URL_REST}/hyperboards/${hyperboardId}?adminAddress=${address}&signature=${signature}`,
        {
          method: "DELETE",
          body: JSON.stringify({ signature, adminAddress: address }),
        },
      );
    },
  });
};
