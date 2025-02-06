"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UnclaimedHypercertBatchClaimButton from "../unclaimed-hypercert-butchClaim-button";
import { TableToolbar } from "./table-toolbar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { UnclaimedFraction } from "../unclaimed-hypercerts-list";

export interface DataTableProps {
  columns: ColumnDef<UnclaimedFraction>[];
  data: UnclaimedFraction[];
}

export function UnclaimedFractionTable({ columns, data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<UnclaimedFraction[]>(
    [],
  );

  const isMobile = useMediaQuery("(max-width: 640px)");

  // Hide units and actions columns on mobile
  useEffect(() => {
    if (isMobile) {
      setColumnVisibility((prev) => ({
        ...prev,
        units: false,
        actions: false,
      }));
    }
  }, [isMobile]);

  // Utility function to extract chain ID from hypercert_id
  const getChainId = useCallback((hypercertId: string) => {
    const [chainId] = hypercertId.split("-");
    return Number(chainId);
  }, []);

  // Determines if a row can be selected based on chain compatibility
  // This prevents selection of hypercerts from different chains simultaneously
  const isRowSelectable = useCallback(
    (row: Row<UnclaimedFraction>) => {
      const rowChainId = getChainId(row.original.hypercert_id!);
      // Allow selection if no chain is selected yet or if chains match
      return !selectedChain || selectedChain === rowChainId;
    },
    [selectedChain, getChainId],
  );

  // Handles row selection changes and maintains chain-based selection logic
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = useCallback(
    (updaterOrValue) => {
      // Handle both function updater and direct value updates
      const updatedSelection: RowSelectionState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(rowSelection)
          : updaterOrValue;

      // Get all currently selected rows
      const selectedRows = Object.entries(updatedSelection)
        .filter(([_, isSelected]) => isSelected)
        .map(([rowId]) => table.getRow(rowId));

      // Update selected chain based on selection state
      if (selectedRows.length > 0 && !selectedChain) {
        // Set selected chain when first row is selected
        const firstRow = selectedRows[0];
        setSelectedChain(getChainId(firstRow.original.hypercert_id!));
      } else if (selectedRows.length === 0) {
        // Clear selected chain when no rows are selected
        setSelectedChain(null);
      }

      setRowSelection(updatedSelection);
    },
    [selectedChain, getChainId, rowSelection],
  );

  const table = useReactTable({
    data: data as UnclaimedFraction[],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    enableRowSelection: isRowSelectable,
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Helper to get currently selected records
  const getSelectedRecords = useCallback(() => {
    return table.getSelectedRowModel().rows.map((row) => row.original);
  }, [table]);

  // Keep selectedRecords state in sync with row selection
  useEffect(() => {
    setSelectedRecords(getSelectedRecords());
  }, [rowSelection, getSelectedRecords]);

  return (
    <div className="w-full">
      <div className="flex gap-2 py-4 flex-col lg:flex-row">
        <UnclaimedHypercertBatchClaimButton
          allowListRecords={selectedRecords}
          selectedChainId={selectedChain}
        />
        <TableToolbar table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} hypercert fraction(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
