import { use } from "react";
import { ATTESTORS_PER_PAGE } from "../../configs/ui";
import EvaluatorsListRow from "./evaluators-list-row";
import { getTrustedAttestors } from "../../github/getTrustedAttestors";
import Pagination from "../global/pagination/pagination";

// Implement caching and revalidation
async function getAttestorsData() {
  const attestors = await getTrustedAttestors();
  return attestors;
}

export default function EvaluatorsList({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const currentPage = Number(searchParams?.p) || 1;
  const attestors = use(getAttestorsData());

  const paginatedAttestors = attestors.slice(
    (currentPage - 1) * ATTESTORS_PER_PAGE,
    currentPage * ATTESTORS_PER_PAGE,
  );

  return (
    <section className="h-full flex flex-col space-y-8 items-center">
      <section className="w-full">
        {paginatedAttestors.map((attestor, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm text-slate-700 font-medium"
          >
            <EvaluatorsListRow attestor={attestor} />
          </div>
        ))}
      </section>
      <Pagination
        searchParams={searchParams}
        totalItems={attestors.length}
        itemsPerPage={ATTESTORS_PER_PAGE}
        basePath="/evaluators"
        parameterName="evaluators"
        currentPage={currentPage}
      />
    </section>
  );
}
