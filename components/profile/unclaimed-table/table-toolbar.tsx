"use client";

import React, { useMemo } from "react";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableFilter } from "./table-filter";
import { ChainFactory } from "@/lib/chainFactory";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function TableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const chainOptions = useMemo(() => {
    const supportedChains = ChainFactory.getSupportedChains();
    return supportedChains.map((chainId) => {
      const chain = ChainFactory.getChain(chainId);
      return {
        label: chain.name,
        value: chainId.toString(),
      };
    });
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {table.getColumn("hypercert_id") && (
          <TableFilter
            column={table.getColumn("hypercert_id")}
            title="Filter Chains"
            options={chainOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
