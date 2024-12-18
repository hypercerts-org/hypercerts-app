import { useAccount } from "wagmi";
import { mainnet } from "viem/chains";
import { useEnsName, useEnsAvatar } from "wagmi";
import { normalize } from "viem/ens";
import { useEffect } from "react";

import { useEnsStore } from "@/lib/ens-store";
import { type Account, useAccountStore } from "@/lib/account-store";

type AccountDetails = {
  address: `0x${string}`;
  accountType: Account["type"];
  displayName: string;
  ensName?: string;
  ensAvatar?: string;
  isLoading: boolean;
};

export function useAccountDetails(): AccountDetails {
  const { address } = useAccount();
  const { selectedAccount } = useAccountStore();
  const { getEnsData, setEnsData } = useEnsStore();

  const targetAddress = selectedAccount?.address || address;
  const storedEnsData = targetAddress ? getEnsData(targetAddress) : undefined;

  // If we have stored ENS data, we can skip the next two hooks. Since hooks must
  // be called on every render we use the ternary operator to avoid unnecessary calls.
  const { data: ensName, isLoading: isLoadingName } = useEnsName({
    address: !storedEnsData ? (targetAddress as `0x${string}`) : undefined,
    chainId: mainnet.id,
  });

  const { data: ensAvatar, isLoading: isLoadingAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: mainnet.id,
  });

  useEffect(() => {
    if (targetAddress && (ensName || ensAvatar)) {
      setEnsData(targetAddress, {
        name: ensName || undefined,
        avatar: ensAvatar || undefined,
      });
    }
  }, [targetAddress, ensName, ensAvatar, setEnsData]);

  return {
    address: targetAddress as `0x${string}`,
    accountType: selectedAccount?.type || "personal",
    displayName: getDisplayName(
      selectedAccount?.type,
      storedEnsData?.name || ensName,
    ),
    ensName: storedEnsData?.name || ensName || undefined,
    ensAvatar: storedEnsData?.avatar || ensAvatar || undefined,
    isLoading: storedEnsData ? false : isLoadingName || isLoadingAvatar,
  };
}

function getDisplayName(
  accountType: Account["type"] = "personal",
  ensName?: string | null,
) {
  if (ensName) return ensName;
  if (accountType === "personal") return "Personal Account";
  return "Safe Account";
}
