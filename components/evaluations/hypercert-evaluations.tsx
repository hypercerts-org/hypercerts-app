import PageSkeleton from "@/components/hypercert/page-skeleton";
import { EVALUATIONS_PER_PAGE, LISTINGS_PER_PAGE } from "@/configs/ui";
import { cache, Suspense } from "react";
import { InfoSection } from "@/components/global/sections";
import {
  getAttestations,
  GetAttestationsParams,
} from "@/attestations/getAttestations";
import { getAddress } from "viem";
import EvaluationsList from "./evaluations-list";
import { EVALUATIONS_SCHEMA_UID } from "@/configs/eas";

function EvaluationsListNoResults() {
  return <InfoSection>No evaluations found</InfoSection>;
}

function EvaluationsListLoadError() {
  return <InfoSection>We couldn&apos;t find any evaluations...</InfoSection>;
}

const getAttestationData = cache(async (params: GetAttestationsParams) => {
  const attestations = await getAttestations(params);
  return attestations;
});

export default async function HypercertEvaluations({
  hypercertId,
  searchParams,
  disabledForChain = false,
}: {
  hypercertId: string;
  searchParams: Record<string, string>;
  disabledForChain?: boolean;
}) {
  const currentPage = Number(searchParams?.evaluations) || 1;
  const offset = Math.max(0, LISTINGS_PER_PAGE * (currentPage - 1));
  const [chainId, contractAddress, tokenId] = hypercertId.split("-");

  const evaluations = await getAttestationData({
    filter: {
      chainId: BigInt(chainId),
      contractAddress: getAddress(contractAddress),
      tokenId: BigInt(tokenId),
      schemaId: EVALUATIONS_SCHEMA_UID,
    },
    first: EVALUATIONS_PER_PAGE,
    offset: offset,
  });

  if (!evaluations || evaluations.data.length === 0) {
    return <EvaluationsListNoResults />;
  }

  if (!evaluations) {
    return <EvaluationsListLoadError />;
  }

  if (!evaluations.count || evaluations.count === 0) {
    return <EvaluationsListNoResults />;
  }

  return (
    <div className="w-full">
      <Suspense fallback={<PageSkeleton />}>
        <EvaluationsList initialEvaluations={evaluations} />
      </Suspense>
    </div>
  );
}
