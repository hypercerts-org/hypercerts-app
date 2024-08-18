import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { CollectionFragment } from "./collection.fragment";
import request from "graphql-request";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";

const query = graphql(
  `
    query Collection($id: UUID!) {
      collections(where: { id: { eq: $id } }) {
        data {
          ...CollectionFragment
        }
      }
    }
  `,
  [CollectionFragment],
);

export async function getCollectionById(collectionId: string) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    id: collectionId,
  });

  const collectionsFragment = res.collections?.data?.[0];
  if (!collectionsFragment) {
    return undefined;
  }

  return readFragment(CollectionFragment, collectionsFragment);
}
