import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addressesByNetwork,
  Maker,
  QuoteType,
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

export const useCreateOrderInSupabase = () => {
  const chainId = useChainId();
  const { client: hypercertExchangeClient } = useHypercertExchangeClient();

  return useMutation({
    mutationKey: ["createOrderInSupabase"],
    mutationFn: async ({
      order,
      signature,
    }: {
      order: Maker;
      signer: string;
      signature: string;
      quoteType: QuoteType;
      // currency: string;
    }) => {
      if (!chainId) {
        throw new Error("No chainId");
      }

      if (!hypercertExchangeClient) {
        throw new Error("No client");
      }

      return hypercertExchangeClient.registerOrder({
        order,
        signature,
      });
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
          description: "Creating order in contract",
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

      await setStep("Create");

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

      const { maker, isCollectionApproved, isTransferManagerApproved } =
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

      // Grant the TransferManager the right the transfer assets on behalf od the LooksRareProtocol
      await setStep("Approve transfer manager");
      if (!isTransferManagerApproved) {
        const tx = await hypercertExchangeClient
          .grantTransferManagerApproval()
          .call();
        await waitForTransactionReceipt(walletClientData, {
          hash: tx.hash as `0x${string}`,
        });
      }

      await setStep("Approve collection");
      // Approve the collection items to be transferred by the TransferManager
      if (!isCollectionApproved) {
        const tx = await hypercertExchangeClient.approveAllCollectionItems(
          maker.collection,
        );
        await waitForTransactionReceipt(walletClientData, {
          hash: tx.hash as `0x${string}`,
        });
      }

      // Sign your maker order
      await setStep("Sign order");
      signature = await hypercertExchangeClient.signMakerOrder(maker);

      if (!signature) {
        throw new Error("Error signing order");
      }

      await setStep("Create order");
      try {
        await createOrder({
          order: maker,
          signature: signature,
          signer: address,
          quoteType: QuoteType.Ask,
        });
      } catch (e) {
        console.error(e);
        throw new Error("Error registering order");
      }
      window.location.reload();
    },
    onSuccess: () => {
      setOpen(false);
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
  } = useStepProcessDialogContext();
  const { data: walletClientData } = useWalletClient();
  const { address } = useAccount();
  const getCurrentERC20Allowance = useGetCurrentERC20Allowance();

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
    }: {
      order: MarketplaceOrder;
      unitAmount: string;
      pricePerUnit: string;
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

      await setStep("Setting up order execution");
      const currency = getCurrencyByAddress(order.chainId, order.currency);

      if (!currency) {
        throw new Error(
          `Invalid currency ${order.currency} on chain ${order.chainId}`,
        );
      }

      const takerOrder = hypercertExchangeClient.createFractionalSaleTakerBid(
        order,
        address,
        unitAmount,
        pricePerUnit,
      );

      const totalPrice = BigInt(order.price) * BigInt(unitAmount);
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
        console.error(e);
        setOpen(false);
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
      } catch (e) {
        console.error(e);

        throw new Error(decodeContractError(e, "Error buying listing"));
      } finally {
        setOpen(false);
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
