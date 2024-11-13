import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EnsData = {
  name?: string;
  avatar?: string;
};

interface EnsState {
  ensData: Record<string, EnsData>;
  setEnsData: (address: string, data: EnsData) => void;
  getEnsData: (address?: string) => EnsData | undefined;
  clearEnsData: () => void;
}

export const useEnsStore = create<EnsState>()(
  persist(
    (set, get) => ({
      ensData: {},
      setEnsData: (address, data) =>
        set((state) => ({
          ensData: {
            ...state.ensData,
            [address.toLowerCase()]: data,
          },
        })),
      getEnsData: (address) =>
        address ? get().ensData[address.toLowerCase()] : undefined,
      clearEnsData: () => set({ ensData: {} }),
    }),
    {
      name: "ens-storage",
    },
  ),
);
