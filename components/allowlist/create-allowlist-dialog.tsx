"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderCircle, MinusCircle, PlusCircle } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { isAddress } from "viem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { errorHasMessage } from "@/lib/errorHasMessage";
import { cn } from "@/lib/utils";
import { AllowlistEntry } from "@hypercerts-org/sdk";

import { DEFAULT_NUM_UNITS } from "@/configs/hypercerts";
import { useValidateAllowList } from "@/hypercerts/hooks/useValidateAllowList";

type AllowListItem = {
  address?: string;
  percentage?: string;
};

const defaultValues = [
  {
    address: "",
    percentage: "",
  },
];

export default function Component({
  setAllowlistEntries,
  setAllowlistURL,
  allowlistURL,
  setOpen,
  open,
  initialValues,
}: {
  setAllowlistEntries: (allowlistEntries: AllowlistEntry[]) => void;
  setAllowlistURL: (allowlistURL: string) => void;
  allowlistURL: string | undefined;
  setOpen: (open: boolean) => void;
  initialValues?: AllowListItem[];
  open: boolean;
}) {
  const {
    mutate: validateAllowlist,
    data: validateAllowlistResponse,
    isPending,
    error: createAllowListError,
    reset,
  } = useValidateAllowList();
  const [allowList, setAllowList] = useState<AllowListItem[]>(
    initialValues?.length ? initialValues : defaultValues,
  );

  useEffect(() => {
    if (open && !allowList[0].address && !allowList[0].percentage) {
      if (initialValues && initialValues.length > 0) {
        setAllowList(initialValues);
      } else {
        setAllowList(defaultValues);
      }
    }
  }, [open]);

  useEffect(() => {
    if (validateAllowlistResponse?.success) {
      (async () => {
        const values = validateAllowlistResponse.values;
        setAllowlistEntries(values);
        reset();
        setOpen(false);
      })();
    }
  }, [validateAllowlistResponse, setAllowlistEntries, setOpen, reset]);

  const setAddress = (e: ChangeEvent<HTMLInputElement>, i: number) => {
    setAllowList((allowList) =>
      allowList.map((item, index) =>
        index === i
          ? {
              ...item,
              address: e.target.value,
            }
          : item,
      ),
    );
  };

  const setPercentage = (e: ChangeEvent<HTMLInputElement>, i: number) => {
    const value = e.target.value;
    // Allow numbers with up to two decimal places
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAllowList((allowList) =>
        allowList.map((item, index) =>
          index === i
            ? {
                ...item,
                percentage: value,
              }
            : item,
        ),
      );
    }
  };

  const isPercentageValid = (unit: string) => {
    const f = Number.parseFloat(unit);
    return !isNaN(f) && f >= 0 && f <= 100;
  };

  const removeItem = (i: number) => {
    if (allowList.length === 1) {
      return;
    }
    setAllowList((allowList) => allowList.filter((item, index) => index !== i));
  };

  const percentageSum = allowList.reduce(
    (acc, item) => acc + Number.parseFloat(item.percentage || "0"),
    0,
  );

  const allAddressesValid = allowList.every(
    (item) => item.address && isAddress(item.address),
  );

  const submitList = async () => {
    const totalUnits = DEFAULT_NUM_UNITS;
    try {
      const parsedAllowList = allowList.map((entry) => {
        if (
          !entry.address ||
          !isAddress(entry.address) ||
          !entry.percentage ||
          !isPercentageValid(entry.percentage)
        ) {
          throw new Error("Invalid allow list entry");
        }
        return {
          address: entry.address,
          units:
            (BigInt(Math.round(parseFloat(entry.percentage) * 1000000)) *
              totalUnits) /
            BigInt(100000000),
        };
      });
      if (!parsedAllowList) {
        throw new Error("Allow list is empty");
      }
      validateAllowlist({ allowList: parsedAllowList, totalUnits });
      setAllowlistURL("");
    } catch (e) {
      if (errorHasMessage(e)) {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: "Failed to upload allow list" });
      }
    }
  };

  const CreateAllowListErrorMessage = () => {
    if (createAllowListError) {
      if (errorHasMessage(createAllowListError)) {
        return (
          <div className="text-red-600 text-sm">
            {createAllowListError.message}
          </div>
        );
      }
      return (
        <div className="text-red-600 text-sm">
          Couldn&apos;t create allow list
        </div>
      );
    }
    if (validateAllowlistResponse && validateAllowlistResponse.status >= 400) {
      return (
        <div className="text-red-600 text-sm">Failed to create allow list</div>
      );
    }
    return null;
  };

  const percentageError =
    Math.abs(percentageSum - 100) > 0.01 &&
    allowList[0].percentage !== "" &&
    allowList[0].percentage !== undefined;

  const createButtonDisabled =
    allowList.length === 0 ||
    Math.abs(percentageSum - 100) > 0.01 ||
    !allAddressesValid;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-normal">
            Create allowlist
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex flex-col gap-3">
          <div>
            Add addresses and the percentage of total units each address is
            allowed to mint. Percentages can be specified up to two decimal
            places. Hypercerts are created with a total supply of 1 ether (10^18
            units).
          </div>
          <div>
            Once created, your allowlist will be stored on IPFS and linked to
            the Hypercert.
          </div>
        </DialogDescription>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-grow"></div>
            <div className="w-20 text-center">%</div>
            <div className="w-12"></div>
          </div>
          {allowList.map((item, i) => (
            <div key={i}>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="0x123"
                  value={item.address}
                  className={cn(
                    "flex-grow",
                    !isAddress(item.address || "") && "text-red-600",
                  )}
                  onChange={(e) => setAddress(e, i)}
                />
                <Input
                  type="text"
                  placeholder="100.00"
                  value={item.percentage}
                  className={cn(
                    "w-20 text-right",
                    !isPercentageValid(item.percentage || "") && "text-red-600",
                  )}
                  onChange={(e) => setPercentage(e, i)}
                />
                <Button variant="outline" onClick={() => removeItem(i)}>
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {percentageError && (
            <div className="text-red-600 text-sm">
              Sum of percentages must be 100.00
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setAllowList((allowList) => [
                  ...allowList,
                  {
                    address: "",
                    percentage: "",
                  },
                ])
              }
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {allowlistURL && (
          <p className="text-sm text-red-600">
            If you edit an original allowlist imported via URL, the original
            allowlist will be deleted.
          </p>
        )}
        <CreateAllowListErrorMessage />
        <div className="flex gap-2 justify-evenly w-full">
          <Button
            type="button"
            variant="secondary"
            className="flex-grow"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button
            className="flex-grow"
            disabled={createButtonDisabled}
            onClick={submitList}
          >
            {isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin mr-1" />
            )}
            {isPending ? "Creating" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
