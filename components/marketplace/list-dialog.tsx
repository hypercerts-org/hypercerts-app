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
import React, { useEffect, useState } from "react";
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

type State = {
  fractionId: string;
  price: string;
  currency: string;
  unitsForSale?: string;
  unitsMinPerOrder?: string;
  unitsMaxPerOrder?: string;
  formIsValid: boolean;
  startDateTime?: Date;
  endDateTime?: Date;
};

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

  const [state, setState] = useState<State>(() => {
    const currency = Object.values(client.currencies)[0];
    const defaultFraction = fractionsOwnedByUser[0];
    const unitsForSale = defaultFraction?.units || "0";
    const minimumPrice = getMinimumPrice(
      unitsForSale,
      chainId,
      currency.address,
    );
    return {
      fractionId: defaultFraction?.fraction_id || "",
      price: "",
      currency: currency.address,
      unitsForSale,
      unitsMinPerOrder: "1",
      unitsMaxPerOrder: defaultFraction?.units || "",
      formIsValid: true,
      minimumPrice,
      startDateTime: new Date(Date.now()),
      endDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
  });

  const selectedFraction = fractions.find(
    (fraction) => fraction.fraction_id === state.fractionId,
  );

  const floatPrice = Number.parseFloat(state.price);

  const isPriceValid =
    state.price !== undefined &&
    !isNaN(floatPrice) &&
    state.currency !== undefined;

  const handleListButtonClick = async () => {
    if (
      !createFractionalMakerAsk ||
      !isPriceValid ||
      !state.formIsValid ||
      !state.fractionId ||
      !state.unitsMinPerOrder ||
      !state.unitsForSale ||
      !state.startDateTime ||
      !state.endDateTime
    ) {
      return;
    }

    const selectedFraction = fractions.find(
      (fraction) => fraction.fraction_id === state.fractionId,
    );

    if (!selectedFraction?.units) {
      console.error("Unknown units");
      return;
    }

    const unitsInFraction = BigInt(selectedFraction.units);

    try {
      await createFractionalMakerAsk({
        fractionId: state.fractionId,
        minUnitAmount: state.unitsMinPerOrder,
        maxUnitAmount: state.unitsMaxPerOrder || state.unitsForSale,
        minUnitsToKeep: (
          unitsInFraction - BigInt(state.unitsForSale)
        ).toString(),
        price: state.price,
        sellLeftoverFraction: false,
        currency: state.currency,
        unitsForSale: state.unitsForSale,
        startDateTime: Math.floor(state.startDateTime.getTime() / 1000),
        endDateTime: Math.floor(state.endDateTime.getTime() / 1000),
      });

      setIsOpen(false);
      toast({
        description: "Listing created successfully",
      });
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
      state.unitsForSale,
      chainId,
      state.currency,
    );

    setState((currentState) => ({
      ...currentState,
      price:
        currentState.price < minimumPrice ? minimumPrice : currentState.price,
    }));
  }, [state.currency, state.unitsForSale]);

  useEffect(() => {
    setState((state) => {
      const fraction = fractions.find(
        (fraction) => fraction.fraction_id === state.fractionId,
      );

      if (!fraction) {
        return state;
      }

      const unitsForSale = fraction?.units || "0";

      return {
        ...state,
        unitsForSale,
        unitsMaxPerOrder: fraction.units || "",
        unitsMinPerOrder: "1",
      };
    });
  }, [state.fractionId, fractions]);

  const currency = getCurrencyByAddress(chainId, state.currency);

  if (!currency) {
    return null;
  }

  const minimumPrice = getMinimumPrice(
    state.unitsForSale,
    chainId,
    state.currency,
  );

  const actualPricePerUnit =
    parseUnits(state.price, currency.decimals) /
    BigInt(state.unitsForSale || 1);
  const actualTotalPrice = actualPricePerUnit * BigInt(state.unitsForSale || 0);
  const actualPriceForListing = formatUnits(
    actualTotalPrice,
    currency.decimals,
  );

  const createButtonEnabled =
    isPriceValid && state.formIsValid && actualPricePerUnit !== BigInt(0);

  const validateStartDateTime = (): [boolean, React.ReactNode] => {
    if (!state.startDateTime) {
      return [false, "Must be a valid date and time."];
    }

    return [true, "Sale will start at the selected moment."];
  };

  const validateEndDateTime = (): [boolean, React.ReactNode] => {
    if (!state.endDateTime) {
      return [false, "Must be a valid date and time."];
    }

    if (state.endDateTime <= new Date()) {
      return [false, "Must be in the future."];
    }

    if (state.startDateTime && state.endDateTime <= state.startDateTime) {
      return [false, "Must be after the start of the sale."];
    }

    return [true, "Sale will end at the selected moment."];
  };

  const startDateTimeValidation = validateStartDateTime();
  const endDateTimeValidation = validateEndDateTime();

  return (
    <DialogContent className="gap-5 max-w-2xl max-h-full overflow-y-auto">
      <DialogHeader>
        <div className="bg-orange-400/70 p-2 mb-2 rounded-sm">
          Hypercerts marketplace features are in beta. Please use with caution.
        </div>
        <DialogTitle className="font-serif text-3xl font-medium tracking-tight">
          Create marketplace listing
        </DialogTitle>
      </DialogHeader>

      <div>
        List your hypercert fraction for sale, allowing buyers to directly
        purchase all or part of it. Adjust settings to retain portions for
        yourself or set a minimum transaction amount as needed.
      </div>

      {fractionsOwnedByUser.length > 1 && (
        <div className="font-semibold">
          You are the owner of multiple Hypercert fractions. Which one would you
          like to list on the marketplace?
        </div>
      )}

      <table className="text-right">
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
              selected={state.fractionId === fraction.fraction_id}
              setSelected={(fractionId) => setState({ ...state, fractionId })}
            />
          ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-2">
        <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          ASKED SHARE PRICE
        </h5>
        <ListAskedPrice
          price={state.price}
          currency={state.currency}
          setPrice={(price) => setState({ ...state, price })}
          setCurrency={(currency) => setState({ ...state, currency })}
        />
        {selectedFraction && isPriceValid && (
          <div className="text-sm text-slate-500 flex align-middle w-full">
            Creating this listing will offer&nbsp;
            <b>
              <FormattedUnits>{state.unitsForSale}</FormattedUnits>
            </b>
            &nbsp;units for sale at a total price of&nbsp;
            <b>
              {actualPriceForListing}&nbsp;
              {getCurrencyByAddress(chainId, state.currency)?.symbol}
            </b>
            .
            {actualPriceForListing !== state.price && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className={"ml-auto"}>
                    <InfoIcon className="ml-auto text-black" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]" side={"left"}>
                    Due to rounding, your listing will actually be for{" "}
                    <b>
                      {actualPriceForListing}{" "}
                      {getCurrencyByAddress(chainId, state.currency)?.symbol}
                    </b>
                    . To prevent this, use a price that is a multiple of{" "}
                    <b>
                      {minimumPrice}{" "}
                      {getCurrencyByAddress(chainId, state.currency)?.symbol}
                    </b>
                    .
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          SALE STARTING TIME
        </h5>
        <DateTimePicker
          onChange={(startDateTime) =>
            setState((currentState) => ({
              ...currentState,
              startDateTime,
            }))
          }
          value={state.startDateTime}
        />
        {startDateTimeValidation[0] ? (
          <div className="text-sm text-slate-500">
            {startDateTimeValidation[1]}
          </div>
        ) : (
          <div className="text-sm text-red-500">
            {startDateTimeValidation[1]}
          </div>
        )}{" "}
      </div>

      <div className="flex flex-col gap-3">
        <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          SALE ENDING TIME
        </h5>
        <DateTimePicker
          onChange={(endDateTime) =>
            setState((currentState) => ({ ...currentState, endDateTime }))
          }
          value={state.endDateTime}
        />
        {endDateTimeValidation[0] ? (
          <div className="text-sm text-slate-500">
            {endDateTimeValidation[1]}
          </div>
        ) : (
          <div className="text-sm text-red-500">{endDateTimeValidation[1]}</div>
        )}{" "}
      </div>
      <div className="flex flex-col gap-2">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="data-[state=open]:border-0">
            <AccordionTrigger className="uppercase text-sm text-slate-500 font-medium tracking-wider">
              Advanced settings
            </AccordionTrigger>
            <AccordionContent>
              <ListDialogSettingsForm
                selectedFractionUnits={selectedFraction?.units || ""}
                unitsForSale={state.unitsForSale}
                unitsMinPerOrder={state.unitsMinPerOrder}
                unitsMaxPerOrder={state.unitsMaxPerOrder}
                setUnitsForSale={(unitsForSale) =>
                  setState({ ...state, unitsForSale })
                }
                setUnitsMinPerOrder={(unitsMinPerOrder) =>
                  setState({ ...state, unitsMinPerOrder })
                }
                setUnitsMaxPerOrder={(unitsMaxPerOrder) =>
                  setState({ ...state, unitsMaxPerOrder })
                }
                setFormIsValid={(formIsValid) =>
                  setState({ ...state, formIsValid })
                }
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
            disabled={!createButtonEnabled}
            className={"w-full"}
          >
            <Button disabled={!createButtonEnabled} className="w-full">
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
                  <FormattedUnits>{state.unitsForSale}</FormattedUnits>
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
              <AlertDialogAction onClick={handleListButtonClick}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
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
