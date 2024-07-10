import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarketplaceOrder } from "@/marketplace/types";
import React from "react";
import { useBuyFractionalMakerAsk } from "@/marketplace/hooks";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { FormattedUnits } from "@/components/formatted-units";
import {
  decodeFractionalOrderParams,
  getCurrencyByAddress,
  getPricePerPercent,
  getPricePerUnit,
} from "@/marketplace/utils";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
  .object({
    percentageAmount: z.string(),
    maxPercentageAmount: z.string(),
    minPercentageAmount: z.string(),
    pricePerPercent: z.string(),
    minPricePerPercent: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!(Number(data.percentageAmount) <= Number(data.maxPercentageAmount))) {
      ctx.addIssue({
        path: ["percentageAmount"],
        message: "Must be less than max percentage",
        code: z.ZodIssueCode.custom,
      });
    }
  })
  .superRefine((data, ctx) => {
    if (!(Number(data.percentageAmount) >= Number(data.minPercentageAmount))) {
      ctx.addIssue({
        path: ["percentageAmount"],
        message: "Must be more than min percentage",
        code: z.ZodIssueCode.custom,
      });
    }
  })
  .superRefine((data, ctx) => {
    if (!(Number(data.pricePerPercent) >= Number(data.minPricePerPercent))) {
      ctx.addIssue({
        path: ["pricePerPercent"],
        message: "Must be more than min price",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type BuyFractionalOrderFormValues = z.infer<typeof formSchema>;

export const BuyFractionalOrderForm = ({
  order,
  onCompleted,
  hypercert,
}: {
  order: MarketplaceOrder;
  onCompleted?: () => void;
  hypercert: HypercertFull;
}) => {
  const { minUnitAmount, maxUnitAmount, minUnitsToKeep } =
    decodeFractionalOrderParams(order.additionalParameters);

  const availableUnits = BigInt(hypercert?.units || 0) - BigInt(minUnitsToKeep);
  const maxUnitAmountToBuy =
    availableUnits > maxUnitAmount ? maxUnitAmount : availableUnits;

  const getUnitsToBuy = (percentageAmount: string) => {
    try {
      const unitsToBuy =
        (BigInt(hypercert?.units || 0) * BigInt(percentageAmount)) /
        BigInt(100);
      return unitsToBuy.toString();
    } catch (e) {
      console.error(e);
      return "0";
    }
  };

  const getPercentageForUnits = (units: bigint) => {
    return (units * BigInt(100)) / BigInt(hypercert?.units || 0);
  };

  const currency = getCurrencyByAddress(order.currency);

  const minPercentageAmount = getPercentageForUnits(minUnitAmount).toString();
  const maxPercentageAmount =
    getPercentageForUnits(maxUnitAmountToBuy).toString();
  const minPricePerPercent = getPricePerPercent(
    order.price,
    BigInt(hypercert.units || 0),
  );

  const form = useForm<BuyFractionalOrderFormValues>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    defaultValues: {
      minPercentageAmount,
      maxPercentageAmount,
      percentageAmount: minPercentageAmount,
      minPricePerPercent,
      pricePerPercent: minPricePerPercent,
    },
  });

  const { mutateAsync: buyFractionalMakerAsk } = useBuyFractionalMakerAsk();

  const onSubmit = async (values: BuyFractionalOrderFormValues) => {
    const unitAmount = getUnitsToBuy(values.percentageAmount);
    const pricePerUnit = getPricePerUnit(
      values.pricePerPercent,
      BigInt(hypercert.units || 0),
    );

    await buyFractionalMakerAsk({
      order,
      unitAmount,
      pricePerUnit,
    });
    onCompleted?.();
  };

  const percentageAmount = form.watch("percentageAmount");
  const pricePerPercent = form.watch("pricePerPercent");

  const totalPrice = Math.max(
    Number(pricePerPercent) * Number(percentageAmount),
    0,
  );
  const unitsToBuy =
    BigInt(getUnitsToBuy(percentageAmount)) > BigInt(0)
      ? getUnitsToBuy(percentageAmount)
      : "0";

  return (
    <Form {...form}>
      <FormField
        name={"percentageAmount"}
        render={() => (
          <FormItem>
            <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
              % to buy
            </h5>
            <FormControl>
              <Input {...form.register("percentageAmount")} />
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
              . (min: {minPercentageAmount}%, max: {maxPercentageAmount}%)
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={"pricePerPercent"}
        render={() => (
          <FormItem>
            <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
              Price per %
            </h5>
            <FormControl>
              <Input {...form.register("pricePerPercent")} />
            </FormControl>
            <div className="text-sm text-gray-500">
              You can voluntarily increase the price. (min: {minPricePerPercent}
              ).
            </div>
            <FormMessage />
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
