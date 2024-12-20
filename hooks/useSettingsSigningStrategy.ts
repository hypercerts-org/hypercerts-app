import { Eip1193Provider } from "@safe-global/protocol-kit";
import { useAccount, useWalletClient } from "wagmi";

import { useAccountStore } from "@/lib/account-store";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { EOASettingsSigningStrategy } from "@/settings/EOASettingsSigningStrategy";
import { SafeSettingsSigningStrategy } from "@/settings/SafeSettingsSigningStrategy";
import { SettingsSigningStrategy } from "@/settings/SettingsSigningStrategy";

export const useSettingsSigningStrategy =
  (): (() => SettingsSigningStrategy) => {
    const { selectedAccount } = useAccountStore();
    const { address, chainId } = useAccount();
    const { data: walletClient } = useWalletClient();
    const dialogContext = useStepProcessDialogContext();

    return () => {
      if (!chainId) {
        throw new Error("No chainId found");
      }

      if (selectedAccount?.type === "safe") {
        if (!selectedAccount) throw new Error("No selected account found");
        if (!walletClient) throw new Error("No walletClient found");

        return new SafeSettingsSigningStrategy(
          selectedAccount.address,
          chainId,
          walletClient as unknown as Eip1193Provider,
        );
      }

      if (!address) throw new Error("No address found");
      return new EOASettingsSigningStrategy(address, chainId, dialogContext);
    };
  };
