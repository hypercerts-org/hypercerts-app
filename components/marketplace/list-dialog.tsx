import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { Button } from "../ui/button";
import { FormattedUnits } from "../formatted-units";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { ListAskedPrice } from "./list-asked-price";
import ListDialogSettingsForm from "./list-dialog-settings-form";
import ListFractionSelect from "./list-fraction-select";
import { LoaderCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useCreateFractionalMakerAsk } from "@/marketplace/hooks";
import { useState } from "react";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import { toast } from "@/components/ui/use-toast";
import { getCurrencyByAddress } from "@/marketplace/utils";
import { HypercertExchangeClient } from "@hypercerts-org/marketplace-sdk";

type State = {
  fractionId: string;
  price: string;
  currency: string;
  unitsForSale?: string;
  unitsMinPerOrder?: string;
  unitsMaxPerOrder?: string;
  formIsValid: boolean;
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

  const units = BigInt(hypercert.units || "0");
  const fractions = hypercert.fractions?.data || [];
  const fractionsOwnedByUser = fractions.filter(
    (fraction) => fraction.owner_address === address,
  );

  const [state, setState] = useState<State>({
    fractionId: fractions.length === 1 ? fractions[0].fraction_id || "" : "",
    price: "",
    currency: Object.values(client.currencies)[0].address,
    unitsForSale: fractions.length === 1 ? fractions[0].units || "" : "",
    unitsMinPerOrder: "1",
    unitsMaxPerOrder: fractions.length === 1 ? fractions[0].units || "" : "",
    formIsValid: true,
  });

  const selectedFraction = fractions.find(
    (fraction) => fraction.fraction_id === state.fractionId,
  );

  const floatPrice = Number.parseFloat(state.price);

  const isPriceValid =
    state.price !== undefined &&
    !isNaN(floatPrice) &&
    state.currency !== undefined;

  const createButtonEnabled = isPriceValid && state.formIsValid;

  const handleListButtonClick = async () => {
    if (
      !createFractionalMakerAsk ||
      !isPriceValid ||
      !state.formIsValid ||
      !state.fractionId ||
      !state.unitsMinPerOrder ||
      !state.unitsForSale
    ) {
      return;
    }

    try {
      await createFractionalMakerAsk({
        fractionId: state.fractionId,
        minUnitAmount: state.unitsMinPerOrder,
        maxUnitAmount: state.unitsMaxPerOrder || state.unitsForSale,
        minUnitsToKeep: (units - BigInt(state.unitsForSale)).toString(),
        price: state.price,
        sellLeftoverFraction: false,
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

  return (
    <DialogContent className="gap-5 max-w-2xl">
      <DialogHeader>
        <div className="bg-yellow-500/10 p-3 mb-2 rounded-sm">
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
        <h5 className="uppercase text-sm text-gray-500 font-medium tracking-wider">
          ASKED SHARE PRICE
        </h5>
        <ListAskedPrice
          price={state.price}
          currency={state.currency}
          setPrice={(price) => setState({ ...state, price })}
          setCurrency={(currency) => setState({ ...state, currency })}
        />
        {selectedFraction && isPriceValid && (
          <div className="text-sm text-gray-500">
            Creating this listing will offer{" "}
            <b>
              <FormattedUnits>{state.unitsForSale}</FormattedUnits>
            </b>{" "}
            units for sale at a total price of{" "}
            <b>
              {floatPrice} {getCurrencyByAddress(state.currency)?.symbol}
            </b>
            .
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="data-[state=open]:border-0">
            <AccordionTrigger className="uppercase text-sm text-gray-500 font-medium tracking-wider">
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
        <Button
          disabled={!createButtonEnabled}
          className="w-full"
          onClick={handleListButtonClick}
        >
          {isPending && <LoaderCircle className="h-4 w-4 animate-spin mr-1" />}
          {isPending ? "Creating listing" : "Create listing"}
        </Button>
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
