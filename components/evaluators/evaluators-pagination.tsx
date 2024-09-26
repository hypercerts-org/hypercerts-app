import { ATTESTORS_PER_PAGE } from "../../configs/ui";
import PaginationButton from "../pagination-button";

export default function EvaluatorsPagination({
  searchParams,
  attestorsCount,
}: {
  searchParams: Record<string, string>;
  attestorsCount: number;
}) {
  const currentPage = Number(searchParams?.p) || 1;
  const urlSearchParams = new URLSearchParams(searchParams);
  const href = (toPage: number) => {
    urlSearchParams.set("p", toPage.toString());
    return `/evaluators/?${urlSearchParams.toString()}`;
  };
  const totalPages = Math.ceil((attestorsCount || 0) / ATTESTORS_PER_PAGE);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center justify-start gap-2 w-[250px]">
        {currentPage > 1 && (
          <PaginationButton arrow="left" href={href(1)}>
            First
          </PaginationButton>
        )}

        {currentPage > 1 && (
          <PaginationButton arrow="left" href={href(currentPage - 1)}>
            Previous
          </PaginationButton>
        )}
      </div>

      <div className="pt-1 text-sm text-slate-500 whitespace-nowrap">
        {currentPage} of {totalPages}
      </div>

      <div className="flex items-center justify-end gap-2 w-[250px]">
        {currentPage < totalPages && (
          <PaginationButton arrow="right" href={href(currentPage + 1)}>
            Next
          </PaginationButton>
        )}

        {currentPage < totalPages && (
          <PaginationButton arrow="right" href={href(totalPages)}>
            Last
          </PaginationButton>
        )}
      </div>
    </div>
  );
}
