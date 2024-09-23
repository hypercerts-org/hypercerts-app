import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { HyperboardFragment } from "./hyperboard.fragment";
import request from "graphql-request";
import { COLLECTIONS_PER_PAGE } from "@/configs/ui";

const query = graphql(
  `
    query Collection($admin_address: String!, $first: Int, $offset: Int) {
      hyperboards(
        where: { admin_id: { eq: $admin_address } }
        first: $first
        offset: $offset
      ) {
        count
        data {
          ...HyperboardFragment
        }
      }
    }
  `,
  [HyperboardFragment],
);

export async function getCollectionsByAdminAddress({
  adminAddress,
  first = COLLECTIONS_PER_PAGE,
  offset = 0,
}: {
  adminAddress: string;
  first?: number;
  offset?: number;
}) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    admin_address: adminAddress,
    first,
    offset,
  });

  const collectionsFragment = res.hyperboards?.data;
  const count = res.hyperboards?.count;
  if (!collectionsFragment) {
    return undefined;
  }

  return {
    count,
    hyperboards: readFragment(HyperboardFragment, collectionsFragment),
  };
}
