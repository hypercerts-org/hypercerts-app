import "server-only";

import { ResultOf, graphql, readFragment } from "@/lib/graphql";

import request from "graphql-request";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";

export const AllowListRecordFragment = graphql(`
  fragment AllowListRecordFragment on AllowlistRecord {
    id
    hypercert_id
    token_id
    root
    leaf
    entry
    user_address
    claimed
    proof
    units
    total_units
  }
`);
export type AllowListRecord = ResultOf<typeof AllowListRecordFragment>;

const query = graphql(
  `
    query allowlistRecords($address: String, $claimed: Boolean) {
      allowlistRecords(
        where: { user_address: { eq: $address }, claimed: { eq: $claimed } }
      ) {
        count
        data {
          ...AllowListRecordFragment
        }
      }
    }
  `,
  [AllowListRecordFragment],
);

export async function getAllowListRecordsForAddressByClaimed(
  address: string,
  claimed: boolean,
) {
  const res = await request(HYPERCERTS_API_URL_GRAPH, query, {
    address,
    claimed,
  });

  const allowlistRecords = res.allowlistRecords.data;
  if (!allowlistRecords) {
    return undefined;
  }
  const allowlistRecordsRead = readFragment(
    AllowListRecordFragment,
    allowlistRecords,
  );

  const count = res.allowlistRecords.count;
  return {
    count,
    data: allowlistRecordsRead,
  };
}
