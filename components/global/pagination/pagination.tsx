"use client";

import { useCallback } from "react";
import PaginationButton from "./pagination-button";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  searchParams: Record<string, string>;
  totalItems: number;
  itemsPerPage: number;
  basePath?: string;
  parameterName?: string;
  currentPage?: number;
}

export default function Pagination({
  searchParams,
  totalItems,
  itemsPerPage,
  parameterName = "p",
  basePath = "",
  currentPage,
}: PaginationProps) {
  const totalPages = Math.ceil((totalItems || 0) / itemsPerPage);
  const pageNumber = currentPage || Number(searchParams[parameterName]) || 1;
  const { push } = useRouter();

  const getPageHref = useCallback(
    (page: number) => {
      const urlSearchParams = new URLSearchParams(searchParams);
      urlSearchParams.set(parameterName, page.toString());
      return `${basePath}?${urlSearchParams.toString()}`;
    },
    [searchParams, basePath, parameterName],
  );

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pageNumber - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <PaginationButton
          key={i}
          href={getPageHref(i)}
          active={i === pageNumber}
        >
          {i}
        </PaginationButton>,
      );
    }

    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  if (pageNumber > totalPages) {
    // Redirect to last page if the current page is greater than the total number of pages
    push(getPageHref(totalPages));
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full mt-4">
      <div className="flex items-center justify-start gap-2">
        {pageNumber > 1 && (
          <>
            <PaginationButton href={getPageHref(1)} arrow="left">
              First
            </PaginationButton>
            <PaginationButton href={getPageHref(pageNumber - 1)} arrow="left">
              Previous
            </PaginationButton>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {renderPageNumbers()}
      </div>

      <div className="flex items-center justify-end gap-2">
        {pageNumber < totalPages && (
          <>
            <PaginationButton href={getPageHref(pageNumber + 1)} arrow="right">
              Next
            </PaginationButton>
            <PaginationButton href={getPageHref(totalPages)} arrow="right">
              Last
            </PaginationButton>
          </>
        )}
      </div>
    </div>
  );
}
