import "server-only";

import { ResultOf, graphql, readFragment } from "@/lib/graphql";

import request from "graphql-request";
import { HYPERCERTS_API_URL_GRAPH } from "@/configs/hypercerts";
import { getHypercertMetadata } from "@/hypercerts/actions/getHypercertMetadata";
import { UnclaimedFraction } from "@/components/profile/unclaimed-hypercerts-list";

export const AllowListRecordFragment = graphql(`
  fragment AllowListRecordFragment on AllowlistRecord {
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

const requestMap = new Map<string, Promise<any>>();

async function getMetadataWithDeduping(hypercertId: string) {
  if (requestMap.has(hypercertId)) {
    return requestMap.get(hypercertId);
  }

  const requestPromise = getHypercertMetadata(hypercertId);
  requestMap.set(hypercertId, requestPromise);

  return await requestPromise;
}

export async function getAllowListRecordsForAddressByClaimedWithMetadata({
  address,
  claimed,
}: {
  address: string;
  claimed: boolean;
}): Promise<
  { data: UnclaimedFraction[] | null; count: number | null } | undefined
> {
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

  if (allowlistRecordsRead && allowlistRecordsRead.length > 0) {
    const processedData = await Promise.all(
      allowlistRecordsRead.map(async (fraction) => {
        const metadata = fraction.hypercert_id
          ? await getMetadataWithDeduping(fraction.hypercert_id)
          : null;
        return { ...fraction, metadata: metadata?.data ?? null };
      }),
    );

    return {
      count,
      data: processedData,
    };
  }

  return {
    count,
    data: [...allowlistRecordsRead],
  };
}
