"use client";

import "@yaireo/tagify/dist/tagify.css";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { errorHasMessage } from "@/lib/errorHasMessage";
import { errorHasReason } from "@/lib/errorHasReason";
import { isChainIdSupported } from "@/lib/isChainIdSupported";
import { useAccount } from "wagmi";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { getAddress } from "viem";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedUnits } from "@/components/formatted-units";
import { HypercertState } from "@/hypercerts/fragments/hypercert-state.fragment";
import { TransactionStatus } from "../global/transaction-status";
import { revalidatePathServerAction } from "@/app/actions/revalidatePathServerAction";
import { errorToast } from "@/lib/errorToast";

function QuickAddButtons({
  totalUnits,
  remainingUnits,
  onAdd,
}: {
  totalUnits: bigint;
  remainingUnits: bigint;
  onAdd: (units: string) => void;
}) {
  const addPercentage = (percentage: number) => {
    const units = (totalUnits * BigInt(percentage)) / BigInt(100);
    onAdd(units.toString());
  };

  const isPossibleToAddPercentage = (percentage: number) => {
    const units = (totalUnits * BigInt(percentage)) / BigInt(100);
    return units <= remainingUnits;
  };

  return (
    <div className="flex flex-col">
      <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
        ADD FRACTION
      </h5>
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!isPossibleToAddPercentage(25)}
          onClick={() => addPercentage(25)}
        >
          <Plus className="h-4 w-4 mr-2" />
          25%
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!isPossibleToAddPercentage(50)}
          onClick={() => addPercentage(50)}
        >
          <Plus className="h-4 w-4 mr-2" />
          50%
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!isPossibleToAddPercentage(75)}
          onClick={() => addPercentage(75)}
        >
          <Plus className="h-4 w-4 mr-2" />
          75%
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addPercentage(0)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Custom
        </Button>
      </div>
    </div>
  );
}

const splitForm = z.object({
  fractionId: z.string(),
  splits: z
    .array(
      z.object({
        units: z.string().refine(
          (value) => {
            const num = BigInt(value);
            return num && num > 0;
          },
          {
            message: "Must be a positive integer",
          },
        ),
      }),
    )
    .max(15, "Maximum 15 splits allowed"),
});

export type SplitCreateFormValues = z.infer<typeof splitForm>;

export function SplitDrawer({ hypercert }: { hypercert: HypercertState }) {
  const { chainId, address } = useAccount();
  const { client } = useHypercertClient();
  const [fractionIdToSplit, setFractionIdToSplit] = useState<string>("");
  const [isSplitting, setIsSplitting] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  const ownedFractions = address
    ? hypercert.fractions?.data?.filter(
        (fraction) =>
          getAddress(fraction.owner_address || "") === getAddress(address),
      )
    : [];

  const form = useForm<SplitCreateFormValues>({
    resolver: zodResolver(splitForm),
    defaultValues: {
      fractionId: "",
      splits: [{ units: "" }], // Start with only one split (Remaining Units)
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "splits",
  });

  const watchSplits = form.watch("splits");
  const selectedFraction = ownedFractions?.find(
    (fraction) => fraction.fraction_id === fractionIdToSplit,
  );
  const totalUnits =
    selectedFraction && selectedFraction.units
      ? BigInt(selectedFraction.units)
      : BigInt(0);

  const allocatedUnits = watchSplits
    .slice(1)
    .reduce((sum, split) => sum + BigInt(split.units || 0), BigInt(0));
  const remainingUnits = totalUnits - allocatedUnits;

  useEffect(() => {
    // Update the first split with the remaining units
    form.setValue("splits.0.units", remainingUnits.toString());
  }, [allocatedUnits, totalUnits, form]);

  useEffect(() => {
    if (ownedFractions && ownedFractions.length === 1) {
      setFractionIdToSplit(ownedFractions[0].fraction_id!);
      form.setValue("fractionId", ownedFractions[0].fraction_id!);
    }
  }, [ownedFractions, form]);

  const handleSelectFraction = (fractionId: string) => {
    setFractionIdToSplit(fractionId);
    form.setValue("fractionId", fractionId);
  };

  const split = async (values: SplitCreateFormValues) => {
    if (!client || !chainId || !hypercert.contract?.contract_address) {
      return;
    }
    setIsSplitting(true);
    try {
      if (!fractionIdToSplit) {
        throw new Error("Fraction to split is required");
      }

      const tokenIdFromFraction = fractionIdToSplit.split("-")[2];
      const fractionUnitsAsBigInt = values.splits.map((split) =>
        BigInt(split.units),
      );

      const hash = await client.splitFraction({
        fractionId: BigInt(tokenIdFromFraction),
        fractions: fractionUnitsAsBigInt,
      });

      if (!hash) {
        throw new Error("Failed to split fraction");
      }

      setTxHash(hash as `0x${string}`);
    } catch (e) {
      if (errorHasReason(e)) {
        errorToast(e.reason);
      } else if (errorHasMessage(e)) {
        errorToast(e.message);
      } else {
        errorToast("An error occurred while splitting the fraction.");
      }
      console.error(e);
      setIsSplitting(false);
    }
  };

  if (!isChainIdSupported(chainId)) {
    return <div>Please connect to a supported chain to split.</div>;
  }

  const isDisabled =
    !fractionIdToSplit ||
    allocatedUnits === BigInt(0) ||
    allocatedUnits > totalUnits ||
    isSplitting;

  const renderTotalUnits = () => {
    if (selectedFraction) {
      return (
        <div>
          <h5 className="text-sm">Total units </h5>
          <span className="text-sm text-slate-500">
            {formatBigInt(totalUnits)} units
          </span>
        </div>
      );
    }
    return null;
  };

  const renderFractionSelection = () => {
    if (!ownedFractions || ownedFractions.length === 0) {
      return <p>You don&apos;t own any fractions of this hypercert.</p>;
    }

    if (ownedFractions.length === 1) {
      const fraction = ownedFractions[0];
      return (
        <FormItem>
          <FormLabel>Fraction ID</FormLabel>
          <FormControl>
            <Input value={`${fraction.fraction_id?.split("-")[2]}`} disabled />
          </FormControl>
          <FormDescription>
            This is the only fraction you own of this hypercert.
          </FormDescription>
        </FormItem>
      );
    }

    return (
      <FormField
        control={form.control}
        name="fractionId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fraction ID</FormLabel>
            <FormControl>
              <Select {...field} onValueChange={handleSelectFraction}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      fractionIdToSplit?.split("-")[2] || "Select fraction"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {ownedFractions.map((fraction) => (
                    <SelectItem
                      key={fraction.fraction_id}
                      value={fraction.fraction_id!}
                    >
                      {`${fraction.fraction_id?.split("-")[2]} - `}
                      <FormattedUnits>{fraction.units}</FormattedUnits>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
            <FormDescription>
              Select the fraction you want to split.
            </FormDescription>
          </FormItem>
        )}
      />
    );
  };

  const formatBigInt = (value: bigint) => {
    if (value === BigInt(0)) return "0";
    const stringValue = value.toString();
    if (stringValue.length <= 6) return stringValue;
    const exponent = stringValue.length - 1;
    const mantissa = stringValue[0] + "." + stringValue.slice(1, 4);
    return `${mantissa}e${exponent}`;
  };

  return (
    <>
      <Drawer.Title className="font-serif text-3xl font-medium tracking-tight">
        Split a hypercert fraction
      </Drawer.Title>

      <p>
        Select the fraction you want to split and specify the new distributions.
      </p>

      <div className="flex flex-col items-start w-full">
        <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          Fraction info
        </h5>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(split)}
            className="space-y-4 w-full"
          >
            {renderFractionSelection()}
            {renderTotalUnits()}
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end space-x-2">
                <FormField
                  control={form.control}
                  name={`splits.${index}.units`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        {index === 0 ? (
                          <p>
                            Fraction 1{" "}
                            <span className="text-slate-500">
                              (units remaining)
                            </span>
                          </p>
                        ) : (
                          <p>Fraction {index + 1} </p>
                        )}
                      </FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              index === 0 ? "Remaining units" : "e.g. 100000000"
                            }
                            disabled={index === 0}
                            onChange={(e) => {
                              if (index !== 0) {
                                const value = e.target.value.toLowerCase();
                                if (
                                  value === "" ||
                                  /^(\d+(\.\d*)?|\.\d+)(e\d+)?$/.test(value)
                                ) {
                                  field.onChange(value);
                                }
                              }
                            }}
                          />
                        </FormControl>
                        {index !== 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => remove(index)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <div className="flex items-center space-x-2 mt-4">
              <QuickAddButtons
                totalUnits={totalUnits}
                remainingUnits={remainingUnits}
                onAdd={(units) => {
                  if (fields.length < 15) {
                    append({ units });
                  }
                }}
              />
            </div>

            <div className="flex gap-5 justify-center w-full mt-4">
              <Drawer.Close asChild>
                <Button variant="outline" className="w-1/2">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                type="submit"
                disabled={isDisabled}
                className={cn("w-1/2", {
                  "opacity-50 cursor-not-allowed": isDisabled,
                })}
              >
                {isSplitting && (
                  <LoaderCircle className="h-4 w-4 animate-spin mr-1" />
                )}
                {isSplitting ? "Splitting fraction" : "Split fraction"}
              </Button>
            </div>
          </form>
        </Form>
        {txHash && (
          <TransactionStatus
            txHash={txHash as `0x${string}`}
            onCompleted={() => {
              setTxHash("");
              setIsSplitting(false);
              revalidatePathServerAction([
                `/hypercert/${hypercert.hypercert_id}`,
              ]);
            }}
          />
        )}
      </div>
    </>
  );
}
