"use client";

import { AllowListRecord } from "@/allowlists/getAllowListRecordsForAddressByClaimed";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import TimeFrame from "../hypercert/time-frame";
import UnclaimedHypercertClaimButton from "./unclaimed-hypercert-claim-button";

interface UnclaimedHypercertsListContentProps {
  unclaimedHypercertsData: {
    hypercert: any;
    record: AllowListRecord;
  }[];
}

type UnclaimedHypercert = {
  id: string;
  name: string;
  image: string;
  timeFrom: string;
  timeTo: string;
  allowListRecord: AllowListRecord;
};

const columnHelper = createColumnHelper<UnclaimedHypercert>();

const columns = [
  columnHelper.accessor("image", {
    header: "Image",
    cell: (info) => (
      <Link href={`/hypercerts/${info.row.original.id}`}>
        <Image
          src={info.getValue()}
          alt={info.row.original.name || "Untitled"}
          className="object-cover object-top w-[100px] h-[100px] cursor-pointer"
          width={75}
          height={75}
        />
      </Link>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => (
      <Link
        href={`/hypercerts/${info.row.original.id}`}
        className="hover:underline"
      >
        <div className="flex flex-col justify-center">
          <h6 className="text-lg font-semibold">
            {info.getValue() || "Untitled"}
          </h6>
          <TimeFrame
            from={info.row.original.timeFrom}
            to={info.row.original.timeTo}
          />
        </div>
      </Link>
    ),
  }),
  columnHelper.accessor("allowListRecord", {
    header: "Action",
    cell: (info) => (
      <UnclaimedHypercertClaimButton allowListRecord={info.getValue()} />
    ),
  }),
];

export default function UnclaimedHypercertsListContent({
  unclaimedHypercertsData,
}: UnclaimedHypercertsListContentProps) {
  // Map to a new array of objects with the necessary properties
  const data = unclaimedHypercertsData.map(({ hypercert, record }) => {
    const _unclaimedHypercert: UnclaimedHypercert = {
      id: record.hypercert_id as string,
      name: hypercert?.metadata?.name,
      image: `/api/hypercerts/${record.hypercert_id}/image`,
      timeFrom: hypercert?.metadata?.work_timeframe_from,
      timeTo: hypercert?.metadata?.work_timeframe_to,
      allowListRecord: record,
    };
    return _unclaimedHypercert;
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr key={row.id} className="border-b last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td key={`${index}-${cell.id}`} className="py-4 px-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
