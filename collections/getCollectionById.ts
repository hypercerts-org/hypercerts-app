import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { HyperboardFragment } from "@/collections/hyperboard.fragment";
import request from "graphql-request";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";

const query = graphql(
  `
    query Hyperboard($id: UUID!) {
      hyperboards(where: { id: { eq: $id } }) {
        data {
          ...HyperboardFragment
        }
      }
    }
  `,
  [HyperboardFragment],
);

export async function getCollectionById(collectionId: string) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    id: collectionId,
  });

  const hyperboardFragment = res.hyperboards?.data?.[0];
  if (!hyperboardFragment) {
    return undefined;
  }

  return readFragment(HyperboardFragment, hyperboardFragment);
}
