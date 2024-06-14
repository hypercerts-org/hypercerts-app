import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { useEthersProvider } from "@/hooks/use-ethers-provider";
import { useEthersSigner } from "@/hooks/use-ethers-signer";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ApiClient,
  HypercertExchangeClient,
  Maker,
  QuoteType,
} from "@hypercerts-org/marketplace-sdk";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { useStepProcessDialogContext } from "@/components/global/step-process-dialog";
import { parseClaimOrFractionId } from "@hypercerts-org/sdk";
import { isAddress, parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import {
  CreateFractionalOfferFormValues,
  useFetchHypercertFractionsByHypercertId,
} from "@/components/marketplace/create-fractional-sale-form";

export const useCreateOrderInSupabase = () => {
  const chainId = useChainId();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

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

      if (!provider) {
        throw new Error("No provider");
      }

      if (!signer) {
        throw new Error("No signer");
      }

      const hypercertExchangeClient = new HypercertExchangeClient(
        chainId,
        // TODO: Fix typing issue with provider
        // @ts-ignore
        provider as unknown as Provider,
        // @ts-ignore
        signer,
      );

      return hypercertExchangeClient.registerOrder({
        order,
        signature,
      });
    },
    throwOnError: true,
  });
};
export const useCreateFractionalMakerAsk = ({
  hypercertId,
}: {
  hypercertId: string;
}) => {
  const { mutateAsync: createOrder } = useCreateOrderInSupabase();

  const chainId = useChainId();
  const client = useHypercertClient();
  const { address } = useAccount();
  const { data: walletClientData } = useWalletClient();
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { data: currentFractions } =
    useFetchHypercertFractionsByHypercertId(hypercertId);

  const { setSteps, setStep, setOpen } = useStepProcessDialogContext();

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

      if (!provider) {
        throw new Error("Provider not initialized");
      }

      if (!signer) {
        throw new Error("Signer not initialized");
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

      setStep("Create");
      const hypercertExchangeClient = new HypercertExchangeClient(
        chainId,
        // TODO: Fix typing issue with provider
        // @ts-ignore
        provider as unknown as Provider,
        // @ts-ignore
        signer,
      );

      const { maker, isCollectionApproved, isTransferManagerApproved } =
        await hypercertExchangeClient.createFractionalSaleMakerAsk({
          startTime: Math.floor(Date.now() / 1000), // Use it to create an order that will be valid in the future (Optional, Default to now)
          endTime: Math.floor(Date.now() / 1000) + 86400, // If you use a timestamp in ms, the function will revert
          price: parseEther(values.price), // Be careful to use a price in wei, this example is for 1 ETH
          itemIds: [fractionTokenId.toString()], // Token id of the NFT(s) you want to sell, add several ids to create a bundle
          minUnitAmount: BigInt(values.minUnitsToKeep), // Minimum amount of units to keep after the sale
          maxUnitAmount: BigInt(values.maxUnitAmount), // Maximum amount of units to sell
          minUnitsToKeep: BigInt(values.minUnitsToKeep), // Minimum amount of units to keep after the sale
          sellLeftoverFraction: values.sellLeftoverFraction, // If you want to sell the leftover fraction
        });

      // Grant the TransferManager the right the transfer assets on behalf od the LooksRareProtocol
      setStep("Approve transfer manager");
      if (!isTransferManagerApproved) {
        const tx = await hypercertExchangeClient
          .grantTransferManagerApproval()
          .call();
        await waitForTransactionReceipt(walletClientData, {
          hash: tx.hash as `0x${string}`,
        });
      }

      setStep("Approve collection");
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
      setStep("Sign order");
      signature = await hypercertExchangeClient.signMakerOrder(maker);

      if (!signature) {
        throw new Error("Error signing order");
      }

      setStep("Create order");
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
    },
    throwOnError: true,
    onSuccess: () => {
      setOpen(false);
    },
  });
};

export const useFetchMarketplaceOrdersForHypercert = (hypercertId: string) => {
  const { client } = useHypercertClient();
  const chainId = useChainId();
  const { data: fractions } =
    useFetchHypercertFractionsByHypercertId(hypercertId);
  const provider = usePublicClient();

  return useQuery({
    queryKey: ["hypercert", "id", hypercertId, "chain", chainId, "orders"],
    queryFn: async () => {
      if (!provider) {
        return null;
      }
      const apiClient = new ApiClient();
      const { data: orders } = await apiClient.fetchOrders({
        claimTokenIds: fractions?.map((fraction) =>
          parseClaimOrFractionId(fraction.hypercert_id!).id.toString(),
        ),
      });
      return orders;
    },
    enabled: !!client && !!chainId,
  });
};
