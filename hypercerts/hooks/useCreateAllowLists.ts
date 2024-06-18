import { useMutation, useQuery } from "@tanstack/react-query";

import { AllowlistEntry } from "@hypercerts-org/sdk";
import { HYPERCERTS_API_URL_REST } from "../../configs/hypercerts";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export const useCreateAllowList = () => {
  return useMutation({
    mutationFn: ({
      allowList,
      totalUnits,
    }: {
      allowList: AllowlistEntry[];
      totalUnits: bigint;
    }) => {
      const values = allowList.map((entry) => [
        entry.address,
        entry.units.toString(),
      ]);
      const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

      console.log("tree", tree.dump());
      return fetch(`${HYPERCERTS_API_URL_REST}/allowlists`, {
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        method: "POST",
        body: JSON.stringify({
          allowList: JSON.stringify(tree.dump()),
          totalUnits: totalUnits.toString(),
        }),
      });
    },
  });
};
