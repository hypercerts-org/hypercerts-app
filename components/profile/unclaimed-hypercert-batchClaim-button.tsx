"use client";

import { AllowListRecord } from "@/allowlists/actions/getAllowListRecordsForAddressByClaimed";
import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { useOwnedHypercerts } from "@/hooks/useOwnedHypercerts";
import { ChainFactory } from "@/lib/chainFactory";
import { errorToast } from "@/lib/errorToast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ByteArray, getAddress, Hex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { createExtraContent } from "../global/extra-content";
import { useStepProcessDialogContext } from "../global/step-process-dialog";
import { Button } from "../ui/button";

interface TransformedClaimData {
  hypercertTokenIds: bigint[];
  units: bigint[];
  proofs: (Hex | ByteArray)[][];
  roots?: (Hex | ByteArray)[];
}

function transformAllowListRecords(
  records: AllowListRecord[],
): TransformedClaimData {
  return {
    hypercertTokenIds: records.map((record) => BigInt(record.token_id!)),
    units: records.map((record) => BigInt(record.units!)),
    proofs: records.map((record) => record.proof as (Hex | ByteArray)[]),
    roots: records.map((record) => record.root as Hex | ByteArray),
  };
}

export default function UnclaimedHypercertBatchClaimButton({
  allowListRecords,
  selectedChainId,
}: {
  allowListRecords: AllowListRecord[];
  selectedChainId: number | null;
}) {
  const router = useRouter();
  const { client } = useHypercertClient();
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { setDialogStep, setSteps, setOpen, setTitle, setExtraContent } =
    useStepProcessDialogContext();
  const { switchChain } = useSwitchChain();
  const selectedChain = selectedChainId
    ? ChainFactory.getChain(selectedChainId)
    : null;
  const query = useOwnedHypercerts(getAddress(account.address!));

  const refreshData = async (address: string) => {
    const hypercertIds = allowListRecords.map((record) => record.hypercert_id);

    const hypercertViewInvalidationPaths = hypercertIds.map((id) => {
      return `/hypercerts/${id}`;
    });

    await revalidatePathServerAction([
      `/profile/${address}?tab=hypercerts-claimable`,
      `/profile/${address}?tab=hypercerts-owned`,
      ...hypercertViewInvalidationPaths,
    ]);
    await query.refetch();
    router.refresh();
  };

  const claimHypercert = async () => {
    setIsLoading(true);
    setOpen(true);
    setSteps([
      { id: "preparing", description: "Preparing to claim fractions..." },
      { id: "claiming", description: "Claiming fractions on-chain..." },
      { id: "confirming", description: "Waiting for on-chain confirmation" },
      { id: "done", description: "Claiming complete!" },
    ]);
    setTitle("Claim fractions from Allowlist");
    if (!client) {
      throw new Error("No client found");
    }
    if (!walletClient) {
      throw new Error("No wallet client found");
    }
    if (!account) {
      throw new Error("No address found");
    }

    const claimData = transformAllowListRecords(allowListRecords);
    await setDialogStep("preparing, active");
    try {
      await setDialogStep("claiming", "active");
      const tx = await client.batchClaimFractionsFromAllowlists(claimData);

      if (!tx) {
        await setDialogStep("claiming", "error");
        throw new Error("Failed to claim fractions");
      }

      await setDialogStep("confirming", "active");
      const receipt = await waitForTransactionReceipt(walletClient, {
        hash: tx,
      });

      if (receipt.status == "success") {
        await setDialogStep("done", "completed");
        const extraContent = createExtraContent({
          receipt,
          chain: account?.chain!,
        });
        setExtraContent(extraContent);
        refreshData(getAddress(account.address!));
      } else if (receipt.status == "reverted") {
        await setDialogStep("confirming", "error", "Transaction reverted");
      }
    } catch (error) {
      console.error("Claim error:", error);
      await setDialogStep("claiming", "error", "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isBatchClaimDisabled =
    isLoading ||
    !allowListRecords.length ||
    !account ||
    !client ||
    account.address !== getAddress(allowListRecords[0].user_address as string);

  return (
    <>
      {account.chainId === selectedChainId ? (
        <Button
          variant={"default"}
          size={"sm"}
          onClick={claimHypercert}
          disabled={isBatchClaimDisabled}
        >
          Claim Selected
        </Button>
      ) : (
        <Button
          variant={"outline"}
          size="sm"
          disabled={!account.isConnected || !selectedChainId}
          onClick={() => {
            if (!selectedChainId) return errorToast("Fraction is not selected");
            switchChain({ chainId: selectedChainId });
          }}
        >
          {selectedChainId
            ? `Switch to ${selectedChain?.name}`
            : "Select fraction"}
        </Button>
      )}
    </>
  );
}
