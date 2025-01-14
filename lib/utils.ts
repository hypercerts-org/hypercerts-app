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

export const truncateCID = (cid: string, length = 4): string => {
  if (!cid) {
    return "";
  }
  if (cid.length <= length * 2) {
    return cid;
  }
  return `${cid.substring(0, length)}...${cid.substring(cid.length - length)}`;
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
  return `${getBlockExplorerPath(chain)}/tx/${transactionHash}`;
};

export const getBlockExplorerPath = (chain: Chain | undefined) => {
  if (!chain) {
    return "";
  }
  // by default, we use the default block explorer
  switch (chain.id) {
    case 1: // Ethereum Mainnet
      return "https://etherscan.io";
    case 10: // Optimism Mainnet
      return "https://optimistic.etherscan.io";
    case 8453: // Base Mainnet
      return "https://basescan.org";
    case 42220: // Celo Mainnet
      return "https://celoscan.io";
    case 42161: // Arbitrum Mainnet
      return "https://arbiscan.io";
    default:
      return `${chain.blockExplorers?.default.url}`;
  }
};

export const containsMarkdown = (text: string): boolean => {
  // Regular expressions to match common Markdown patterns
  const patterns = [
    /[*_]{1,2}[^*_\n]+[*_]{1,2}/, // Bold or italic
    /#{1,6}\s.+/, // Headers
    /\[.+\]\(.+\)/, // Links
    /```[\s\S]*?```/, // Code blocks
    /^\s*[-*+]\s/, // Unordered lists
    /^\s*\d+\.\s/, // Ordered lists
    /\|.+\|.+\|/, // Tables
    /^\s*>.+/, // Blockquotes
    /!\[.+\]\(.+\)/, // Images
  ];

  // Check if any pattern matches the text
  return patterns.some((pattern) => pattern.test(text));
};

export const hypercertIdRegex = /^\d+-0x[a-fA-F0-9]{39,42}-\d{39,42}$/;

export const isValidHypercertId = (hypercertId: string) => {
  return hypercertIdRegex.test(hypercertId);
};
