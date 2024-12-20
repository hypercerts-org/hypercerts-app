import { create } from "zustand";

export type AccountType = "personal" | "safe";

export type Account = {
  type: AccountType;
  address: `0x${string}`;
};

interface AccountState {
  selectedAccount: Account | null;
  setSelectedAccount: (account: Account | null) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  selectedAccount: null,
  setSelectedAccount: (account) => set({ selectedAccount: account }),
}));

export function selectWalletAccount(address: string) {
  useAccountStore.setState({
    selectedAccount: {
      type: "personal",
      address: address as `0x${string}`,
    },
  });
}
