import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { HyperboardFragment } from "./hyperboardFragment";
import request from "graphql-request";

const query = graphql(
  `
    query Collection($admin_address: String!) {
      hyperboards(where: { admin_id: { eq: $admin_address } }) {
        data {
          ...HyperboardFragment
        }
      }
    }
  `,
  [HyperboardFragment],
);

export async function getCollectionsByAdminAddress(adminAddress: string) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    admin_address: adminAddress,
  });

  const collectionsFragment = res.hyperboards?.data;
  if (!collectionsFragment) {
    return undefined;
  }

  return readFragment(HyperboardFragment, collectionsFragment);
}
