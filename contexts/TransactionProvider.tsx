"use client";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { toast } from "sonner";
import { useAccount, useConfig } from "wagmi";

type TransactionStatus = "pending" | "processing" | "success" | "failed" | null;

interface TransactionContextType {
  sendTransaction: (transactionFunction: () => Promise<any>) => Promise<void>;
  txnStatus: TransactionStatus;
  isProcessing: boolean;
  error: string | null;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

export const useTransaction = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({
  children,
}) => {
  const [txnStatus, setTxnStatus] = useState<TransactionStatus>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, chain } = useAccount();
  const { chains } = useConfig();

  const checkNetwork = (): boolean => {
    if (!isConnected) {
      setError("Please connect your wallet");
      return false;
    }
    if (!chains.some((c) => c.id === chain?.id)) {
      setError("Please switch to a supported network");
      return false;
    }
    return true;
  };

  const sendTransaction = async (
    transactionFunction: () => Promise<any>,
  ): Promise<void> => {
    if (!checkNetwork) return;

    setIsProcessing(true);
    setTxnStatus("pending");
    setError(null);

    try {
      const txn = await transactionFunction();
      setTxnStatus("processing");
      await txn.wait();
      setTxnStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setTxnStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const emitToastError = (error: string) =>
    toast.error("Transaction error", { description: error });

  const contextValue: TransactionContextType = {
    sendTransaction,
    txnStatus,
    isProcessing,
    error,
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
      {error && emitToastError(error)}
      <Drawer open={isProcessing} onClose={() => {}}>
        <DrawerContent className="p-4">
          <h2 className="text-lg font-semibold">
            Transaction Status: {txnStatus}
          </h2>
          {txnStatus === "pending" && <p>Waiting for confirmation...</p>}
          {txnStatus === "processing" && <p>Processing transaction...</p>}
          {txnStatus === "success" && <p>Transaction successful!</p>}
        </DrawerContent>
      </Drawer>
    </TransactionContext.Provider>
  );
};
