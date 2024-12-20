import revalidatePathServerAction from "@/app/actions";
import { SettingsFormValues } from "@/components/settings/settings-form";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { HYPERCERTS_API_URL_REST } from "@/configs/hypercerts";
import { signMessage } from "@/lib/sign-api-message";

import { SettingsSigningStrategy } from "./SettingsSigningStrategy";

const STEP_1 = "step1";
const STEP_2 = "step2";

export class EOASettingsSigningStrategy extends SettingsSigningStrategy {
  constructor(
    address: string,
    chainId: number,
    private dialogContext: ReturnType<typeof useStepProcessDialogContext>,
  ) {
    super(address, chainId);
  }

  async sign(user: SettingsFormValues): Promise<void> {
    const { setDialogStep: setStep, setSteps, setOpen } = this.dialogContext;

    setSteps([
      { id: STEP_1, description: "Awaiting signature" },
      { id: STEP_2, description: "Updating user" },
    ]);
    setOpen(true);

    await setStep(STEP_1);

    let signature: string;
    try {
      signature = await signMessage(this.address, this.chainId, {
        types: {
          User: [
            { name: "displayName", type: "string" },
            { name: "avatar", type: "string" },
          ],
          UserUpdateRequest: [{ name: "user", type: "User" }],
        },
        primaryType: "UserUpdateRequest",
        message: {
          user: {
            displayName: user.displayName || "",
            avatar: user.avatar || "",
          },
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
      await makeRequest(this.address, {
        type: "eoa",
        display_name: user.displayName,
        avatar: user.avatar,
        signature,
        chain_id: this.chainId,
      });
      await setStep(STEP_2, "completed");
      await revalidatePathServerAction("/settings");
      setTimeout(() => setOpen(false), 2000);
    } catch (error) {
      await setStep(
        STEP_2,
        "error",
        error instanceof Error ? error.message : "Error updating user",
      );
      throw error;
    }
  }
}

async function makeRequest(address: string, body: Record<string, unknown>) {
  const response = await fetch(`${HYPERCERTS_API_URL_REST}/users/${address}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error updating user");
  }
  return response.json();
}
