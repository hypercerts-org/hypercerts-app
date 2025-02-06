"server-only";
import { graphql, readFragment } from "@/lib/graphql";

import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import request from "graphql-request";
import { HypercertMetadataFragment } from "./fragments/hypercert-metadata.fragment";

const query = graphql(
  `
    query Metadata($hypercert_id: String!) {
      metadata(where: { hypercerts: { hypercert_id: { eq: $hypercert_id } } }) {
        data {
          ...HypercertMetadataFragment
        }
      }
    }
  `,
  [HypercertMetadataFragment],
);

export async function getHypercertMetadata(hypercertId: string) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    hypercert_id: hypercertId,
  });

  if (!res.metadata?.data) {
    return undefined;
  }

  const processedFragments = res.metadata.data[0];

  return {
    data: readFragment(HypercertMetadataFragment, processedFragments),
  };
}
