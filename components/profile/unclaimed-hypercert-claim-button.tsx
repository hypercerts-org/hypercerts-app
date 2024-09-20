"use client";

import { AllowListRecord } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import { Button } from "../ui/button";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { waitForTransactionReceipt } from "viem/actions";
import { useAccount, useWalletClient } from "wagmi";
import { useRouter } from "next/navigation";

export default function UnclaimedHypercertClaimButton({
  allowListRecord,
}: {
  allowListRecord: AllowListRecord;
}) {
  const { client } = useHypercertClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { refresh } = useRouter();

  const claimHypercert = async () => {
    if (!client) {
      throw new Error("No client found");
    }

    if (!walletClient) {
      throw new Error("No wallet client found");
    }

    if (!address) {
      throw new Error("No address found");
    }

    if (
      !allowListRecord.units ||
      !allowListRecord.proof ||
      !allowListRecord.token_id
    ) {
      throw new Error("Invalid allow list record");
    }

    // DUMMY VALUES
    const root: `0x${string}` =
      "0x0000000000000000000000000000000000000000000000000000000000000000";

    console.log(allowListRecord);

    const tx = await client.mintClaimFractionFromAllowlist(
      BigInt(allowListRecord.token_id),
      BigInt(allowListRecord.units),
      allowListRecord.proof as `0x${string}`[],
      undefined,
    );
    console.log(tx);
    if (!tx) {
      throw new Error("Failed to claim hypercert");
    }

    await waitForTransactionReceipt(walletClient, {
      hash: tx,
    });

    setTimeout(() => {
      refresh();
    }, 5000);
  };
  return <Button onClick={claimHypercert}>Claim</Button>;
}
