"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { UnclaimedFraction } from "../unclaimed-hypercerts-list";

interface DataTableRowActionsProps<TData> {
  row: Row<TData & UnclaimedFraction>;
}

export function UnclaimedTableDropdown<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const hypercertId = row.original?.hypercert_id;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0">
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={`/hypercerts/${hypercertId}`}
        >
          <DropdownMenuItem className="cursor-pointer">
            View Hypercert
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(event): void => {
            event.stopPropagation();
            if (!hypercertId) {
              return;
            }
            void navigator.clipboard.writeText(hypercertId);
          }}
        >
          Copy HypercertId
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
