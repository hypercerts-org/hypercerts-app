import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import { useAccountStore } from "@/lib/account-store";
import {
  BuyFractionalMakerAskParams,
  CreateFractionalOfferFormValues,
} from "@/marketplace/types";
import { getCurrencyByAddress } from "@/marketplace/utils";
import {
  CreateMakerAskOutput,
  Maker,
  QuoteType,
} from "@hypercerts-org/marketplace-sdk";
import { parseClaimOrFractionId } from "@hypercerts-org/sdk";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAddress, parseUnits } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useBuyFractionalStrategy } from "./useBuyFractionalStrategy";
export const useCreateOrderInSupabase = () => {
  const chainId = useChainId();
  const { client: hypercertExchangeClient } = useHypercertExchangeClient();

  return useMutation({
    mutationKey: ["createOrderInSupabase"],
    mutationFn: async ({
      order,
      hypercertId,
      signature,
    }: {
      order: Maker;
      signer: string;
      signature: string;
      quoteType: QuoteType;
      hypercertId: string;
    }) => {
      if (!chainId) {
        throw new Error("No chainId");
      }

      if (!hypercertExchangeClient) {
        throw new Error("No client");
      }

      const result = await hypercertExchangeClient.registerOrder({
        order,
        signature,
      });
      await revalidatePathServerAction([
        `/hypercerts/${hypercertId}`,
        `/profile/${order.signer}`,
      ]);
      return result;
    },
    throwOnError: true,
  });
};

export const useCreateFractionalMakerAsk = ({
  hypercertId,
}: {
  hypercertId: string;
}) => {
  const { client: hypercertExchangeClient } = useHypercertExchangeClient();

  const { mutateAsync: createOrder } = useCreateOrderInSupabase();

  const chainId = useChainId();
  const client = useHypercertClient();
  const { address: connectedAddress } = useAccount();
  const { selectedAccount } = useAccountStore();
  const activeAddress = selectedAccount?.address || connectedAddress;
  const { data: walletClientData } = useWalletClient();

  const {
    setSteps,
    setDialogStep: setStep,
    setOpen,
    setTitle,
    setExtraContent,
  } = useStepProcessDialogContext();

  useEffect(() => {
    setTitle("Create marketplace listing");
  }, []);

  return useMutation({
    mutationKey: ["createFractionalMakerAsk"],
    mutationFn: async (values: CreateFractionalOfferFormValues) => {
      if (!client) {
        throw new Error("Client not initialized");
      }

      if (!chainId) {
        throw new Error("Chain ID not initialized");
      }

      if (!activeAddress) {
        throw new Error("Address not initialized");
      }

      if (!hypercertExchangeClient) {
        throw new Error("Hypercert exchange client not initialized");
      }

      if (!values.currency) {
        throw new Error("Currency not selected");
      }

      const { contractAddress, id: fractionTokenId } = parseClaimOrFractionId(
        values.fractionId,
      );

      if (!contractAddress || !isAddress(contractAddress)) {
        throw new Error("Invalid contract address");
      }

      if (!walletClientData) {
        throw new Error("Wallet client not initialized");
      }
      setSteps([
        {
          id: "Create",
          description: "Creating order",
        },
        {
          id: "Approve transfer manager",
          description: "Approving transfer manager",
        },
        {
          id: "Approve collection",
          description: "Approving collection",
        },
        {
          id: "Sign order",
          description: "Signing order",
        },
        {
          id: "Register",
          description: "Registering order",
        },
      ]);
      setOpen(true);

      let signature: string | undefined;

      await setStep("Create", "active");

      let createMakerAskOutput: CreateMakerAskOutput;
      try {
        const { chainId: chainIdFromHypercertId } =
          parseClaimOrFractionId(hypercertId);
        const currency = getCurrencyByAddress(
          chainIdFromHypercertId,
          values.currency,
        );

        if (!currency) {
          throw new Error("Invalid currency");
        }

        const pricePerUnit =
          parseUnits(values.price, currency.decimals) /
          BigInt(values.unitsForSale);

        if (pricePerUnit === BigInt(0)) {
          throw new Error("Price per unit is 0");
        }

        createMakerAskOutput =
          await hypercertExchangeClient.createFractionalSaleMakerAsk({
            startTime: values.startDateTime, // Use it to create an order that will be valid in the future (Optional, Default to now)
            endTime: values.endDateTime, // If you use a timestamp in ms, the function will revert
            price: pricePerUnit.toString(), // Be careful to use a price in wei, this example is for 1 ETH
            itemIds: [fractionTokenId.toString()], // Token id of the NFT(s) you want to sell, add several ids to create a bundle
            minUnitAmount: BigInt(values.minUnitAmount), // Minimum amount of units to keep after the sale
            maxUnitAmount: BigInt(values.maxUnitAmount), // Maximum amount of units to sell
            minUnitsToKeep: BigInt(values.minUnitsToKeep), // Minimum amount of units to keep after the sale
            sellLeftoverFraction: values.sellLeftoverFraction, // If you want to sell the leftover fraction
            currency: values.currency, // Currency address (0x0 for ETH)
          });
        if (!createMakerAskOutput) {
          throw new Error("Error creating order");
        }
      } catch (e) {
        console.error(e);
        await setStep(
          "Create",
          "error",
          e instanceof Error ? e.message : "Error creating order",
        );
      }
      const { maker, isTransferManagerApproved, isCollectionApproved } =
        createMakerAskOutput!;

      // Grant the TransferManager the right the transfer assets on behalf od the LooksRareProtocol
      try {
        await setStep("Approve transfer manager");
        if (!isTransferManagerApproved) {
          const tx = await hypercertExchangeClient
            .grantTransferManagerApproval()
            .call();
          await waitForTransactionReceipt(walletClientData, {
            hash: tx.hash as `0x${string}`,
          });
        }
      } catch (e) {
        await setStep(
          "Approve transfer manager",
          "error",
          e instanceof Error ? e.message : "Error approving transfer manager",
        );
        throw new Error("Error approving transfer manager");
      }

      await setStep("Approve collection");
      // Approve the collection items to be transferred by the TransferManager
      try {
        if (!isCollectionApproved) {
          const tx = await hypercertExchangeClient.approveAllCollectionItems(
            maker.collection,
          );
          await waitForTransactionReceipt(walletClientData, {
            hash: tx.hash as `0x${string}`,
          });
        }
      } catch (e) {
        await setStep(
          "Approve collection",
          "error",
          e instanceof Error ? e.message : "Error approving collection",
        );
        throw new Error("Error approving collection");
      }

      // Sign your maker order
      try {
        await setStep("Sign order");
        signature = await hypercertExchangeClient.signMakerOrder(maker);

        if (!signature) {
          throw new Error("Error signing order");
        }
      } catch (e) {
        await setStep(
          "Sign order",
          "error",
          e instanceof Error ? e.message : "Error signing order",
        );
        throw new Error("Error signing order");
      }

      await setStep("Register");
      try {
        await createOrder({
          order: maker,
          signature: signature,
          signer: activeAddress,
          quoteType: QuoteType.Ask,
          hypercertId,
        });
      } catch (e) {
        console.error(e);
        await setStep(
          "Register",
          "error",
          e instanceof Error ? e.message : "Error registering order",
        );
        throw new Error("Error registering order");
      }
      setExtraContent(() => (
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium">Order created successfully</p>
          <div className="flex space-x-4">
            <Button asChild>
              <Link href={`/profile/${activeAddress}?tab=marketplace-listings`}>
                View my listings
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                window.location.reload();
              }}
            >
              Close
            </Button>
          </div>
        </div>
      ));
      await setStep("Register", "completed");
    },
    onError: (e) => {
      console.error(e);
    },
  });
};

export const useBuyFractionalMakerAsk = () => {
  const strategy = useBuyFractionalStrategy();

  return useMutation({
    mutationKey: ["buyFractionalMakerAsk"],
    onError: (e) => {
      toast({
        title: "Error",
        description: e.message,
        duration: 5000,
      });
    },
    mutationFn: async (ask: BuyFractionalMakerAskParams) => {
      await strategy().execute(ask);
    },
  });
};

// TODO: Move this and all the other types in here to types.ts
export interface CancelOrderParams {
  nonce: bigint;
  tokenId: string;
  chainId: number;
  hypercertId: string;
  ownerAddress: string;
}

export const useCancelOrder = () => {
  const { client: hec } = useHypercertExchangeClient();
  const router = useRouter();

  return useMutation<boolean, Error, CancelOrderParams>({
    mutationKey: ["cancelOrder"],
    mutationFn: async ({
      nonce,
      tokenId,
      chainId,
      hypercertId,
      ownerAddress,
    }: CancelOrderParams) => {
      if (!hec) {
        throw new Error("Hypercert exchange client not initialized");
      }

      const tx = await hec.cancelOrders([BigInt(nonce)]).call();
      await tx.wait();

      // Update order validity in the API
      await hec.api.updateOrderValidity([BigInt(tokenId)], chainId);

      // Revalidate paths to update the server-side cache
      await revalidatePathServerAction([
        `/hypercerts/${hypercertId}`,
        `/profile/${ownerAddress}`,
      ]);

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Listing cancelled successfully",
        duration: 5000,
      });
      router.refresh(); // Refresh the current page to reflect changes
    },
    onError: (error) => {
      console.error("Error cancelling order:", error);
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while cancelling the listing",
        duration: 5000,
      });
    },
  });
};

export interface DeleteOrderParams {
  orderId: string;
  hypercertId: string;
  ownerAddress: string;
}

export const useDeleteOrder = () => {
  const { client: hec } = useHypercertExchangeClient();
  const router = useRouter();

  return useMutation<boolean, Error, DeleteOrderParams>({
    mutationKey: ["deleteOrder"],
    mutationFn: async ({ orderId, hypercertId, ownerAddress }) => {
      if (!hec) {
        throw new Error("Hypercert exchange client not initialized");
      }

      const success = await hec.deleteOrder(orderId);
      if (!success) {
        throw new Error(`Failed to delete listing with ID: ${orderId}`);
      }

      // Revalidate paths to update the server-side cache
      await revalidatePathServerAction([
        `/hypercerts/${hypercertId}`,
        `/profile/${ownerAddress}`,
      ]);

      return success;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Listing deleted successfully",
        duration: 5000,
      });
      router.refresh(); // Refresh the current page to reflect changes
    },
    onError: (error) => {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while deleting the listing",
        duration: 5000,
      });
    },
  });
};
