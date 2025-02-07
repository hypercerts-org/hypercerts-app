import { getAllowListRecordsForAddressByClaimed } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import { UnclaimedFraction } from "@/components/profile/unclaimed-hypercerts-list";
import { getHypercertMetadata } from "@/hypercerts/getHypercertMetadata";
import { getHypercertsByCreator } from "@/hypercerts/getHypercertsByCreator";
import { getHypercertsByOwner } from "@/hypercerts/getHypercertsByOwner";
import { NextResponse } from "next/server";
import { cache } from "react";
import { chunk } from "lodash";

export const hypercertsByCreatorCache = cache(async (address: string) => {
  const hypercerts = await getHypercertsByCreator({ creatorAddress: address });
  return hypercerts;
});

export const hypercertsByOwnerCache = cache(async (address: string) => {
  const hypercerts = await getHypercertsByOwner({ ownerAddress: address });
  return hypercerts;
});

export const claimableFractionsCache = cache(async (address: string) => {
  const claimableFractions = await getAllowListRecordsForAddressByClaimed(
    address,
    false,
  );
  return claimableFractions;
});

const metadataCache = cache(async (hypercertId: string) => {
  const metadata = await getHypercertMetadata(hypercertId);
  return metadata;
});

export const claimableFractionsWithMetadataCache = async (address: string) => {
  const claimableFractions = await claimableFractionsCache(address);
  return claimableFractions;
};

// Helper function to add delay between requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Process chunks of requests with delay
async function processInChunks<T>(
  items: T[],
  processFn: (item: T) => Promise<any>,
  chunkSize = 5,
  delayMs = 1000,
) {
  const chunks = chunk(items, chunkSize);
  const results = [];

  for (const chunkItems of chunks) {
    const chunkResults = await Promise.all(
      chunkItems.map((item) => processFn(item)),
    );
    results.push(...chunkResults);
    await delay(delayMs); // Wait between chunks
  }

  return results;
}

export async function GET(
  request: Request,
  { params }: { params: { address: string } },
) {
  const [created, owned, claimable] = await Promise.all([
    hypercertsByCreatorCache(params.address),
    hypercertsByOwnerCache(params.address),
    claimableFractionsWithMetadataCache(params.address),
  ]);

  // Process claimable fractions in chunks
  if (claimable?.data) {
    const processedData = await processInChunks(
      claimable.data,
      async (fraction) => {
        const metadata = await metadataCache(fraction.hypercert_id ?? "");
        return { ...fraction, metadata: metadata?.data ?? null };
      },
      5, // Process 5 at a time
      1000, // Wait 1 second between chunks
    );
    claimable.data = processedData;
  }

  return NextResponse.json({
    created,
    owned,
    claimable,
  });
}
