import { useMutation } from "@tanstack/react-query";
import { HypercertFormValues } from "@/components/hypercert/hypercert-minting-form";
import { useAccount, useSignTypedData } from "wagmi";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { hypercertApiSigningDomain } from "@/configs/constants";
import { HYPERCERTS_API_URL_REST } from "@/configs/hypercerts";
import revalidatePathServerAction from "@/app/actions";

export interface BlueprintCreateRequest {
  form_values: unknown;
  minter_address: `0x${string}`;
  admin_address: `0x${string}`;
  signature: `0x${string}`;
  chain_id: number;
}

export const useCreateBlueprint = () => {
  const { address, chainId } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const {
    setDialogStep: setStep,
    setSteps,
    setOpen,
  } = useStepProcessDialogContext();

  return useMutation({
    mutationKey: ["createBlueprint"],
    mutationFn: async ({
      minterAddress,
      formValues,
    }: {
      minterAddress: string;
      formValues: Omit<HypercertFormValues, "blueprint_minter_address">;
    }) => {
      if (!address) {
        throw new Error("No address found");
      }

      if (!chainId) {
        throw new Error("No chainId found");
      }

      setSteps([
        {
          id: "Awaiting signature",
          description: "Awaiting signature",
        },
        {
          id: "Creating blueprint",
          description: "Creating blueprint",
        },
      ]);
      setOpen(true);

      await setStep("Awaiting signature");
      let signature: string;

      try {
        signature = await signTypedDataAsync({
          account: address,
          domain: hypercertApiSigningDomain(chainId),
          types: { Message: [{ name: "message", type: "string" }] },
          primaryType: "Message",
          message: {
            message: `Create blueprint for ${address}`,
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
        return null;
      }

      await setStep("Creating blueprint");

      try {
        const { acceptTerms, confirmContributorsPermission, ...form_values } =
          formValues;
        const body: BlueprintCreateRequest = {
          form_values,
          minter_address: minterAddress as `0x${string}`,
          admin_address: address,
          signature: signature as `0x${string}`,
          chain_id: chainId,
        };
        await fetch(`${HYPERCERTS_API_URL_REST}/blueprints`, {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => {
          if (!res.ok) {
            throw new Error("Error creating blueprint");
          }
        });
        await setStep("Updating blueprint", "completed");
        await revalidatePathServerAction([
          "/blueprints",
          `/profile/${address}`,
        ]);
        setTimeout(() => {
          setOpen(false);
        }, 2000);
      } catch (error) {
        await setStep(
          "Creating blueprint",
          "error",
          error instanceof Error ? error.message : "Error creating blueprint",
        );
      }
    },
  });
};
