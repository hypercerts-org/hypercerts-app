import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import SafeApiKit from "@safe-global/api-kit";

import { useEnsStore } from "@/lib/ens-store";
import { Account } from "@/lib/account-store";

export function useSafeAccounts() {
  const [safeAccounts, setSafeAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address, chainId } = useAccount();
  const { getEnsData } = useEnsStore();

  useEffect(() => {
    const loadSafeAccounts = async () => {
      if (!address || !chainId) return;

      setIsLoading(true);
      try {
        const safeService = new SafeApiKit({
          chainId: BigInt(chainId),
        });

        const { safes } = await safeService.getSafesByOwner(address);
        setSafeAccounts(
          safes.map((safe) => ({
            type: "safe",
            address: safe as `0x${string}`,
            ensName: getEnsData(safe)?.name || "Safe Account",
          })),
        );
      } catch (error) {
        console.error("Failed to load Safe accounts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSafeAccounts();
  }, [address, chainId, getEnsData]);

  return { safeAccounts, isLoading };
}
