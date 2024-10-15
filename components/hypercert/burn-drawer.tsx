"use client";

import "@yaireo/tagify/dist/tagify.css"; // Tagify CSS
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "../ui/button";
import { Drawer } from "vaul";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { cn, generateBlockExplorerLink } from "@/lib/utils";
import { errorHasMessage } from "@/lib/errorHasMessage";
import { errorHasReason } from "@/lib/errorHasReason";
import { isChainIdSupported } from "@/lib/isChainIdSupported";
import { useAccount } from "wagmi";
import { useToast } from "../ui/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const transferForm = z.object({
  fractionId: z.string(),
});

export type BurnFormValues = z.infer<typeof transferForm>;

export function BurnDrawer({ hypercert }: { hypercert: HypercertFull }) {
  const { chainId, chain } = useAccount();
  const { toast } = useToast();
  const { client } = useHypercertClient();
  const { address } = useAccount();
  const [fractionIdToBurn, setFractionIdToBurn] = useState<string>("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Global state
  const ownedFractions = address
    ? hypercert.fractions?.data?.filter(
        (fraction) =>
          getAddress(fraction.owner_address || "") === getAddress(address),
      )
    : [];

  // Local state
  const form = useForm<BurnFormValues>({
    resolver: zodResolver(transferForm),
    defaultValues: {
      fractionId: "",
    },
  });
  const {
    formState: { errors },
  } = form;

  const [isBurning, setIsBurning] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  const handleSelectFraction = (fractionId: string) => {
    setFractionIdToBurn(fractionId);
  };

  const handleBurnClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmBurn = () => {
    setIsConfirmDialogOpen(false);
    burn();
  };

  const errorToast = (message: string | undefined) => {
    toast({
      title: message,
      variant: "destructive",
      duration: 2000,
    });
  };

  const burn = async () => {
    if (!client || !chainId || !hypercert.contract?.contract_address) {
      return;
    }
    setIsBurning(true);
    try {
      if (!fractionIdToBurn) {
        throw new Error("Recipient and fraction to transfer are required");
      }

      const tokenIdFromFraction = fractionIdToBurn.split("-")[2];

      const hash = await client.burnFraction({
        fractionId: BigInt(tokenIdFromFraction),
      });

      setTxHash(hash);
    } catch (e) {
      if (errorHasReason(e)) {
        errorToast(e.reason);
      } else if (errorHasMessage(e)) {
        errorToast(e.message);
      } else {
        errorToast("An error occurred while trying to burn the fraction.");
      }
      console.error(e);
    }
    setIsBurning(false);
  };

  const ConfirmationDialog = () => (
    <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-medium tracking-tight">
            Confirm burn action
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to burn this fraction? This action is
            irreversible and will permanently destroy the fraction.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsConfirmDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmBurn}>
            Burn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (!isChainIdSupported(chainId)) {
    return (
      <div>Please connect to a supported chain to execute transactions.</div>
    );
  }

  if (txHash) {
    const url = generateBlockExplorerLink(chain, txHash);
    return (
      <>
        <Drawer.Title className="font-serif text-3xl font-medium tracking-tight">
          Burn hypercert
        </Drawer.Title>
        <p>Your fraction is being burned!</p>
        <a
          href={url}
          title={url}
          target="_blank"
          rel="norefferer"
          className="flex items-center group text-blue-600 px-2 py-1 bg-blue-50 hover:bg-blue-100 w-max rounded-lg text-sm font-medium"
        >
          <span>
            {txHash.slice(0, 6)}...{txHash.slice(-4)}
          </span>
          <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200" />
        </a>
        <p>
          Burns will not be immediately visible on the hypercerts page but will
          be visible in 5-10 minutes.
        </p>
      </>
    );
  }

  // At least one of the sections must be evaluated, and if any section is invalid,
  // a comment is required.
  let isDisabled = !fractionIdToBurn;

  return (
    <>
      <Drawer.Title className="font-serif text-3xl font-medium tracking-tight">
        Burn an hypercert fraction
      </Drawer.Title>

      <p>Select the fraction you want to burn.</p>

      <div className="flex flex-col items-start w-full">
        <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
          Fraction info
        </h5>
        <Form {...form}>
          <form
            onSubmit={() => {
              console.log("submit");
            }}
          >
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
                            fractionIdToBurn?.split("-")[2] || "Select fraction"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {ownedFractions?.map((fraction) => (
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
                    {/*<Input {...field} disabled />*/}
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    The fraction ID of the hypercert fraction you want to burn.
                  </FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      <div className="flex gap-5 justify-center w-full">
        <Drawer.Close asChild>
          <Button variant="outline" className="w-1/2">
            Cancel
          </Button>
        </Drawer.Close>
        <Button
          variant="destructive"
          disabled={isDisabled}
          onClick={handleBurnClick}
          className={cn("w-1/2", {
            "opacity-50 cursor-not-allowed": isDisabled,
          })}
        >
          {isBurning && <LoaderCircle className="h-4 w-4 animate-spin mr-1" />}
          {isBurning ? "Burning fraction" : "Burn fraction"}
        </Button>
      </div>

      <ConfirmationDialog />
    </>
  );
}
