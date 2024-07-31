"use client";

import React, { useMemo, useState } from "react";
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

import {
  ArrowUpDown,
  ExternalLink,
  InfoIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHypercertClient } from "@/hooks/use-hypercert-client";
import {
  decodeFractionalOrderParams,
  getPricePerPercent,
  orderFragmentToHypercert,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StepProcessDialogProvider } from "@/components/global/step-process-dialog";
import { BuyFractionalOrderForm } from "@/components/marketplace/buy-fractional-order-form";
import { useRouter } from "next/navigation";

export default function UserOrdersList({
  address,
  orders,
}: {
  address: string;
  orders: OrderFragment[];
}) {
  console.log("orders", orders);
  const chainId = useChainId();
  const { address: currentUserAddress } = useAccount();

  const { client } = useHypercertClient();
  const { client: hypercertExchangeClient } = useHypercertExchangeClient();

  const columnHelper = createColumnHelper<OrderFragment>();
  const { push } = useRouter();

  const hasInvalidatedOrdersForCurrentUser = (orders || []).some(
    (order) => order.invalidated && order.signer === address,
  );

  const ordersVisibleToCurrentUser = useMemo(() => {
    return orders.filter((order) =>
      order.invalidated ? order.signer === currentUserAddress : true,
    );
  }, []);

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
    columnHelper.accessor("hypercert", {
      cell: (row) => {
        const hypercert = row.getValue();
        const name = hypercert?.metadata?.name || "Hypercert";
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              push(`/hypercerts/${hypercert?.hypercert_id}`);
            }}
          >
            <a className="flex items-center gap-2 content-center cursor-pointer px-1 py-0.5 bg-slate-100 rounded-md w-max text-sm">
              <div>{name}</div>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        );
      },
      header: "Hypercert",
    }),
    columnHelper.accessor("price", {
      header: ({ column }) => {
        return (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price per %
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: (row) => {
        const hypercert = row.row.original.hypercert;
        return (
          <div>
            {getPricePerPercent(row.getValue(), BigInt(hypercert?.units || 0))}{" "}
            ETH
          </div>
        );
      },
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
        } catch (error) {
          console.error("Error decoding fractional order params", error);
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
        } catch (error) {
          console.error("Error decoding fractional order params", error);
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
              if (order.signer !== address || !row.row.original.invalidated) {
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
    data: ordersVisibleToCurrentUser,
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

  const classes = (onConnectedChain: boolean) =>
    cn({
      "cursor-pointer": onConnectedChain,
      "opacity-50": !onConnectedChain,
    });

  const canGetPreviousPage = table.getCanPreviousPage();
  const canGetNextPage = table.getCanNextPage();
  const paginationDisplayed = canGetPreviousPage || canGetNextPage;

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
                        client?.isClaimOrFractionOnConnectedChain(
                          row.original?.hypercert_id as string,
                        ) &&
                        !row.original.invalidated
                      ) {
                        onRowClick(row.original);
                      }
                    }}
                    className={cn(
                      classes(
                        !!client?.isClaimOrFractionOnConnectedChain(
                          row.original?.hypercert_id as string,
                        ),
                      ),
                      {
                        "bg-red-100": row.original.invalidated,
                      },
                    )}
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
      {paginationDisplayed && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={canGetPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={canGetNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
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
                hypercert={orderFragmentToHypercert(selectedOrder)}
              />
            </StepProcessDialogProvider>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
