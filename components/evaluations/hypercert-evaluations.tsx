import PageSkeleton from "@/components/hypercert/page-skeleton";
import { EVALUATIONS_PER_PAGE, LISTINGS_PER_PAGE } from "@/configs/ui";
import { cache, Suspense } from "react";
import { InfoSection } from "../global/sections";
import Pagination from "../global/pagination/pagination";
import {
  getAttestations,
  GetAttestationsParams,
} from "@/attestations/getAttestations";
import { getAddress } from "viem";
import EvaluationsList from "../hypercert/evaluations-list";

function EvaluationsListNoResults() {
  return "No evaluations found";
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
}: {
  hypercertId: string;
  searchParams: Record<string, string>;
}) {
  const currentPage = Number(searchParams?.evaluations) || 1;
  const offset = Math.max(0, LISTINGS_PER_PAGE * (currentPage - 1));
  const [chainId, contractAddress, tokenId] = hypercertId.split("-");

  const evaluations = await getAttestationData({
    filter: {
      chainId: BigInt(chainId),
      contractAddress: getAddress(contractAddress),
      tokenId: BigInt(tokenId),
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
        <Pagination
          searchParams={searchParams}
          totalItems={evaluations.count}
          itemsPerPage={EVALUATIONS_PER_PAGE}
          basePath={`/hypercerts/${hypercertId}`}
          parameterName="evaluations"
          currentPage={currentPage}
        />
      </Suspense>
    </div>
  );
}
