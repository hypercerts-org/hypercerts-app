import "server-only";

import { HYPERCERTS_API_URL } from "../configs/hypercerts";
import { graphql } from "@/lib/graphql";
import request from "graphql-request";

const query = graphql(
  `
    query Attestations($attester: String) {
      attestations(where: { attester: { eq: $attester } }) {
        count
      }
    }
  `
);

export async function getEvaluatorAttestationsCount(attester: string) {
  const res = await request(HYPERCERTS_API_URL, query, {
    attester: attester,
  });
  return res.attestations?.count;
}
