import { AllowListRecord } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import { getHypercert } from "@/hypercerts/getHypercert";

export async function getHypercertDataForUnclaimed(
  unclaimedHypercerts: readonly AllowListRecord[],
) {
  if (!unclaimedHypercerts) return [];

  console.log("unclaimedHypercerts", unclaimedHypercerts);

  const results = await Promise.all(
    unclaimedHypercerts.map(async (record) => {
      if (!record.hypercert_id) {
        return {
          hypercert: null,
          record,
        };
      }

      const hypercert = await getHypercert(record.hypercert_id);
      return {
        hypercert,
        record,
      };
    }),
  );

  return results.filter((result) => result.hypercert !== null) ?? [];
}
