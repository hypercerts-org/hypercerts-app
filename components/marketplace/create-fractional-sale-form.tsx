import { useForm } from "react-hook-form";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import {
  ApiClient,
  HypercertExchangeClient,
  Maker,
  QuoteType,
} from "@hypercerts-org/marketplace-sdk";
import { parseClaimOrFractionId } from "@hypercerts-org/sdk";
import { isAddress, parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export interface CreateFractionalOfferFormValues {
  fractionId: string;
  minUnitAmount: string;
  maxUnitAmount: string;
  minUnitsToKeep: string;
  price: string;
  sellLeftoverFraction: boolean;
}

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
      //
      // onOpen([
      //   {
      //     title: "Splitting",
      //     description: "Splitting fraction units on-chain",
      //   },
      //   {
      //     title: "Waiting",
      //     description: "Awaiting confirmation",
      //   },
      //   {
      //     title: "Create",
      //     description: "Creating order in contract",
      //   },
      //   {
      //     title: "Approve transfer manager",
      //     description: "Approving transfer manager",
      //   },
      //   {
      //     title: "Approve collection",
      //     description: "Approving collection",
      //   },
      //   {
      //     title: "Sign order",
      //     description: "Signing order",
      //   },
      //   {
      //     title: "Create order",
      //     description: "Creating order",
      //   },
      // ]);

      let signature: string | undefined;

      // setStep("Create");
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
      // setStep("Approve transfer manager");
      if (!isTransferManagerApproved) {
        const tx = await hypercertExchangeClient
          .grantTransferManagerApproval()
          .call();
        await waitForTransactionReceipt(walletClientData, {
          hash: tx.hash as `0x${string}`,
        });
      }

      // setStep("Approve collection");
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
      // setStep("Sign order");
      signature = await hypercertExchangeClient.signMakerOrder(maker);

      if (!signature) {
        throw new Error("Error signing order");
      }

      // setStep("Create order");
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
    onSuccess: () => {},
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
        (await client.indexer
          .fractionsByHypercert({ hypercertId })
          .then((res) =>
            res?.hypercerts.data?.flatMap((x) => x.fractions?.data),
          )) || [];
      const totalUnitsForAllFractions = fractions?.reduce(
        (acc, cur) => acc + BigInt(cur?.units),
        BigInt(0),
      );

      return fractions.map((fraction) => ({
        ...fraction,
        percentage: Number(
          (BigInt(fraction?.units) * BigInt(100)) / totalUnitsForAllFractions,
        ),
      }));
    },
    enabled: !!client && !!chainId,
  });
};

const useFetchMarketplaceOrdersForHypercert = (hypercertId: string) => {
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

export const CreateFractionalOrderForm = ({
  hypercertId,
  onClickViewListings,
}: {
  hypercertId: string;
  onClickViewListings?: () => void;
}) => {
  const [step, setStep] = React.useState<"form" | "confirmation">("form");
  const { data: fractions, isLoading: fractionsLoading } =
    useFetchHypercertFractionsByHypercertId(hypercertId);
  const { data: currentOrdersForHypercert, isLoading: currentOrdersLoading } =
    useFetchMarketplaceOrdersForHypercert(hypercertId);
  const { mutateAsync: createFractionalMakerAsk, isPending } =
    useCreateFractionalMakerAsk({
      hypercertId,
    });

  const { address } = useAccount();

  const form = useForm<CreateFractionalOfferFormValues>({
    defaultValues: {
      minUnitAmount: "10",
      maxUnitAmount: "100",
      minUnitsToKeep: "20",
      price: "0.00000000000001",
      sellLeftoverFraction: false,
    },
    reValidateMode: "onBlur",
    mode: "onBlur",
  });

  const { isValid, isSubmitting } = form.formState;
  const loading = fractionsLoading || currentOrdersLoading;

  if (loading) {
    return <div>Loading</div>;
  }

  if (!fractions) {
    return <div>Hypercert fractions not found</div>;
  }

  const onSubmit = async (values: CreateFractionalOfferFormValues) => {
    await createFractionalMakerAsk(values);
    setStep("confirmation");
  };

  const yourFractions = fractions.filter(
    (fraction) => fraction.owner_address === address,
  );

  const fractionsWithActiveOrder = currentOrdersForHypercert
    ? Object.values(currentOrdersForHypercert).map(
        (order) => order.fraction?.id,
      )
    : [];

  const yourFractionsWithoutActiveOrder = yourFractions.filter(
    (fraction) => !fractionsWithActiveOrder.includes(fraction.hypercert_id),
  );

  const hasFractionsWithoutActiveOrder =
    yourFractionsWithoutActiveOrder.length > 0;

  const submitDisabled = !isValid || isSubmitting;

  return (
    <div>
      {step === "form" && (
        <Form {...form}>
          <div>
            <div>Create fractional sale</div>

            {hasFractionsWithoutActiveOrder ? (
              <div>
                <FormField
                  name={"fractionId"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fraction id to select</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={(val) =>
                            form.setValue("fractionId", val)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Fraction" />
                          </SelectTrigger>
                          <SelectContent>
                            {yourFractionsWithoutActiveOrder.map((fraction) => (
                              <SelectItem
                                key={fraction.hypercert_id}
                                value={fraction.hypercert_id!}
                              >
                                {fraction.hypercert_id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>Fraction id to select</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  name={"price"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per unit</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Price per unit</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  name={"minUnitAmount"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum amount of units per sale</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Minimum amount of units per sale
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  name={"maxUnitAmount"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum amount of units per sale</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum amount of units per sale
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  name={"minUnitsToKeep"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Minimum amount of units I would like to keep
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        How many units to keep at a minimum
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  name={"sellLeftoverFraction"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell leftover fraction</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              field.onBlur();
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Sell leftover units if there are less then the minimum
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={submitDisabled}
                    variant={"outline"}
                    type="button"
                  >
                    Create
                  </Button>
                </div>
              </div>
            ) : (
              <div>You don{"'"}t have any fractions to sell</div>
            )}
          </div>
        </Form>
      )}
      {step === "confirmation" && (
        <div>
          <div>
            <div>
              Successfully <br />
              listed
            </div>
            <div>Your hypercert fractions are on sale now.</div>
          </div>
          {onClickViewListings && (
            <Button onClick={onClickViewListings} variant={"outline"}>
              View your listings
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
