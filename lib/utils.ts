import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TransferRestrictions } from "@hypercerts-org/sdk";
import { Chain } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateEthereumAddress = (
  address: `0x${string}`,
  length = 4,
): string => {
  if (!address) {
    return "";
  }
  if (address.length <= 2 + length * 2) {
    return address;
  }
  return `${address.substring(0, length + 2)}...${address.substring(
    address.length - length,
  )}`;
};

export const formatDate = (date: string, locale?: string) => {
  if (!date) {
    return null;
  }
  return new Intl.DateTimeFormat(locale ?? "en-US", {
    dateStyle: "medium",
  }).format(new Date(date));
};

export const formatTransferRestriction = (
  transferRestriction: TransferRestrictions,
) => {
  switch (transferRestriction) {
    case TransferRestrictions.AllowAll:
      return "Allow all";
    case TransferRestrictions.DisallowAll:
      return "Disallow all";
    case TransferRestrictions.FromCreatorOnly:
      return "From creator only";
  }
};

export const generateBlockExplorerLink = (
  chain: Chain | undefined,
  transactionHash: string,
) => {
  if (!chain) {
    return "";
  }
  return `https://${chain?.id === 1 ? "" : `${chain?.name}.`}etherscan.io/tx/${transactionHash}`;
};
