import {
  parseClaimOrFractionId,
  TransferRestrictions,
} from "@hypercerts-org/sdk";
import { getAddress } from "viem";
import { useReadContract } from "wagmi";

export const useReadTransferRestrictions = (hypercertId: string) => {
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

  return transferRestrictions;
};
