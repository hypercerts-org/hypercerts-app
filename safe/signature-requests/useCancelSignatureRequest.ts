import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { HYPERCERTS_API_URL_REST } from "@/configs/hypercerts";
import { signMessage } from "@/lib/sign-api-message";
import revalidatePathServerAction from "@/app/actions";

const STEP_1 = "step1";
const STEP_2 = "step2";

export const useCancelSignatureRequest = () => {
  const { address, chainId } = useAccount();
  const dialogContext = useStepProcessDialogContext();

  return useMutation({
    mutationKey: ["cancelSignatureRequest"],
    mutationFn: async ({
      safeAddress,
      messageHash,
    }: {
      safeAddress: string;
      messageHash: string;
    }) => {
      if (!address || !chainId) {
        throw new Error("No address or chainId found");
      }

      const { setDialogStep: setStep, setSteps, setOpen } = dialogContext;

      setSteps([
        { id: STEP_1, description: "Sign cancellation request" },
        { id: STEP_2, description: "Canceling request" },
      ]);
      setOpen(true);

      await setStep(STEP_1);

      let signature: string;
      try {
        signature = await signMessage(address, chainId, {
          types: {
            SignatureRequest: [
              { name: "cancelSignatureRequestId", type: "string" },
            ],
          },
          primaryType: "SignatureRequest",
          message: {
            cancelSignatureRequestId: `${safeAddress}-${messageHash}`,
          },
        });
      } catch (error) {
        await setStep(
          STEP_1,
          "error",
          error instanceof Error ? error.message : "Error signing message",
        );
        throw error;
      }

      await setStep(STEP_2);

      try {
        const response = await fetch(
          `${HYPERCERTS_API_URL_REST}/signature-requests/${safeAddress}-${messageHash}/cancel`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              signature,
              owner_address: address,
              chain_id: chainId,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to cancel signature request");
        }

        await setStep(STEP_2, "completed");
        await revalidatePathServerAction("/settings");
        setTimeout(() => setOpen(false), 2000);
      } catch (error) {
        await setStep(
          STEP_2,
          "error",
          error instanceof Error ? error.message : "Error canceling request",
        );
        throw error;
      }
    },
  });
};
