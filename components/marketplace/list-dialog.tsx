import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { Button } from "../ui/button";
import { FormattedUnits } from "../formatted-units";
import type { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { ListAskedPrice } from "./list-asked-price";
import ListDialogSettingsForm from "./list-dialog-settings-form";
import ListFractionSelect from "./list-fraction-select";
import { InfoIcon, LoaderCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useCreateFractionalMakerAsk } from "@/marketplace/hooks";
import React, { useEffect } from "react";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import { toast } from "@/components/ui/use-toast";
import { getCurrencyByAddress, getMinimumPrice } from "@/marketplace/utils";
import type { HypercertExchangeClient } from "@hypercerts-org/marketplace-sdk";
import { parseClaimOrFractionId } from "@hypercerts-org/sdk";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { formatUnits, parseUnits } from "viem";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { clearCacheAfterListing } from "@/app/actions/clearCacheAfterListing";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { DialogDescription } from "@radix-ui/react-dialog";

export const listingFormSchema = z
  .object({
    fractionId: z.string(),
    price: z
      .string()
      .refine(
        (val) => /^\d*\.?\d*$/.test(val) && Number(val) > 0,
        "Must be a positive number",
      ),
    currency: z.string(),
    unitsForSale: z
      .string()
      .refine(
        (val) => /^\d*\.?\d*$/.test(val) && Number(val) > 0,
        "Must be a positive number",
      )
      .refine(
        (val) => BigInt(val) % BigInt(1) === BigInt(0),
        "Must be an integer",
      ),
    unitsMinPerOrder: z
      .string()
      .refine(
        (val) => /^\d*\.?\d*$/.test(val) && Number(val) > 0,
        "Must be a positive number",
      )
      .refine(
        (val) => BigInt(val) % BigInt(1) === BigInt(0),
        "Must be an integer",
      ),
    unitsMaxPerOrder: z
      .string()
      .refine(
        (val) => /^\d*\.?\d*$/.test(val) && Number(val) > 0,
        "Must be a positive number",
      )
      .refine(
        (val) => BigInt(val) % BigInt(1) === BigInt(0),
        "Must be an integer",
      ),
    startDateTime: z.date().superRefine((date, ctx) => {
      const now = new Date();
      const startTime = Math.floor(date.getTime() / 1000);
      const currentTime = Math.floor(now.getTime() / 1000);

      if (startTime < currentTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start time must be in the future",
        });
      }
    }),
    endDateTime: z.date(),
  })
  .refine(
    (data) => {
      const now = new Date();
      const endTime = Math.floor(data.endDateTime.getTime() / 1000);
      const currentTime = Math.floor(now.getTime() / 1000);
      const startTime = Math.floor(data.startDateTime.getTime() / 1000);

      return endTime > currentTime && endTime > startTime;
    },
    {
      message: "End time must be in the future and after the start time",
      path: ["endDateTime"],
    },
  )
  .refine(
    (data) => {
      const minOrder = BigInt(data.unitsMinPerOrder);
      const maxOrder = BigInt(data.unitsMaxPerOrder);
      const forSale = BigInt(data.unitsForSale);
      return minOrder <= maxOrder && maxOrder <= forSale;
    },
    {
      message:
        "Min units must be less than max units, and max units must be less than or equal to units for sale",
      path: ["unitsMaxPerOrder"],
    },
  );

export type ListingFormValues = z.infer<typeof listingFormSchema>;

function ListDialogInner({
  hypercert,
  setIsOpen,
  client,
}: {
  hypercert: HypercertFull;
  setIsOpen: (isOpen: boolean) => void;
  client: HypercertExchangeClient;
}) {
  const { address } = useAccount();
  const { mutateAsync: createFractionalMakerAsk, isPending } =
    useCreateFractionalMakerAsk({
      hypercertId: hypercert.hypercert_id || "",
    });
  const { chainId } = parseClaimOrFractionId(hypercert?.hypercert_id!);

  const units = BigInt(hypercert.units || "0");
  const fractions = hypercert.fractions?.data || [];
  const fractionsOwnedByUser = fractions.filter(
    (fraction) => fraction.owner_address === address,
  );
  const form = useForm<z.infer<typeof listingFormSchema>>({
    resolver: zodResolver(listingFormSchema),
    mode: "onChange",
    defaultValues: {
      fractionId: fractionsOwnedByUser[0]?.fraction_id || "",
      price: "",
      currency: Object.values(client.currencies)[0].address,
      unitsForSale: fractionsOwnedByUser[0]?.units || "0",
      unitsMinPerOrder: "1",
      unitsMaxPerOrder: fractionsOwnedByUser[0]?.units || "0",
      startDateTime: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes in the future
      endDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year in the future
    },
  });

  const selectedFraction = fractions.find(
    (fraction) => fraction.fraction_id === form.watch("fractionId"),
  );

  const isPriceValid =
    form.watch("price") !== undefined &&
    !isNaN(Number.parseFloat(form.watch("price"))) &&
    form.watch("currency") !== undefined;

  const handleListButtonClick = async (values: ListingFormValues) => {
    const unitsInFraction = BigInt(selectedFraction?.units!);
    try {
      await createFractionalMakerAsk({
        fractionId: values.fractionId,
        minUnitAmount: values.unitsMinPerOrder,
        maxUnitAmount: values.unitsMaxPerOrder || values.unitsForSale,
        minUnitsToKeep: (
          unitsInFraction - BigInt(values.unitsForSale)
        ).toString(),
        price: values.price,
        sellLeftoverFraction: false,
        currency: values.currency,
        unitsForSale: values.unitsForSale,
        startDateTime: Math.floor(values.startDateTime.getTime() / 1000),
        endDateTime: Math.floor(values.endDateTime.getTime() / 1000),
      });
      setIsOpen(false);
      toast({
        description: "Listing created successfully",
      });
      clearCacheAfterListing(hypercert.hypercert_id);
    } catch (e) {
      console.error(e);
      toast({
        description:
          (e as Error).toString() ||
          "Something went wrong while creating the order",
      });
    }
  };

  useEffect(() => {
    // Update the minimum price when the currency changes
    const minimumPrice = getMinimumPrice(
      form.watch("unitsForSale"),
      chainId,
      form.watch("currency"),
    );

    form.setValue(
      "price",
      form.watch("price") < minimumPrice ? minimumPrice : form.watch("price"),
    );
  }, [form.watch("currency"), form.watch("unitsForSale")]);

  useEffect(() => {
    form.setValue("unitsForSale", selectedFraction?.units || "0");
    form.setValue("unitsMaxPerOrder", selectedFraction?.units || "0");
    form.setValue("unitsMinPerOrder", "1");
  }, [form.watch("fractionId"), fractions]);

  const currency = getCurrencyByAddress(chainId, form.watch("currency"));

  if (!currency) {
    return null;
  }

  const minimumPrice = getMinimumPrice(
    form.watch("unitsForSale"),
    chainId,
    form.watch("currency"),
  );

  const actualPricePerUnit =
    parseUnits(form.watch("price"), currency.decimals) /
    BigInt(form.watch("unitsForSale") || 1);
  const actualTotalPrice =
    actualPricePerUnit * BigInt(form.watch("unitsForSale") || 0);
  const actualPriceForListing = formatUnits(
    actualTotalPrice,
    currency.decimals,
  );

  return (
    <DialogContent className="gap-5 max-w-2xl max-h-full overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-serif text-3xl font-medium tracking-tight">
          Create marketplace listing
        </DialogTitle>
      </DialogHeader>

      <DialogDescription>
        List your hypercert fraction for sale, allowing buyers to directly
        purchase all or part of it. Adjust settings to retain portions for
        yourself or set a minimum transaction amount as needed.
      </DialogDescription>

      {fractionsOwnedByUser.length > 1 && (
        <div className="font-semibold">
          You are the owner of multiple Hypercert fractions. Which one would you
          like to list on the marketplace?
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleListButtonClick)}
          className="space-y-6"
        >
          <table className="text-right w-full">
            <tbody>
              <tr className="h-10">
                <td className="w-[30%]"></td>
                <td className="w-[20%]">Fraction Id</td>
                <td className="w-[20%]">Units</td>
                <td className="pr-3 w-[30%]">Hypercert share</td>
              </tr>

              {fractionsOwnedByUser.map((fraction) => (
                <ListFractionSelect
                  fraction={fraction}
                  units={units}
                  key={fraction.fraction_id}
                  selected={form.watch("fractionId") === fraction.fraction_id}
                  setSelected={(fractionId) => {
                    form.setValue("fractionId", fractionId);
                  }}
                />
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-2">
            <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
              ASKED SHARE PRICE
            </h5>
            <ListAskedPrice
              price={form.watch("price")}
              currency={form.watch("currency")}
              setPrice={(price) => form.setValue("price", price)}
              setCurrency={(currency) => form.setValue("currency", currency)}
            />
            {selectedFraction && isPriceValid && (
              <div className="text-sm text-slate-500 flex align-middle w-full">
                Creating this listing will offer&nbsp;
                <b>
                  <FormattedUnits>{form.watch("unitsForSale")}</FormattedUnits>
                </b>
                &nbsp;units for sale at a total price of&nbsp;
                <b>
                  {actualPriceForListing}&nbsp;
                  {
                    getCurrencyByAddress(chainId, form.watch("currency"))
                      ?.symbol
                  }
                </b>
                .
                {actualPriceForListing !== form.watch("price") && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className={"ml-auto"}>
                        <InfoIcon className="ml-auto text-black" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]" side={"left"}>
                        Due to rounding, your listing will actually be for{" "}
                        <b>
                          {actualPriceForListing}{" "}
                          {
                            getCurrencyByAddress(
                              chainId,
                              form.watch("currency"),
                            )?.symbol
                          }
                        </b>
                        . To prevent this, use a price that is a multiple of{" "}
                        <b>
                          {minimumPrice}{" "}
                          {
                            getCurrencyByAddress(
                              chainId,
                              form.watch("currency"),
                            )?.symbol
                          }
                        </b>
                        .
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
                  SALE STARTING TIME
                </h5>
                <FormControl>
                  <DateTimePicker
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormDescription>
                  Sale will start at the selected moment.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
                  SALE ENDING TIME
                </h5>
                <FormControl>
                  <DateTimePicker
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormDescription>
                  Sale will end at the selected moment.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem
                value="item-1"
                className="data-[state=open]:border-0"
              >
                <AccordionTrigger className="uppercase text-sm text-slate-500 font-medium tracking-wider">
                  Advanced settings
                </AccordionTrigger>

                <AccordionContent>
                  <ListDialogSettingsForm
                    control={form.control}
                    units={selectedFraction?.units || "0"}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="flex gap-2 justify-evenly">
            <Button
              variant={"outline"}
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                disabled={!form.formState.isValid}
                className={"w-full"}
                asChild
              >
                <Button
                  disabled={!form.formState.isValid}
                  className="w-full"
                  type="submit"
                >
                  {isPending && (
                    <LoaderCircle className="h-4 w-4 animate-spin mr-1" />
                  )}
                  {isPending ? "Creating listing" : "Create listing"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm listing</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will sell{" "}
                    <b>
                      <FormattedUnits>
                        {form.getValues("unitsForSale")}
                      </FormattedUnits>
                    </b>{" "}
                    units of your hypercert for{" "}
                    <b>
                      {actualPriceForListing} {currency.symbol}
                    </b>{" "}
                    in total.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction type="submit">Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}

export default function ListDialog({
  hypercert,
  setIsOpen,
}: {
  hypercert: HypercertFull;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { client } = useHypercertExchangeClient();
  if (!client) return null;

  return (
    <ListDialogInner
      hypercert={hypercert}
      setIsOpen={setIsOpen}
      client={client}
    />
  );
}
