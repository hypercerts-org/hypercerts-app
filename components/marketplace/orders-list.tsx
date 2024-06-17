"use client";

import React, { Suspense, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { MarketplaceOrder } from "@/marketplace/types";
import { useFetchMarketplaceOrdersForHypercert } from "@/marketplace/hooks";
import { StepProcessDialogProvider } from "@/components/global/step-process-dialog";
import { BuyFractionalOrderForm } from "@/components/marketplace/buy-fractional-order-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { decodeAbiParameters, formatEther, parseAbiParameters } from "viem";
import EthAddress from "@/components/eth-address";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

function OrdersListInner({ hypercertId }: { hypercertId: string }) {
  const { data: openOrders } =
    useFetchMarketplaceOrdersForHypercert(hypercertId);

  const columnHelper = createColumnHelper<MarketplaceOrder>();
  const columns = [
    columnHelper.accessor("signer", {
      cell: (row) => (
        <div>
          <EthAddress address={row.getValue()} />
        </div>
      ),
      header: "Seller",
    }),
    columnHelper.accessor("price", {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price per unit
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: (row) => <div>{formatEther(BigInt(row.getValue()))} ETH</div>,
    }),
    columnHelper.accessor("additionalParameters", {
      id: "minUnitsToBuy",
      header: "Min units per order",
      cell: (row) => {
        const params = row.getValue();
        const [unitAmount] = decodeAbiParameters(
          parseAbiParameters("uint256 a, uint256 b, uint256 c, uint256 d"),
          params as `0x{string}`,
        );
        return <div>{unitAmount.toString()}</div>;
      },
    }),
    columnHelper.accessor("additionalParameters", {
      id: "maxUnitsToBuy",
      header: "Max units per order",
      cell: (row) => {
        const params = row.getValue();
        const [_, maxUnitsToBuy] = decodeAbiParameters(
          parseAbiParameters("uint256 a, uint256 b, uint256 c, uint256 d"),
          params as `0x{string}`,
        );
        return <div>{maxUnitsToBuy.toString()}</div>;
      },
    }),
  ];
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data: openOrders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(
    null,
  );
  const onRowClick = (row: MarketplaceOrder) => {
    setSelectedOrder((current) => (current === row ? null : row));
  };

  if (!openOrders?.length) {
    return <div></div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="rounded-md border  w-full">
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
                    onClick={() => onRowClick(row.original)}
                    className="cursor-pointer"
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
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}
        >
          <DialogContent>
            <DialogHeader>Buy fractional sale</DialogHeader>
            <StepProcessDialogProvider>
              <BuyFractionalOrderForm order={selectedOrder} />
            </StepProcessDialogProvider>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function OrdersList({ hypercertId }: { hypercertId: string }) {
  return (
    <Suspense>
      <OrdersListInner hypercertId={hypercertId} />
    </Suspense>
  );
}
