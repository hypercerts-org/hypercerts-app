import { FormattedUnits } from "@/components/formatted-units";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_NUM_UNITS,
  DEFAULT_NUM_UNITS_DECIMALS,
} from "@/configs/hypercerts";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";
import { useBuyFractionalMakerAsk } from "@/marketplace/hooks";
import { MarketplaceOrder } from "@/marketplace/types";
import {
  decodeFractionalOrderParams,
  formatPrice,
  getCurrencyByAddress,
  getPricePerPercent,
  getPricePerUnit,
} from "@/marketplace/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { parseUnits } from "viem";
import z from "zod";

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
  hypercert,
  onBuyOrder,
  onCompleted,
}: {
  order: MarketplaceOrder;
  hypercert: HypercertFull;
  onBuyOrder: (orderId: string) => void;
  onCompleted?: () => void;
}) => {
  const { minUnitAmount, maxUnitAmount, minUnitsToKeep } =
    decodeFractionalOrderParams(order.additionalParameters);

  const availableUnits = BigInt(hypercert?.units || 0) - BigInt(minUnitsToKeep);
  const maxUnitAmountToBuy =
    availableUnits > maxUnitAmount ? maxUnitAmount : availableUnits;

  const getUnitsToBuy = (percentageAmount: string) => {
    try {
      const hypercertUnits = BigInt(hypercert.units || 0);
      const percentageAsBigInt = parseUnits(
        percentageAmount,
        DEFAULT_NUM_UNITS_DECIMALS,
      );
      const unitsToBuy =
        (hypercertUnits * percentageAsBigInt) /
        (BigInt(100) * DEFAULT_NUM_UNITS);
      return unitsToBuy < BigInt(0) ? BigInt(0) : unitsToBuy;
    } catch (e) {
      console.error(e);
      return BigInt(0);
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

    onBuyOrder(order.orderNonce);

    try {
      await buyFractionalMakerAsk({
        order,
        unitAmount,
        pricePerUnit,
        hypercertName: hypercert?.metadata?.name,
        totalUnitsInHypercert: hypercertUnits,
      });
      onCompleted?.();
    } catch (error) {
      console.error("Error buying fractional order:", error);
    }
  };

  const percentageAmount = form.watch("percentageAmount");
  const pricePerPercent = form.watch("pricePerPercent");

  const unitsToBuy = getUnitsToBuy(percentageAmount);
  const pricePerUnit = getPricePerUnit(
    pricePerPercent,
    BigInt(hypercert.units || 0),
  );

  const totalPrice = formatPrice(
    order.chainId,
    unitsToBuy * pricePerUnit,
    currency.address,
    true,
  );

  const formattedMinPrice = formatPrice(
    order.chainId,
    BigInt(minPricePerPercent),
    currency.address,
  );

  const disabled = !form.formState.isValid || unitsToBuy === BigInt(0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="percentageAmount"
          render={({ field }) => (
            <FormItem>
              <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
                % to buy
              </h5>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <div className="text-sm text-slate-500">
                You will buy{" "}
                <b>
                  <FormattedUnits>{unitsToBuy.toString()}</FormattedUnits>
                </b>{" "}
                units , for a total of <b>{totalPrice}</b>. (min:{" "}
                {minPercentageAmount}%, max: {maxPercentageAmount}%)
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pricePerPercent"
          render={({ field }) => (
            <FormItem>
              <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
                Price per %
              </h5>
              <FormControl>
                <Input
                  {...field}
                  value={formatPrice(
                    order.chainId,
                    BigInt(field.value),
                    currency.address,
                  )}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      field.onChange(
                        parseUnits(value, currency.decimals).toString(),
                      );
                    }
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

        <Button variant="outline" type="submit" disabled={disabled}>
          Execute order
        </Button>
      </form>
    </Form>
  );
};
