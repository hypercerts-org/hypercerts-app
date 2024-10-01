"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ExploreEvaluationsFilterSelect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedValue = searchParams.get("filter") || "all";

  const selectFilter = (value: string) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    if (value === "all") {
      urlSearchParams.delete("filter");
    } else {
      urlSearchParams.set("filter", value);
    }
    router.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  return (
    <Select
      defaultValue="timestamp_desc"
      onValueChange={selectFilter}
      value={selectedValue}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="All chains" />
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectItem value="all">All Hypercerts</SelectItem>
        <SelectItem value="evaluated"> Only evaluated</SelectItem>
      </SelectContent>
    </Select>
  );
}
