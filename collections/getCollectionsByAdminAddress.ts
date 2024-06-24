import "server-only";

import { graphql, readFragment } from "@/lib/graphql";

import { HYPERCERTS_API_URL } from "@/configs/hypercerts";
import { CollectionFragment } from "./collection.fragment";
import request from "graphql-request";

const query = graphql(
  `
    query Collection($admin_address: String!) {
      collections(where: { admin_id: { eq: $admin_address } }) {
        data {
          ...CollectionFragment
        }
      }
    }
  `,
  [CollectionFragment],
);

export async function getCollectionsByAdminAddress(adminAddress: string) {
  const res = await request(HYPERCERTS_API_URL, query, {
    admin_address: adminAddress,
  });

  const collectionsFragment = res.collections?.data;
  if (!collectionsFragment) {
    return undefined;
  }

  return readFragment(CollectionFragment, collectionsFragment);
}
