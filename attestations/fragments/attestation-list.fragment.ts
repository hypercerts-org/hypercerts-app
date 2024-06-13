import { graphql } from "@/lib/graphql";

export const AttestationListFragment = graphql(`
  fragment AttestationListFragment on Attestation {
    id
    attester
    block_timestamp
    data
  }
`);
