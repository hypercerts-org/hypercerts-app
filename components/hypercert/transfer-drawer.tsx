"use client";

import "@yaireo/tagify/dist/tagify.css"; // Tagify CSS
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { errorHasMessage } from "@/lib/errorHasMessage";
import { errorHasReason } from "@/lib/errorHasReason";
import { isChainIdSupported } from "@/lib/isChainIdSupported";
import { useAccount } from "wagmi";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { getAddress, isAddress } from "viem";
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
import { useForm } from "react-hook-form";
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

const transferForm = z.object({
  fractionId: z.string().optional(),
  recipient: z
    .string()
    .trim()
    .min(1, "Recipient is required")
    .refine((value) => isAddress(value), {
      message: "Invalid address",
    }),
});

export type TransferCreateFormValues = z.infer<typeof transferForm>;

export function TransferDrawer({ hypercert }: { hypercert: HypercertState }) {
  const { chainId, address } = useAccount();
  const { client } = useHypercertClient();
  const [fractionIdToTransfer, setFractionIdToTransfer] = useState<string>("");

  // Global state
  const ownedFractions = address
    ? hypercert.fractions?.data?.filter(
        (fraction) =>
          getAddress(fraction.owner_address || "") === getAddress(address),
      )
    : [];

  // Local state
  const form = useForm<TransferCreateFormValues>({
    resolver: zodResolver(transferForm),
    defaultValues: {
      fractionId: "",
    },
  });
  const {
    formState: { errors },
  } = form;

  const [isTransferring, setIsTransferring] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  const recipient = form.watch("recipient");

  useEffect(() => {
    if (ownedFractions && ownedFractions.length === 1) {
      setFractionIdToTransfer(ownedFractions[0].fraction_id!);
      form.setValue("fractionId", ownedFractions[0].fraction_id!);
    }
  }, [ownedFractions, form]);

  const handleSelectFraction = (fractionId: string) => {
    setFractionIdToTransfer(fractionId);
  };

  const transfer = async () => {
    if (!client || !chainId || !hypercert.contract?.contract_address) {
      return;
    }
    setIsTransferring(true);
    try {
      if (!recipient || !fractionIdToTransfer) {
        throw new Error("Recipient and fraction to transfer are required");
      }

      const tokenIdFromFraction = fractionIdToTransfer.split("-")[2];

      const hash = await client.transferFraction({
        fractionId: BigInt(tokenIdFromFraction),
        to: getAddress(recipient) as `0x${string}`,
      });

      setTxHash(hash as `0x${string}`);
    } catch (e) {
      if (errorHasReason(e)) {
        errorToast(e.reason);
      } else if (errorHasMessage(e)) {
        errorToast(e.message);
      } else {
        errorToast("An error occurred while transferring the fraction.");
      }
      console.error(e);
      setIsTransferring(false);
    }
  };

  if (!isChainIdSupported(chainId)) {
    return <div>Please connect to a supported chain to transfer.</div>;
  }

  let isDisabled = !fractionIdToTransfer || !recipient || isTransferring;

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
            <Input
              value={`${fraction.fraction_id?.split("-")[2]} - ${fraction.units} units`}
              disabled
            />
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
                      fractionIdToTransfer?.split("-")[2] || "Select fraction"
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
              Select the fraction you want to transfer.
            </FormDescription>
          </FormItem>
        )}
      />
    );
  };

  return (
    <>
      <Drawer.Title className="font-serif text-3xl font-medium tracking-tight">
        Transfer a hypercert fraction
      </Drawer.Title>

      <p>Select the fraction you want to transfer and the recipient address.</p>

      <div className="flex flex-col items-start w-full">
        <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          Fraction info
        </h5>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(transfer)}>
            {renderFractionSelection()}
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    The address of the recipient of the fraction.
                  </FormDescription>
                </FormItem>
              )}
            />
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
                {isTransferring && (
                  <LoaderCircle className="h-4 w-4 animate-spin mr-1" />
                )}
                {isTransferring ? "Transferring fraction" : "Transfer fraction"}
              </Button>
            </div>
          </form>
        </Form>
        {txHash && (
          <TransactionStatus
            txHash={txHash as `0x${string}`}
            onCompleted={() => {
              setTxHash("");
              setIsTransferring(false);
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
