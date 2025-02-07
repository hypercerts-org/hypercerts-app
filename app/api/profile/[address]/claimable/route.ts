import { getAllowListRecordsForAddressByClaimed } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import { getHypercertMetadata } from "@/hypercerts/getHypercertMetadata";
import { NextResponse } from "next/server";
import { cache } from "react";

// Cache metadata fetching
const getCachedMetadata = cache(async (id: string) => {
  return await getHypercertMetadata(id);
});

// Dedupe in-flight requests
const requestMap = new Map<string, Promise<any>>();

// Helper function to get metadata with deduping
async function getMetadataWithDeduping(hypercertId: string) {
  if (requestMap.has(hypercertId)) {
    return requestMap.get(hypercertId);
  }

  const requestPromise = getCachedMetadata(hypercertId);
  requestMap.set(hypercertId, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    requestMap.delete(hypercertId);
  }
}

export async function GET(
  request: Request,
  { params }: { params: { address: string } },
) {
  const claimable = await getAllowListRecordsForAddressByClaimed(
    params.address,
    false,
  );

  if (claimable?.data) {
    const processedData = await Promise.all(
      claimable.data.map(async (fraction) => {
        const metadata = fraction.hypercert_id
          ? await getMetadataWithDeduping(fraction.hypercert_id)
          : null;
        return { ...fraction, metadata: metadata?.data ?? null };
      }),
    );
    claimable.data = processedData;
  }

  return NextResponse.json(claimable);
}
