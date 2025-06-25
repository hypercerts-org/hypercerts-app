import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { AttestationListFragment } from "./fragments/attestation-list.fragment";
import request from "graphql-request";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { Address, Hex } from "viem";

const query = graphql(
  `
    query AttestationsQuery(
      $first: Int
      $offset: Int
      $where: AttestationWhereInput
    ) {
      attestations(where: $where, first: $first, offset: $offset) {
        count
        data {
          ...AttestationListFragment
        }
      }
    }
  `,
  [AttestationListFragment],
);

export interface GetAttestationsParams {
  first?: number;
  offset?: number;
  filter?: {
    chainId?: bigint;
    contractAddress?: Address;
    tokenId?: bigint;
    schemaId?: Hex;
  };
}

export async function getAttestations({
  first,
  offset,
  filter,
}: GetAttestationsParams) {
  const where: Record<string, any> = {};

  // where: {hypercert: {token_id: {eq: 292983117918928017041965536998752430063616}}, eas_schema: {uid: {eq: "0x2f4f575d5df78ac52e8b124c4c900ec4c540f1d44f5b8825fac0af5308c91449"}, chain_id: {eq: 11155111}}}
  if (filter?.contractAddress) {
    where.contract_address = { eq: filter.contractAddress };
  }

  if (filter?.tokenId) {
    where.hypercert = { token_id: { eq: filter.tokenId } };
  }

  if (filter?.schemaId) {
    where.eas_schema = { uid: { eq: filter.schemaId } };
  }

  if (filter?.chainId) {
    where.eas_schema = {
      ...(where.eas_schema || {}),
      chain_id: { eq: Number(filter.chainId) },
    };
  }

  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    first,
    offset,
    where,
  });

  if (!res.attestations?.data || !res.attestations?.count) {
    return {
      count: 0,
      data: [],
    };
  }

  return {
    count: res.attestations.count,
    data: res.attestations.data.map((attestation) =>
      readFragment(AttestationListFragment, attestation),
    ),
  };
}
