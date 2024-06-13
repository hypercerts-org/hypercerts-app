import { ResultOf, graphql } from "@/lib/graphql";

export const HypercertFullFragment = graphql(`
  fragment HypercertFullFragment on Hypercert {
    metadata {
      name
      description
      external_url
      work_scope
      work_timeframe_from
      work_timeframe_to
      contributors
    }
    block_number
    hypercert_id
    contract {
      chain_id
      contract_address
    }
    owner_address
    units
    attestations {
      data {
        data
        uid
        block_timestamp
        attester
      }
    }
    fractions {
      data {
        units
        owner_address
        hypercert_id
      }
    }
    token_id
  }
`);
export type HypercertFull = ResultOf<typeof HypercertFullFragment>;
