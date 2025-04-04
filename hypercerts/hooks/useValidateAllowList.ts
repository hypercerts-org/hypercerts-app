import { useMutation } from "@tanstack/react-query";

import { AllowlistEntry } from "@hypercerts-org/sdk";
import { HYPERCERTS_API_URL_REST } from "@/configs/hypercerts";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export const useValidateAllowList = () => {
  return useMutation({
    mutationFn: async ({
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
      const res = await fetch(
        `${HYPERCERTS_API_URL_REST}/allowlists/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            allowList: JSON.stringify(tree.dump()),
            totalUnits: totalUnits.toString(),
          }),
        },
      );
      const jsonRes = await res.json();
      if (!res.ok || !(res.status === 200 || res.status === 201)) {
        console.error("Errors: ", jsonRes.errors);
        throw new Error("Failed to validate allowlist");
      }
      return {
        ...jsonRes,
        values: allowList,
      };
    },
  });
};
