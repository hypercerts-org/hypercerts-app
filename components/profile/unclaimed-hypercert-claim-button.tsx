"use client";

import { AllowListRecord } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import { Button } from "../ui/button";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { waitForTransactionReceipt } from "viem/actions";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import { useStepProcessDialogContext } from "../global/step-process-dialog";
import { createExtraContent } from "../global/extra-content";
import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";
import { useState } from "react";

interface UnclaimedHypercertClaimButtonProps {
  allowListRecord: Row<AllowListRecord>;
}

export default function UnclaimedHypercertClaimButton({
  allowListRecord,
}: UnclaimedHypercertClaimButtonProps) {
  const { client } = useHypercertClient();
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const { refresh } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setDialogStep, setSteps, setOpen, setTitle, setExtraContent } =
    useStepProcessDialogContext();
  const { switchChain } = useSwitchChain();
  const selectedHypercert = allowListRecord.original;
  const hypercertChainId = selectedHypercert?.hypercert_id?.split("-")[0];

  const claimHypercert = async () => {
    setIsLoading(true);
    setOpen(true);
    setSteps([
      { id: "preparing", description: "Preparing to claim fraction..." },
      { id: "claiming", description: "Claiming fraction on-chain..." },
      { id: "confirming", description: "Waiting for on-chain confirmation" },
      { id: "route", description: "Creating your new fraction's link..." },
      { id: "done", description: "Claiming complete!" },
    ]);

    setTitle("Claim fraction from Allowlist");
    if (!client) {
      throw new Error("No client found");
    }

    if (!walletClient) {
      throw new Error("No wallet client found");
    }

    if (!account) {
      throw new Error("No address found");
    }

    if (
      !selectedHypercert?.units ||
      !selectedHypercert?.proof ||
      !selectedHypercert?.token_id
    ) {
      throw new Error("Invalid allow list record");
    }
    await setDialogStep("preparing, active");

    console.log(allowListRecord);

    try {
      await setDialogStep("claiming", "active");
      const tx = await client.mintClaimFractionFromAllowlist(
        BigInt(selectedHypercert?.token_id),
        BigInt(selectedHypercert?.units),
        selectedHypercert?.proof as `0x${string}`[],
        undefined,
      );
      console.log(tx);

      if (!tx) {
        await setDialogStep("claiming", "error");
        throw new Error("Failed to claim fraction");
      }

      await setDialogStep("confirming", "active");
      const receipt = await waitForTransactionReceipt(walletClient, {
        hash: tx,
      });

      if (receipt.status == "success") {
        await setDialogStep("route", "active");
        const extraContent = createExtraContent(
          receipt,
          selectedHypercert?.hypercert_id!,
          account.chain,
        );
        setExtraContent(extraContent);
        await setDialogStep("done", "completed");
        await revalidatePathServerAction([
          `/hypercerts/${selectedHypercert?.hypercert_id}`,
          `/profile/${account.address}?tab=hypercerts-claimable`,
          `/profile/${account.address}?tab=hypercerts-owned`,
        ]);
      } else if (receipt.status == "reverted") {
        await setDialogStep("confirming", "error", "Transaction reverted");
      }
      console.log({ receipt });
      setTimeout(() => {
        refresh();
      }, 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <Button
      variant={
        hypercertChainId === account.chainId?.toString() ? "default" : "outline"
      }
      size={"sm"}
      onClick={() => {
        if (hypercertChainId === account.chainId?.toString()) {
          claimHypercert();
        } else {
          switchChain({
            chainId: Number(hypercertChainId),
          });
        }
      }}
      disabled={
        selectedHypercert?.user_address !== account.address || isLoading
      }
    >
      {hypercertChainId === account.chainId?.toString()
        ? "Claim"
        : `Switch chain`}
    </Button>
  );
}
