"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ArrowUpDown, InfoIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuyFractionalOrderForm } from "@/components/marketplace/buy-fractional-order-form";
import EthAddress from "@/components/eth-address";
import { StepProcessDialogProvider } from "@/components/global/step-process-dialog";
import { cn } from "@/lib/utils";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import { HypercertFull } from "@/hypercerts/fragments/hypercert-full.fragment";
import {
  decodeFractionalOrderParams,
  getPricePerPercent,
  orderFragmentToMarketplaceOrder,
} from "@/marketplace/utils";
import { useAccount, useChainId } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";
import { OrderFragment } from "@/marketplace/fragments/order.fragment";
import { FormattedUnits } from "@/components/formatted-units";

export default function OrdersList({
  orders,
  hypercert,
}: {
  orders?: OrderFragment[];
  hypercert: HypercertFull;
}) {
  const chainId = useChainId();
  const { address } = useAccount();

  const { client } = useHypercertClient();
  const { client: hypercertExchangeClient } = useHypercertExchangeClient();

  const hypercertOnConnectedChain =
    client?.isClaimOrFractionOnConnectedChain(hypercert?.hypercert_id!) ||
    false;

  const columnHelper = createColumnHelper<OrderFragment>();

  const hasInvalidatedOrdersForCurrentUser = (orders || []).some(
    (order) => order.invalidated && order.signer === address,
  );

  const refreshOrderValidity = async (tokenId: string) => {
    if (!hypercertExchangeClient) {
      console.log("No hypercert exchange client");
      return;
    }

    if (!chainId) {
      console.log("No chain ID");
      return;
    }

    await hypercertExchangeClient.api.updateOrderValidity(
      [BigInt(tokenId)],
      chainId,
    );
  };

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
            Price per %
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: (row) => (
        <div>
          {getPricePerPercent(
            row.getValue(),
            BigInt(hypercert.units || BigInt(0)),
          )}{" "}
          ETH
        </div>
      ),
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
        try {
          const { minUnitAmount } = decodeFractionalOrderParams(
            params as `0x{string}`,
          );
          return <FormattedUnits>{minUnitAmount.toString()}</FormattedUnits>;
        } catch (e) {
          console.error(e);
          return <div>Invalid</div>;
        }
      },
    }),
    columnHelper.accessor("additionalParameters", {
      id: "maxUnitAmount",
      header: "Max units per order",
      cell: (row) => {
        const params = row.getValue();
        try {
          const { maxUnitAmount } = decodeFractionalOrderParams(
            params as `0x{string}`,
          );
          return <FormattedUnits>{maxUnitAmount.toString()}</FormattedUnits>;
        } catch (e) {
          console.error(e);
          return <div>Invalid</div>;
        }
      },
    }),
    ...(hasInvalidatedOrdersForCurrentUser
      ? [
          columnHelper.accessor("invalidated", {
            id: "invalidated",
            header: "Invalidated",
            cell: (row) => {
              const order = row.row.original;
              if (order.signer !== address) {
                return <div></div>;
              }
              return (
                <div className="flex">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="cursor-default" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        This order has been evaluated to be invalid. You can
                        refresh the order status by clicking the refresh icon.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className="ml-2"
                          onClick={() => refreshOrderValidity(order.itemIds[0])}
                        >
                          <RefreshCwIcon />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        Refresh the order status.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            },
          }),
        ]
      : []),
  ];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });
  const table = useReactTable({
    data: orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination,
    },
  });

  const [selectedOrder, setSelectedOrder] = useState<OrderFragment | null>(
    null,
  );
  const onRowClick = (row: OrderFragment) => {
    setSelectedOrder((current) => (current === row ? null : row));
  };

  if (!orders?.length) {
    return <div>This Hypercert has not yet been listed for sale.</div>;
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
                    onClick={() => {
                      if (
                        hypercertOnConnectedChain &&
                        !row.original.invalidated
                      ) {
                        onRowClick(row.original);
                      }
                    }}
                    className={cn(classes, {
                      "bg-red-100": row.original.invalidated,
                    })}
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
              <div className="bg-yellow-500/10 p-3 mb-2 rounded-sm">
                Hypercerts marketplace features are in beta. Please use with
                caution.
              </div>
              <DialogTitle className="font-serif text-3xl font-medium tracking-tight">
                Buy hypercert fraction
              </DialogTitle>
            </DialogHeader>
            <StepProcessDialogProvider>
              <BuyFractionalOrderForm
                order={orderFragmentToMarketplaceOrder(selectedOrder)}
                hypercert={hypercert}
              />
            </StepProcessDialogProvider>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
