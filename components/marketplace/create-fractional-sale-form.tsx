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
import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StepProcessDialogProvider } from "@/components/global/step-process-dialog";
import {
  useCreateFractionalMakerAsk,
  useFetchMarketplaceOrdersForHypercert,
} from "@/marketplace/hooks";

export interface CreateFractionalOfferFormValues {
  fractionId: string;
  minUnitAmount: string;
  maxUnitAmount: string;
  minUnitsToKeep: string;
  price: string;
  sellLeftoverFraction: boolean;
}

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

const CreateFractionalOrderFormInner = ({
  hypercertId,
}: {
  hypercertId: string;
}) => {
  const [step, setStep] = React.useState<"form" | "confirmation">("form");
  const { data: fractions, isLoading: fractionsLoading } =
    useFetchHypercertFractionsByHypercertId(hypercertId);
  const { data: currentOrdersForHypercert, isLoading: currentOrdersLoading } =
    useFetchMarketplaceOrdersForHypercert(hypercertId);
  const { mutateAsync: createFractionalMakerAsk } = useCreateFractionalMakerAsk(
    {
      hypercertId,
    },
  );

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
    ? Object.values(currentOrdersForHypercert).map((order) => order.itemIds[0])
    : [];

  const yourFractionsWithoutActiveOrder = yourFractions.filter(
    (fraction) => !fractionsWithActiveOrder.includes(fraction.hypercert_id!),
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
        </div>
      )}
    </div>
  );
};

export const CreateFractionalOrderForm = ({
  hypercertId,
}: {
  hypercertId: string;
}) => {
  return (
    <StepProcessDialogProvider>
      <CreateFractionalOrderFormInner hypercertId={hypercertId} />
    </StepProcessDialogProvider>
  );
};
