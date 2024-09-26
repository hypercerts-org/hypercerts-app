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
import { type HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { FormattedUnits } from "@/components/formatted-units";
import {
  decodeFractionalOrderParams,
  formatPrice,
  getCurrencyByAddress,
  getPricePerPercent,
  getPricePerUnit,
  getTotalPriceFromPercentage,
} from "@/marketplace/utils";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseUnits } from "viem";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";

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
      const hypercertUnits = BigInt(hypercert.units || 0);
      const percentageAsBigInt = BigInt(Number(percentageAmount) * 100);
      const unitsToBuy =
        (hypercertUnits * percentageAsBigInt) / BigInt(100 * 100);
      return unitsToBuy.toString();
    } catch (e) {
      console.error(e);
      return "0";
    }
  };

  const getPercentageForUnits = (units: bigint) => {
    return (units * BigInt(100)) / BigInt(hypercert?.units || 0);
  };

  const currency = getCurrencyByAddress(order.chainId, order.currency);

  if (!currency) {
    throw new Error("Currency not supported");
  }

  const minPercentageAmount = getPercentageForUnits(minUnitAmount).toString();
  const maxPercentageAmount = calculateBigIntPercentage(
    maxUnitAmountToBuy,
    BigInt(hypercert.units || 0),
  )?.toString();
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
      minPricePerPercent: minPricePerPercent.toString(),
      pricePerPercent: minPricePerPercent.toString(),
    },
  });

  const { mutateAsync: buyFractionalMakerAsk } = useBuyFractionalMakerAsk();

  const onSubmit = async (values: BuyFractionalOrderFormValues) => {
    const hypercertUnits = BigInt(hypercert.units || 0);

    if (!hypercertUnits) {
      throw new Error("Invalid hypercert units");
    }

    const unitAmount = getUnitsToBuy(values.percentageAmount);
    const pricePerUnit = getPricePerUnit(
      values.pricePerPercent,
      hypercertUnits,
    ).toString();

    await buyFractionalMakerAsk({
      order,
      unitAmount,
      pricePerUnit,
      hypercertName: hypercert?.metadata?.name,
      totalUnitsInHypercert: hypercertUnits,
    });
    onCompleted?.();
  };

  const percentageAmount = form.watch("percentageAmount");
  const pricePerPercent = form.watch("pricePerPercent");

  const totalPrice = formatPrice(
    order.chainId,
    getTotalPriceFromPercentage(
      BigInt(pricePerPercent),
      Number(percentageAmount),
    ),
    currency.address,
    true,
  );

  const formattedMinPrice = formatPrice(
    order.chainId,
    BigInt(minPricePerPercent),
    currency.address,
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
            <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
              % to buy
            </h5>
            <FormControl>
              <Input {...form.register("percentageAmount")} />
            </FormControl>
            <div className="text-sm text-slate-500">
              You will buy{" "}
              <b>
                <FormattedUnits>{unitsToBuy}</FormattedUnits>
              </b>{" "}
              units , for a total of <b>{totalPrice}</b>. (min:{" "}
              {minPercentageAmount}%, max: {maxPercentageAmount}%)
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={"pricePerPercent"}
        render={() => (
          <FormItem>
            <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
              Price per %
            </h5>
            <FormControl>
              <Input
                value={formatPrice(
                  order.chainId,
                  BigInt(pricePerPercent),
                  currency.address,
                )}
                onChange={(e) => {
                  const value = e.target.value;
                  form.setValue(
                    "pricePerPercent",
                    parseUnits(value, currency.decimals).toString(),
                  );
                }}
              />
            </FormControl>
            <div className="text-sm text-slate-500">
              You can voluntarily increase the price. (min:{" "}
              <b>
                {formattedMinPrice} {currency.symbol}
              </b>
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
