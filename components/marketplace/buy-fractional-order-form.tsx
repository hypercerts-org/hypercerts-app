import { useForm } from "react-hook-form";
import { formatEther } from "viem";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarketplaceOrder } from "@/marketplace/types";
import React from "react";
import { useBuyFractionalMakerAsk } from "@/marketplace/hooks";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { FormattedUnits } from "@/components/formatted-units";
import { getCurrencyByAddress } from "@/marketplace/utils";

export interface BuyFractionalOrderFormValues {
  percentageAmount: string;
  pricePerPercent: string;
}

export const BuyFractionalOrderForm = ({
  order,
  onCompleted,
  hypercert,
}: {
  order: MarketplaceOrder;
  onCompleted?: () => void;
  hypercert: HypercertFull;
}) => {
  const getPricePerPercent = (price: string) => {
    const unitsPerPercent = BigInt(hypercert?.units || 0) / BigInt(100);
    return formatEther(BigInt(price) * unitsPerPercent);
  };

  const getUnitsToBuy = (percentageAmount: string) => {
    const unitsToBuy =
      (BigInt(hypercert?.units || 0) * BigInt(percentageAmount)) / BigInt(100);
    return unitsToBuy.toString();
  };

  const getPricePerUnit = (pricePerPercent: string) => {
    const unitsPerPercent = BigInt(hypercert?.units || 0) / BigInt(100);
    return formatEther(BigInt(pricePerPercent) / unitsPerPercent);
  };

  const currency = getCurrencyByAddress(order.currency);

  const form = useForm<BuyFractionalOrderFormValues>({
    defaultValues: {
      percentageAmount: "20",
      pricePerPercent: getPricePerPercent(order.price),
    },
  });

  const { mutateAsync: buyFractionalMakerAsk } = useBuyFractionalMakerAsk();

  const onSubmit = async (values: BuyFractionalOrderFormValues) => {
    const unitAmount = getUnitsToBuy(values.percentageAmount);
    const pricePerUnit = getPricePerUnit(values.pricePerPercent);

    await buyFractionalMakerAsk({
      order,
      unitAmount,
      pricePerUnit,
    });
    onCompleted?.();
  };

  const percentageAmount = form.watch("percentageAmount");
  const pricePerPercent = form.watch("pricePerPercent");

  const totalPrice = Number(pricePerPercent) * Number(percentageAmount);
  const unitsToBuy = getUnitsToBuy(percentageAmount);

  return (
    <Form {...form}>
      <FormField
        name={"percentageAmount"}
        render={({ field }) => (
          <FormItem>
            <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
              % to buy
            </h5>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <div className="text-sm text-gray-500">
              You will buy{" "}
              <b>
                <FormattedUnits>{unitsToBuy}</FormattedUnits>
              </b>{" "}
              units , for a total of{" "}
              <b>
                <FormattedUnits>{totalPrice}</FormattedUnits> {currency?.symbol}
              </b>
              .
            </div>
          </FormItem>
        )}
      />

      <FormField
        name={"pricePerPercent"}
        render={({ field }) => (
          <FormItem>
            <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
              Price per %
            </h5>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <div className="text-sm text-gray-500">
              You can voluntarily increase the price.
            </div>
          </FormItem>
        )}
      />

      <Button
        variant={"outline"}
        type="button"
        onClick={form.handleSubmit(onSubmit)}
      >
        Execute order
      </Button>
    </Form>
  );
};
