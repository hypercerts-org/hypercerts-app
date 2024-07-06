import "server-only";

import { ResultOf, graphql, readFragment } from "@/lib/graphql";

import { HYPERCERTS_API_URL } from "@/configs/hypercerts";
import request from "graphql-request";

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
    query allowlistRecords($address: String) {
      allowlistRecords(where: { user_address: { eq: $address } }) {
        count
        data {
          ...AllowListRecordFragment
        }
      }
    }
  `,
  [AllowListRecordFragment],
);

export async function getAllowListRecordsForAddress(address: string) {
  const res = await request(HYPERCERTS_API_URL, query, {
    address,
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
