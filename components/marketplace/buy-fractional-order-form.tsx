import { useForm } from "react-hook-form";
import { formatEther } from "viem";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarketplaceOrder } from "@/marketplace/alias";
import { useBuyFractionalMakerAsk } from "@/components/marketplace/useBuyFractionalMakerAsk";
import React from "react";

export interface BuyFractionalOrderFormValues {
  unitAmount: string;
  pricePerUnit: string;
}

export const BuyFractionalOrderForm = ({
  order,
  onCompleted,
}: {
  order: MarketplaceOrder;
  onCompleted?: () => void;
}) => {
  const form = useForm<BuyFractionalOrderFormValues>({
    defaultValues: {
      unitAmount: "20",
      pricePerUnit: formatEther(BigInt(order.price)),
    },
  });

  const { mutateAsync: buyFractionalMakerAsk } = useBuyFractionalMakerAsk();

  const onSubmit = async (values: BuyFractionalOrderFormValues) => {
    await buyFractionalMakerAsk({
      order,
      unitAmount: values.unitAmount,
      pricePerUnit: values.pricePerUnit,
    });
    onCompleted?.();
  };

  return (
    <Form {...form}>
      <FormField
        name={"unitAmount"}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>Number of units to buy </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        name={"pricePerUnit"}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>Price per unit</FormDescription>
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
