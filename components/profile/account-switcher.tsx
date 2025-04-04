"use client";

import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAccountStore } from "@/lib/account-store";
import { useSafeAccounts } from "@/hooks/useSafeAccounts";

export function ProfileAccountSwitcher({ address }: { address: string }) {
  const { address: connectedAddress } = useAccount();
  const { safeAccounts } = useSafeAccounts();
  const router = useRouter();
  const selectedAccount = useAccountStore((state) => state.selectedAccount);

  useEffect(() => {
    if (!selectedAccount || !connectedAddress) return;

    const currentAddress = address.toLowerCase();
    const accounts = [
      { type: "eoa", address: connectedAddress },
      ...safeAccounts,
    ];

    // Find current account index
    const currentIndex = accounts.findIndex(
      (account) => account.address.toLowerCase() === currentAddress,
    );

    // If current address matches the connected address or a safe address the user is a signer on,
    // and it's not the selected account, redirect to the selected account
    if (
      currentIndex !== -1 &&
      currentAddress !== selectedAccount.address.toLowerCase()
    ) {
      router.push(`/profile/${selectedAccount.address}`);
    }
  }, [selectedAccount, address, connectedAddress, safeAccounts, router]);

  return null;
}
