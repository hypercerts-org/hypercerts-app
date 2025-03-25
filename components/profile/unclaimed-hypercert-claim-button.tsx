"use client";

import { AllowListRecord } from "@/allowlists/actions/getAllowListRecordsForAddressByClaimed";
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
// import { useQueryClient } from "@tanstack/react-query";
import { getAddress } from "viem";
// import { useOwnedHypercerts } from "@/hooks/useOwnedHypercerts";

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
  const router = useRouter();
  // const query = useOwnedHypercerts(getAddress(account.address!));

  const selectedHypercert = allowListRecord.original;
  const hypercertChainId = selectedHypercert?.hypercert_id?.split("-")[0];

  const refreshData = async (address: string) => {
    await revalidatePathServerAction([
      { path: `/profile/${address}?tab`, type: "page" },
      { path: `/profile/${address}?tab=hypercerts-claimable`, type: "page" },
      { path: `/profile/${address}?tab=hypercerts-owned`, type: "page" },
      { path: `/hypercerts/${selectedHypercert?.hypercert_id}`, type: "page" },
      { path: "/", type: "layout" },
    ]).then(async () => {
      setTimeout(() => {
        // refresh after 5 seconds
        router.refresh();

        // push to the profile page with the hypercerts-claimable tab
        // because revalidatePath will revalidate on the next page visit.
        router.push(`/profile/${address}?tab=hypercerts-claimable`);
      }, 5000);
    });
  };

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

    try {
      await setDialogStep("claiming", "active");
      const tx = await client.mintClaimFractionFromAllowlist(
        BigInt(selectedHypercert?.token_id),
        BigInt(selectedHypercert?.units),
        selectedHypercert?.proof as `0x${string}`[],
        undefined,
      );

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
        const extraContent = createExtraContent({
          receipt: receipt,
          hypercertId: selectedHypercert?.hypercert_id!,
          chain: account.chain!,
        });
        setExtraContent(extraContent);
        await setDialogStep("done", "completed");
        await refreshData(getAddress(account.address!));
      } else if (receipt.status == "reverted") {
        await setDialogStep("confirming", "error", "Transaction reverted");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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
