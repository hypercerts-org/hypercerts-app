import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAccountStore } from "@/lib/account-store";
import { useEnsStore } from "@/lib/ens-store";
import { useSafeAccounts } from "@/hooks/useSafeAccounts";
import { Separator } from "@/components/ui/separator";

import AccountItem from "./account-item";

export default function AccountSelector({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const { getEnsData } = useEnsStore();
  const { selectedAccount, setSelectedAccount } = useAccountStore();
  const { safeAccounts, isLoading } = useSafeAccounts();

  useEffect(() => {
    setMounted(true);
  }, []);

  const personalAccount = address
    ? {
        type: "personal" as const,
        address: address as `0x${string}`,
        ensName: getEnsData(address)?.name,
      }
    : undefined;

  const renderContent = () => {
    if (!mounted || isLoading || !address) {
      return (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 py-4">
        {personalAccount && (
          <AccountItem
            type="personal"
            name={personalAccount.ensName || "Personal Account"}
            address={personalAccount.address}
            isSelected={
              selectedAccount?.address === personalAccount.address ||
              !selectedAccount
            }
            onClick={() => {
              setSelectedAccount(personalAccount);
              setIsOpen(false);
            }}
          />
        )}

        {safeAccounts.length > 0 && (
          <>
            <Separator className="my-2" />
            {safeAccounts.map((safe) => (
              <AccountItem
                key={safe.address}
                type="safe"
                name={getEnsData(safe.address)?.name || "Safe Account"}
                address={safe.address}
                isSelected={selectedAccount?.address === safe.address}
                onClick={() => {
                  setSelectedAccount({
                    type: "safe",
                    address: safe.address,
                  });
                  setIsOpen(false);
                }}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Account</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose between your personal wallet and Safe accounts
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
