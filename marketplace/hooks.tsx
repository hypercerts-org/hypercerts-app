import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addressesByNetwork,
  CreateMakerAskOutput,
  Currency,
  Maker,
  QuoteType,
  Taker,
  utils,
  WETHAbi,
} from "@hypercerts-org/marketplace-sdk";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { parseClaimOrFractionId } from "@hypercerts-org/sdk";
import { isAddress, parseUnits, zeroAddress } from "viem";
import { readContract, waitForTransactionReceipt } from "viem/actions";
import {
  CreateFractionalOfferFormValues,
  MarketplaceOrder,
} from "@/marketplace/types";
import { decodeContractError } from "@/lib/decodeContractError";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import { toast } from "@/components/ui/use-toast";
import { getFractionsByHypercert } from "@/hypercerts/getFractionsByHypercert";
import { getCurrencyByAddress } from "@/marketplace/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateBlockExplorerLink } from "@/lib/utils";
import { SUPPORTED_CHAINS } from "@/configs/constants";
import { useRouter } from "next/navigation";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { ExternalLink } from "lucide-react";
import React, { useEffect } from "react";
import { clearCacheAfterListing } from "@/app/actions/clearCacheAfterListing";
import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";
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
      // currency: string;
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
  const { address } = useAccount();
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

      if (!address) {
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
          signer: address,
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
              <Link href={`/profile/${address}?tab=marketplace-listings`}>
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

export const useGetCurrentERC20Allowance = () => {
  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const hypercertsExchangeAddress =
    addressesByNetwork[utils.asDeployedChain(chainId)].EXCHANGE_V2;

  const { data: walletClient } = useWalletClient();

  return async (currency: `0x${string}`, address?: `0x${string}`) => {
    const addressToUse = address ?? userAddress;
    if (!walletClient) {
      return BigInt(0);
    }

    const data = await readContract(walletClient, {
      abi: WETHAbi,
      address: currency as `0x${string}`,
      functionName: "allowance",
      args: [addressToUse, hypercertsExchangeAddress],
    });

    return data as bigint;
  };
};

export const useBuyFractionalMakerAsk = () => {
  const { client: hypercertExchangeClient } = useHypercertExchangeClient();
  const chainId = useChainId();
  const {
    setDialogStep: setStep,
    setSteps,
    setOpen,
    setExtraContent,
  } = useStepProcessDialogContext();
  const { data: walletClientData } = useWalletClient();
  const { address } = useAccount();
  const getCurrentERC20Allowance = useGetCurrentERC20Allowance();
  const router = useRouter();

  return useMutation({
    mutationKey: ["buyFractionalMakerAsk"],
    onError: (e) => {
      toast({
        title: "Error",
        description: e.message,
        duration: 5000,
      });
    },
    mutationFn: async ({
      order,
      unitAmount,
      pricePerUnit,
      hypercertName,
      totalUnitsInHypercert,
    }: {
      order: MarketplaceOrder;
      unitAmount: bigint;
      pricePerUnit: string;
      hypercertName?: string | null;
      totalUnitsInHypercert?: bigint;
    }) => {
      if (!hypercertExchangeClient) {
        setOpen(false);
        throw new Error("No client");
      }

      if (!walletClientData) {
        setOpen(false);
        throw new Error("No wallet client data");
      }

      if (!chainId) {
        setOpen(false);
        throw new Error("No chain id");
      }

      if (!walletClientData) {
        setOpen(false);
        throw new Error("No wallet client data");
      }

      setSteps([
        {
          id: "Setting up order execution",
          description: "Setting up order execution",
        },
        {
          id: "ERC20",
          description: "Setting approval",
        },
        {
          id: "Transfer manager",
          description: "Approving transfer manager",
        },
        {
          id: "Awaiting buy signature",
          description: "Awaiting buy signature",
        },
        {
          id: "Awaiting confirmation",
          description: "Awaiting confirmation",
        },
      ]);
      setOpen(true);

      let currency: Currency | undefined;
      let takerOrder: Taker;
      // const safeAddress = "0x379756bB61A632Cd3C5C5Ce4F3768f4815feaCda";
      const safeAddress = "0x462978318992f14cC43ECba405C78FC677AEaD45";
      try {
        await setStep("Setting up order execution");
        currency = getCurrencyByAddress(order.chainId, order.currency);

        if (!currency) {
          throw new Error(
            `Invalid currency ${order.currency} on chain ${order.chainId}`,
          );
        }

        takerOrder = hypercertExchangeClient.createFractionalSaleTakerBid(
          order,
          safeAddress,
          unitAmount.toString(),
          pricePerUnit,
        );
      } catch (e) {
        await setStep(
          "Setting up order execution",
          "error",
          e instanceof Error ? e.message : "Error setting up order execution",
        );
        console.error(e);
        throw new Error("Error setting up order execution");
      }

      if (!currency) {
        throw new Error(
          `Invalid currency ${order.currency} on chain ${order.chainId}`,
        );
      }

      const totalPrice = BigInt(order.price) * unitAmount;
      try {
        await setStep("ERC20");
        if (currency.address !== zeroAddress) {
          const currentAllowance = await getCurrentERC20Allowance(
            order.currency as `0x${string}`,
            safeAddress,
          );

          if (currentAllowance < totalPrice) {
            const approveTx = await hypercertExchangeClient.approveErc20Safe(
              safeAddress,
              order.currency,
              totalPrice,
            );
          }
        }
      } catch (e) {
        await setStep(
          "ERC20",
          "error",
          e instanceof Error ? e.message : "Approval error",
        );
        console.error(e);
        throw new Error("Approval error");
      }

      try {
        await setStep("Transfer manager");
        const isTransferManagerApproved =
          await hypercertExchangeClient.isTransferManagerApproved(
            undefined,
            safeAddress,
          );
        if (!isTransferManagerApproved) {
          const transferManagerApprove =
            await hypercertExchangeClient.grantTransferManagerApprovalSafe(
              safeAddress,
            );
        }
      } catch (e) {
        await setStep(
          "Transfer manager",
          "error",
          e instanceof Error ? e.message : "Error approving transfer manager",
        );
        console.error(e);
        throw new Error("Approval error");
      }

      try {
        await setStep("Setting up order execution");
        const overrides =
          currency.address === zeroAddress ? { value: totalPrice } : undefined;
        const tx = await hypercertExchangeClient.executeOrderSafe(
          safeAddress,
          order,
          takerOrder,
          order.signature,
          overrides,
        );
        await setStep("Awaiting buy signature");
        await setStep("Awaiting confirmation");
        const chain = SUPPORTED_CHAINS.find((x) => x.id === order.chainId);
        await setStep("Awaiting confirmation", "completed");
        const message =
          hypercertName && totalUnitsInHypercert !== undefined ? (
            <span>
              Congratulations, you successfully bought{" "}
              <b>
                {calculateBigIntPercentage(unitAmount, totalUnitsInHypercert)}%
              </b>{" "}
              of <b>{hypercertName}</b>.
            </span>
          ) : (
            "Your transaction was successful"
          );

        setExtraContent(() => (
          <div className="flex flex-col space-y-2">
            <p className="text-lg font-medium">Success</p>
            <p className="text-sm font-medium">{message}</p>
            <div className="flex space-x-4 py-4 justify-center">
              <Button
                onClick={() => {
                  router.push(`/hypercerts/${order.hypercert_id}`);
                  window.location.reload();
                  setOpen(false);
                }}
              >
                View hypercert
              </Button>
              <Button asChild>
                <Link
                  href={generateBlockExplorerLink(chain, tx)}
                  target="_blank"
                >
                  View transaction <ExternalLink size={14} className="ml-2" />
                </Link>
              </Button>
            </div>
            <p className="text-sm font-medium">
              New ownership will not be immediately visible on the Hypercerts
              page, but will be visible in 5-10 minutes.
            </p>
          </div>
        ));
      } catch (e) {
        const decodedMessage = decodeContractError(e, "Error buying listing");
        await setStep("Awaiting confirmation", "error", decodedMessage);

        console.error(e);
        throw new Error(decodedMessage);
      }
    },
  });
};

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
