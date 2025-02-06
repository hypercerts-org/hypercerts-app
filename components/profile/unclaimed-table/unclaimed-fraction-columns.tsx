"use client";

import React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import TimeFrame from "@/components/hypercert/time-frame";
import { ChainFactory } from "@/lib/chainFactory";
import { Checkbox } from "@/components/ui/checkbox";
import { UnclaimedTableDropdown } from "./unclaimed-table-dropdown";
import UnclaimedHypercertClaimButton from "../unclaimed-hypercert-claim-button";
import { Badge } from "@/components/ui/badge";
import { FormattedUnits } from "@/components/formatted-units";
import Link from "next/link";
import { TooltipInfo } from "@/components/tooltip-info";
import { UnclaimedFraction } from "../unclaimed-hypercerts-list";
import { calculateBigIntPercentage } from "@/lib/calculateBigIntPercentage";

const columnHelper = createColumnHelper<UnclaimedFraction>();

export const UnclaimedFractionColumns = [
  columnHelper.accessor("id", {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("hypercert_id", {
    header: "Hypercert",
    id: "hypercert_id",
    cell: ({ row }) => {
      const hypercertId = row.original.hypercert_id as string;
      const metadata = row.original.metadata;
      const [chainId] = hypercertId.split("-");
      const chain = ChainFactory.getChain(Number(chainId));

      return (
        <Link
          href={`/hypercerts/${hypercertId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer block w-full"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="w-full sm:w-auto">
              <Image
                src={`/api/hypercerts/${hypercertId}/image`}
                alt={hypercertId || ""}
                className="object-cover object-top w-full sm:w-24 h-24 sm:h-24 rounded"
                width={100}
                height={100}
              />
            </div>
            <div className="flex flex-col flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                {chain && (
                  <Badge variant="outline" className="w-max text-xs sm:text-sm">
                    {chain.name}
                  </Badge>
                )}
                <span className="truncate font-medium text-sm sm:text-base max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]">
                  {metadata?.name}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                <TimeFrame
                  from={metadata?.work_timeframe_from}
                  to={metadata?.work_timeframe_to}
                />
              </div>
            </div>
          </div>
        </Link>
      );
    },
    filterFn: (
      row: { getValue: (columnId: string) => string },
      id: string,
      filterValue: string[],
    ) => {
      if (!filterValue?.length) return true;
      const [chainId] = row.getValue(id).split("-");
      return filterValue.includes(chainId);
    },
  }),
  columnHelper.accessor("units", {
    header: () => {
      return (
        <div className="flex flex-row items-center space-x-1">
          <span>Claimable fraction</span>
          <TooltipInfo
            tooltipText="Your claimable portion of the total hypercert units. For example, 50% means you can claim half of the total units issued for this hypercert."
            className="w-4 h-4"
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const calculatedPercentage = calculateBigIntPercentage(
        row.original.units as string,
        row.original.total_units as string,
      );

      const displayPercentage =
        calculatedPercentage! < 1
          ? "<1"
          : Math.round(calculatedPercentage!).toString();

      return (
        <div className="flex flex-col space-y-1 text-sm sm:text-base">
          <span className="font-medium">{displayPercentage}%</span>
          <span className="flex items-center space-x-1 text-gray-600">
            <FormattedUnits>{row.original.units as string}</FormattedUnits>
            {" / "}
            <FormattedUnits>
              {row.original.total_units as string}
            </FormattedUnits>
          </span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "claim",
    cell: ({ row }) => {
      return (
        <div className="w-full sm:w-auto">
          <UnclaimedHypercertClaimButton allowListRecord={row} />
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="w-full sm:w-auto">
          <UnclaimedTableDropdown row={row} />
        </div>
      );
    },
  }),
] as ColumnDef<UnclaimedFraction>[];
