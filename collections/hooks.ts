import { useMutation } from "@tanstack/react-query";
import { CollectionCreateFormValues } from "@/components/collections/collection-form";
import { HYPERCERTS_API_URL_REST } from "@/configs/hypercerts";
import { useAccount, useSignTypedData } from "wagmi";
import revalidatePathServerAction from "@/app/actions";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { useRouter } from "next/navigation";

export interface HyperboardCreateRequest {
  chainIds: number[];
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
  const { signTypedDataAsync } = useSignTypedData();
  const { push } = useRouter();
  const {
    setDialogStep: setStep,
    setSteps,
    setOpen,
  } = useStepProcessDialogContext();
  return useMutation({
    mutationKey: ["hyperboard", "create"],
    mutationFn: async (data: CollectionCreateFormValues) => {
      if (!chainId) {
        throw new Error("Chain ID not found");
      }

      if (!address) {
        throw new Error("Address not found");
      }

      setSteps([
        {
          id: "Awaiting signature",
          description: "Awaiting signature",
        },
        {
          id: "Creating Hyperboard",
          description: "Creating Hyperboard",
        },
      ]);

      setOpen(true);
      await setStep("Awaiting signature", "active");
      let signature: string;

      try {
        signature = await signTypedDataAsync({
          account: address,
          domain: {
            name: "Hypercerts",
            version: "1",
            chainId: chainId,
          },
          types: {
            Hyperboard: [{ name: "title", type: "string" }],
            HyperboardCreateRequest: [
              { name: "hyperboard", type: "Hyperboard" },
            ],
          },
          primaryType: "HyperboardCreateRequest",
          message: {
            hyperboard: {
              title: data.title,
            },
          },
        });
        if (!signature) {
          throw new Error("No signature found");
        }
      } catch (error) {
        await setStep(
          "Awaiting signature",
          "error",
          error instanceof Error ? error.message : "Error signing message",
        );
        return;
      }
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
        chainIds: [chainId],
        backgroundImg: data.backgroundImg,
        adminAddress: address,
        signature: signature,
      };

      await setStep("Creating Hyperboard");
      try {
        const response = await fetch(`${HYPERCERTS_API_URL_REST}/hyperboards`, {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.data?.message || "Error creating hyperboard");
        }
        const hyperboardId = json.data?.id;
        await revalidatePathServerAction([
          "/collections",
          `/profile/${address}`,
        ]);
        if (!hyperboardId) {
          throw new Error("Hyperboard ID not found");
        }
        await setStep("Creating Hyperboard", "completed");
        setTimeout(() => {
          push(`/collections/${hyperboardId}`);
          setOpen(false);
        }, 2000);
      } catch (error) {
        await setStep(
          "Creating Hyperboard",
          "error",
          error instanceof Error ? error.message : "Error creating hyperboard",
        );
      }
    },
  });
};

export interface HyperboardUpdateRequest {
  id: string;
  chainIds: number[];
  title: string;
  collections: {
    id?: string;
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

export const useUpdateHyperboard = () => {
  const { chainId, address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const { push } = useRouter();
  const {
    setDialogStep: setStep,
    setSteps,
    setOpen,
  } = useStepProcessDialogContext();
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

      setSteps([
        {
          id: "Awaiting signature",
          description: "Awaiting signature",
        },
        {
          id: "Updating Hyperboard",
          description: "Updating Hyperboard",
        },
      ]);

      setOpen(true);
      await setStep("Awaiting signature", "active");
      let signature: string;

      try {
        signature = await signTypedDataAsync({
          account: address,
          domain: {
            name: "Hypercerts",
            version: "1",
            chainId: chainId,
          },
          types: {
            Hyperboard: [{ name: "id", type: "string" }],
            HyperboardUpdateRequest: [
              { name: "hyperboard", type: "Hyperboard" },
            ],
          },
          primaryType: "HyperboardUpdateRequest",
          message: {
            hyperboard: {
              id: data.id,
            },
          },
        });
        if (!signature) {
          throw new Error("No signature found");
        }
      } catch (error) {
        await setStep(
          "Awaiting signature",
          "error",
          error instanceof Error ? error.message : "Error signing message",
        );
        return;
      }
      const body: HyperboardUpdateRequest = {
        id: data.id,
        title: data.title,
        collections: [
          {
            id: data.collectionId,
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
        chainIds: [chainId],
        backgroundImg: data.backgroundImg,
        adminAddress: address,
        signature: signature,
      };

      await setStep("Updating Hyperboard");
      try {
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
        await setStep("Updating Hyperboard", "completed");

        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.data?.message || "Error updating hyperboard");
        }
        const hyperboardId = json.data?.id;
        await revalidatePathServerAction([
          "/collections",
          `/profile/${address}`,
        ]);
        if (!hyperboardId) {
          throw new Error("Hyperboard ID not found");
        }
        await setStep("Updating Hyperboard", "completed");
        setTimeout(() => {
          push(`/collections/${hyperboardId}`);
          setOpen(false);
        }, 2000);
      } catch (error) {
        await setStep(
          "Updating Hyperboard",
          "error",
          error instanceof Error ? error.message : "Error updating hyperboard",
        );
      }
    },
  });
};

export const useDeleteCollection = () => {
  const { address, chainId } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const {
    setDialogStep: setStep,
    setSteps,
    setOpen,
  } = useStepProcessDialogContext();

  return useMutation({
    mutationKey: ["collection", "delete"],
    mutationFn: async (hyperboardId: string) => {
      if (!chainId) {
        throw new Error("Chain ID not found");
      }

      setSteps([
        {
          id: "Awaiting signature",
          description: "Awaiting signature",
        },
        {
          id: "Deleting Hyperboard",
          description: "Deleting Hyperboard",
        },
      ]);

      setOpen(true);
      await setStep("Awaiting signature", "active");
      let signature: string;

      try {
        signature = await signTypedDataAsync({
          account: address,
          domain: {
            name: "Hypercerts",
            version: "1",
            chainId: chainId,
          },
          types: {
            Hyperboard: [{ name: "id", type: "string" }],
            HyperboardDeleteRequest: [
              { name: "hyperboard", type: "Hyperboard" },
            ],
          },
          primaryType: "HyperboardDeleteRequest",
          message: {
            hyperboard: {
              id: hyperboardId,
            },
          },
        });
        if (!signature) {
          throw new Error("No signature found");
        }
      } catch (error) {
        await setStep(
          "Awaiting signature",
          "error",
          error instanceof Error ? error.message : "Error signing message",
        );
        return;
      }
      await setStep("Deleting Hyperboard");
      try {
        const response = await fetch(
          `${HYPERCERTS_API_URL_REST}/hyperboards/${hyperboardId}?adminAddress=${address}&signature=${signature}`,
          {
            method: "DELETE",
            body: JSON.stringify({ signature, adminAddress: address }),
          },
        );
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.data?.message || "Error deleting hyperboard");
        }
        await revalidatePathServerAction([
          "/collections",
          `/profile/${address}`,
        ]);
        await setStep("Deleting Hyperboard", "completed");
        setTimeout(() => {
          setOpen(false);
          window.location.reload();
        }, 2000);
      } catch (error) {
        await setStep(
          "Deleting Hyperboard",
          "error",
          error instanceof Error ? error.message : "Error deleting hyperboard",
        );
      }
    },
  });
};
