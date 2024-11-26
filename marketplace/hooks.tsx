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
import React from "react";
import revalidatePathServerAction from "@/app/actions";

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

export const useFetchHypercertFractionsByHypercertId = (
  hypercertId: string,
) => {
  const { client } = useHypercertClient();
  const chainId = useChainId();

  return useQuery({
    queryKey: ["hypercert", "id", hypercertId, "chain", chainId, "fractions"],
    queryFn: async () => {
      if (!client) {
        console.log("no client");
        return null;
      }

      if (!chainId) {
        console.log("no chainId");
        return null;
      }

      const fractions =
        (await getFractionsByHypercert(hypercertId).then((res) => {
          return res?.data;
        })) || [];
      const totalUnitsForAllFractions = fractions?.reduce(
        (acc, cur) => acc + BigInt(cur?.units ?? "0"),
        BigInt(0),
      );

      return fractions.map((fraction) => ({
        ...fraction,
        percentage: Number(
          (BigInt(fraction?.units ?? "0") * BigInt(100)) /
            totalUnitsForAllFractions,
        ),
      }));
    },
    enabled: !!client && !!chainId,
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
  const { data: currentFractions } =
    useFetchHypercertFractionsByHypercertId(hypercertId);

  const {
    setSteps,
    setDialogStep: setStep,
    setOpen,
    setTitle,
    setExtraContent,
  } = useStepProcessDialogContext();

  setTitle("Create marketplace listing");

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

      if (!currentFractions) {
        throw new Error("Fractions not found");
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
          id: "Create order",
          description: "Creating order",
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

      await setStep("Create order");
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
          "Create order",
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
      await setStep("Create order", "completed");
    },
    onError: (e) => {
      console.error(e);
    },
  });
};

export const useGetCurrentERC20Allowance = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const hypercertsExchangeAddress =
    addressesByNetwork[utils.asDeployedChain(chainId)].EXCHANGE_V2;

  const { data: walletClient } = useWalletClient();

  return async (currency: `0x${string}`) => {
    if (!walletClient) {
      return BigInt(0);
    }

    const data = await readContract(walletClient, {
      abi: WETHAbi,
      address: currency as `0x${string}`,
      functionName: "allowance",
      args: [address, hypercertsExchangeAddress],
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
      console.error(e);
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
          address,
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
          );

          if (currentAllowance < totalPrice) {
            const approveTx = await hypercertExchangeClient.approveErc20(
              order.currency,
              totalPrice,
            );
            await waitForTransactionReceipt(walletClientData, {
              hash: approveTx.hash as `0x${string}`,
            });
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
          await hypercertExchangeClient.isTransferManagerApproved();
        if (!isTransferManagerApproved) {
          const transferManagerApprove = await hypercertExchangeClient
            .grantTransferManagerApproval()
            .call();
          await waitForTransactionReceipt(walletClientData, {
            hash: transferManagerApprove.hash as `0x${string}`,
          });
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
        const { call } = hypercertExchangeClient.executeOrder(
          order,
          takerOrder,
          order.signature,
          undefined,
          overrides,
        );
        await setStep("Awaiting buy signature");
        const tx = await call();
        await setStep("Awaiting confirmation");
        await waitForTransactionReceipt(walletClientData, {
          hash: tx.hash as `0x${string}`,
        });
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
                  href={generateBlockExplorerLink(chain, tx.hash)}
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

export const useCancelOrder = () => {
  const { client: hec } = useHypercertExchangeClient();

  return useMutation({
    mutationKey: ["cancelOrder"],
    mutationFn: async ({
      nonce,
      tokenId,
      chainId,
    }: {
      nonce: bigint;
      tokenId: string;
      chainId: number;
    }) => {
      if (!hec) {
        throw new Error("No client");
      }

      const tx = await hec.cancelOrders([BigInt(nonce)]).call();
      await tx.wait();

      await hec.api.updateOrderValidity([BigInt(tokenId)], chainId);
      document.location.reload();
    },
    onError: (e) => {
      console.error(e);
      toast({
        title: "Error",
        description: e.message,
        duration: 5000,
      });
    },
  });
};

export const useDeleteOrder = () => {
  const { client: hec } = useHypercertExchangeClient();

  return useMutation({
    mutationKey: ["deleteOrder"],
    mutationFn: async ({ orderId }: { orderId: string }) => {
      if (!hec) {
        throw new Error("No client");
      }

      const success = await hec.deleteOrder(orderId);
      if (success) {
        document.location.reload();
      } else {
        throw new Error(`Could not delete listing ${orderId}`);
      }
    },
    onError: (e) => {
      console.error(e);
      toast({
        title: "Error",
        description: e.message,
        duration: 5000,
      });
    },
  });
};
