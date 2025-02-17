import { getAllowListRecordsForAddressByClaimedWithMetadata } from "@/allowlists/actions/getAllowListRecordsForAddressByClaimedWithMetadata";
import { EmptySection } from "@/components/global/sections";
import UnclaimedHypercertsList from "@/components/profile/unclaimed-hypercerts-list";

interface ClaimableContentProps {
  address: string;
}

export async function ClaimableContent({ address }: ClaimableContentProps) {
  const response = await getAllowListRecordsForAddressByClaimedWithMetadata({
    address,
    claimed: false,
  });

  if (!response || !response.data || response.data.length === 0) {
    return <EmptySection />;
  }

  const { data } = response;

  return <UnclaimedHypercertsList unclaimedHypercerts={[...data]} />;
}
