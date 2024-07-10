"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { Suspense, useState } from "react";
import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEther } from "viem";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuyFractionalOrderForm } from "@/components/marketplace/buy-fractional-order-form";
import EthAddress from "@/components/eth-address";
import { MarketplaceOrder } from "@/marketplace/types";
import { StepProcessDialogProvider } from "@/components/global/step-process-dialog";
import { cn } from "@/lib/utils";
import { useFetchMarketplaceOrdersForHypercert } from "@/marketplace/hooks";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import { decodeFractionalOrderParams } from "@/marketplace/utils";

function OrdersListInner({ hypercert }: { hypercert: HypercertFull }) {
  const { hypercert_id: hypercertId } = hypercert;
  const { data: openOrders } = useFetchMarketplaceOrdersForHypercert(
    hypercertId!,
  );
  const { client } = useHypercertClient();

  const hypercertOnConnectedChain = client.isClaimOrFractionOnConnectedChain(
    hypercertId!,
  );

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
      sortingFn: (rowA, rowB) =>
        BigInt(rowA.getValue("price")) < BigInt(rowB.getValue("price"))
          ? 1
          : -1,
    }),
    columnHelper.accessor("additionalParameters", {
      id: "minUnitsToBuy",
      header: "Min units per order",
      cell: (row) => {
        const params = row.getValue();
        const { minUnitAmount } = decodeFractionalOrderParams(
          params as `0x{string}`,
        );
        return <div>{minUnitAmount.toString()}</div>;
      },
    }),
    columnHelper.accessor("additionalParameters", {
      id: "maxUnitAmount",
      header: "Max units per order",
      cell: (row) => {
        const params = row.getValue();
        const { maxUnitAmount } = decodeFractionalOrderParams(
          params as `0x{string}`,
        );
        return <div>{maxUnitAmount.toString()}</div>;
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

  const classes = cn({
    "cursor-pointer": hypercertOnConnectedChain,
    "opacity-50": !hypercertOnConnectedChain,
  });

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
                    onClick={
                      hypercertOnConnectedChain
                        ? () => onRowClick(row.original)
                        : undefined
                    }
                    className={classes}
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
          <DialogContent className="gap-5 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl font-medium tracking-tight">
                Buy hypercert fraction
              </DialogTitle>
            </DialogHeader>
            <StepProcessDialogProvider>
              <BuyFractionalOrderForm
                order={selectedOrder}
                hypercert={hypercert}
              />
            </StepProcessDialogProvider>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function OrdersList({
  hypercert,
}: {
  hypercert: HypercertFull;
}) {
  return (
    <Suspense>
      <OrdersListInner hypercert={hypercert} />
    </Suspense>
  );
}
