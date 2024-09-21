import { useMutation } from "@tanstack/react-query";
import { CollectionCreateFormValues } from "@/components/collections/collection-form";
import { HYPERCERTS_API_URL_REST } from "@/configs/hypercerts";
import { useAccount, useSignMessage } from "wagmi";
import revalidatePathServerAction from "@/app/actions";

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

export const useCreateHyperboard = () => {
  const { chainId, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  return useMutation({
    mutationKey: ["hyperboard", "create"],
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
      const response = await fetch(`${HYPERCERTS_API_URL_REST}/hyperboards`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      await revalidatePathServerAction(["/collections", `/profile/${address}`]);
      return response;
    },
  });
};

interface HyperboardUpdateRequest {
  id: string;
  chainId: number;
  title: string;
  collections: {
    id: string;
    title: string;
    description: string;
    hypercerts: {
      id?: string;
      hypercertId: string;
      factor: number;
    }[];
  }[];
  backgroundImg?: string;
  borderColor: string;
  adminAddress: string;
  signature: string;
}

export const useUpdateHyperboard = () => {
  const { chainId, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  return useMutation({
    mutationKey: ["hyperboard", "update"],
    mutationFn: async (data: CollectionCreateFormValues) => {
      if (!chainId) {
        throw new Error("Chain ID not found");
      }

      if (!address) {
        throw new Error("Address not found");
      }

      if (!data.id) {
        throw new Error("Hyperboard ID not found");
      }

      if (!data.collectionId) {
        throw new Error("Collection ID not found");
      }

      const signature = await signMessageAsync({
        message: "Update hyperboard",
      });
      const body: HyperboardUpdateRequest = {
        id: data.id,
        title: data.title,
        collections: [
          {
            id: data.collectionId,
            title: data.title,
            description: data.description,
            hypercerts: data.hypercerts.map((hc) => {
              if (!hc.id) {
                return {
                  hypercertId: hc.hypercertId,
                  factor: hc.factor,
                };
              }
              return {
                id: hc.id,
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
      const response = await fetch(
        `${HYPERCERTS_API_URL_REST}/hyperboards/${data.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      await revalidatePathServerAction(["/collections", `/profile/${address}`]);
      return response;
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
      const response = await fetch(
        `${HYPERCERTS_API_URL_REST}/hyperboards/${hyperboardId}?adminAddress=${address}&signature=${signature}`,
        {
          method: "DELETE",
          body: JSON.stringify({ signature, adminAddress: address }),
        },
      );
      await revalidatePathServerAction(["/collections", `/profile/${address}`]);
      return response;
    },
  });
};
