import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { HypercertStateFragment } from "./fragments/hypercert-state.fragment";
import request from "graphql-request";
import { getAddress, isAddress } from "viem";

const query = graphql(
  `
    query Hypercert($hypercert_id: String) {
      hypercerts(where: { hypercert_id: { eq: $hypercert_id } }) {
        data {
          ...HypercertStateFragment
        }
      }
    }
  `,
  [HypercertStateFragment],
);

export async function getHypercertState(hypercertId: string) {
  const [chainId, contractAddress, tokenId] = hypercertId.split("-");

  if (!chainId || !contractAddress || !tokenId) {
    console.error("Invalid hypercertId");
    return undefined;
  }

  const _contractAddress = getAddress(contractAddress);

  // TODO: Throw error?
  if (!isAddress(_contractAddress)) {
    console.error("Invalid address");
    return undefined;
  }

  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    hypercert_id: `${chainId}-${_contractAddress}-${tokenId}`,
  });

  const hypercertStateFragment = res.hypercerts?.data?.[0];
  if (!hypercertStateFragment) {
    return undefined;
  }

  return readFragment(HypercertStateFragment, hypercertStateFragment);
}
