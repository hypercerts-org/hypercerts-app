"use client";

import {
  parseClaimOrFractionId,
  TransferRestrictions,
} from "@hypercerts-org/sdk";
import { getAddress } from "viem";
import { useReadContract } from "wagmi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export default function TransferRestrictionsLabel({
  hypercertId,
  showSeparator = false,
}: {
  hypercertId: string;
  showSeparator?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { contractAddress, id } = parseClaimOrFractionId(hypercertId);
  const { data: transferRestrictions } = useReadContract({
    abi: [
      {
        inputs: [{ internalType: "uint256", name: "tokenID", type: "uint256" }],
        name: "readTransferRestriction",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    address: getAddress(contractAddress || ""),
    functionName: "readTransferRestriction",
    args: [id],
    query: {
      enabled: !!contractAddress && !!id,
      select: (data) => {
        if (data === "AllowAll") {
          return TransferRestrictions.AllowAll;
        } else if (data === "DisallowAll") {
          return TransferRestrictions.DisallowAll;
        } else if (data === "FromCreatorOnly") {
          return TransferRestrictions.FromCreatorOnly;
        }
      },
    },
  });
  if (transferRestrictions === undefined) return null;
  return (
    <>
      {showSeparator && <span className="text-slate-400">•</span>}
      <div className="flex items-center gap-2 content-center px-1 py-0.5 bg-slate-100 rounded-md w-max text-sm">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <span
              className="cursor-help"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              {getTransferRestrictionsText(transferRestrictions)}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" side="top">
            <p className="text-sm text-slate-700">
              {getTransferRestrictionsLabel(transferRestrictions)}
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}

export const getTransferRestrictionsText = (
  transferRestrictions: TransferRestrictions,
) => {
  switch (transferRestrictions) {
    case TransferRestrictions.AllowAll:
      return "Transferable";
    case TransferRestrictions.DisallowAll:
      return "Not transferable";
    case TransferRestrictions.FromCreatorOnly:
      return "Transferable-once";
  }
};

export const getTransferRestrictionsLabel = (
  transferRestrictions: TransferRestrictions,
) => {
  switch (transferRestrictions) {
    case TransferRestrictions.AllowAll:
      return "Fractions can be transferred without limitations.";
    case TransferRestrictions.DisallowAll:
      return "Fractions can not be transferred";
    case TransferRestrictions.FromCreatorOnly:
      return "Fractions can be transferred once from the creator to another user.";
  }
};
