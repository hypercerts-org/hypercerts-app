"use client";

import { COLLECTIONS_PER_PAGE } from "@/configs/ui";
import { usePathname, useSearchParams } from "next/navigation";
import PaginationButton from "@/components/pagination-button";

export default function Pagination({
  count,
  pageSize = COLLECTIONS_PER_PAGE,
}: {
  count: number;
  pageSize?: number;
}) {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil((count || 0) / pageSize);
  const currentPage = Number(searchParams.get("p")) || 1;

  const urlSearchParams = new URLSearchParams(searchParams);
  const href = (toPage: number) => {
    urlSearchParams.set("p", toPage.toString());
    return `${pathName}?${urlSearchParams.toString()}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
      <div className="flex items-center justify-start gap-2">
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

      <div className="pt-1 text-sm text-gray-500 whitespace-nowrap">
        {currentPage} of {totalPages}
      </div>

      <div className="flex items-center justify-end gap-2">
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
