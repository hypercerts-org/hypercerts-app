import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { AttestationListFragment } from "./fragments/attestation-list.fragment";
import { HYPERCERTS_API_URL } from "../configs/hypercerts";
import request from "graphql-request";

const query = graphql(
  `
    query Attestations(
      $chainId: BigInt!
      $contractAddress: String!
      $tokenId: String!
    ) {
      attestations(
        where: {
          chain_id: { eq: $chainId }
          contract_address: { eq: $contractAddress }
          token_id: { eq: $tokenId }
        }
      ) {
        count
        data {
          ...AttestationListFragment
        }
      }
    }
  `,
  [AttestationListFragment]
);

export async function getHypercertAttestations(hypercertId: string) {
  const idParts = hypercertId.split("-");
  const chainId = idParts[0];
  const contractAddress = idParts[1];
  const tokenId = idParts[2];

  const res = await request(HYPERCERTS_API_URL, query, {
    chainId: chainId,
    contractAddress: contractAddress,
    tokenId: tokenId,
  });
  const attestations = res.attestations?.data?.[0];

  if (!attestations) {
    return undefined;
  }

  // TODO: Throw error?
  if (!res.attestations?.data) {
    return undefined;
  }

  const processedFragments = res.attestations.data.map((attestation) => {
    return readFragment(AttestationListFragment, attestation);
  });

  return {
    count: res.attestations.count,
    data: processedFragments,
  };
}
