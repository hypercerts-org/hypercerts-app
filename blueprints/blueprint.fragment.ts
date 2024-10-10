import { ResultOf, graphql } from "@/lib/graphql";
import { HypercertFormValues } from "@/components/hypercert/hypercert-minting-form";

export const BlueprintFragment = graphql(`
  fragment BlueprintFragment on Blueprint {
    id
    created_at
    form_values
    minter_address
    minted
    admins {
      address
      display_name
      avatar
      chain_id
    }
  }
`);

export type BlueprintFragment = ResultOf<typeof BlueprintFragment> & {
  form_values: HypercertFormValues;
};
