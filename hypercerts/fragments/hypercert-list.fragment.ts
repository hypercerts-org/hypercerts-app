import { graphql } from "@/lib/graphql";

export const HypercertListFragment = graphql(`
  fragment HypercertListFragment on Hypercert {
    metadata {
      name
    }
    attestations {
      count
    }
    block_number
    hypercert_id
    contract {
      chain_id
    }
  }
`);
