"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ExploreOrderBySelect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedValue = searchParams.get("orderBy") || "timestamp_desc";

  const orderBy = (value: string) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set("orderBy", value);
    router.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  return (
    <Select
      defaultValue="timestamp_desc"
      onValueChange={orderBy}
      value={selectedValue}
    >
      <SelectTrigger className="w-max">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="w-max">
        <SelectItem value="timestamp_desc">Newest first</SelectItem>
        <SelectItem value="timestamp_asc">Oldest first</SelectItem>
        <SelectItem value="name_asc">Name: A-Z</SelectItem>
        <SelectItem value="name_desc">Name: Z-A</SelectItem>
        <SelectItem value="attestations_desc">
          Most evaluations first
        </SelectItem>
        <SelectItem value="attestations_asc">
          Fewest evaluations first
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
