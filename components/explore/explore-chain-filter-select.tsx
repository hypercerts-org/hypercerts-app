"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supportedChains } from "@/lib/constants";

export default function ChainFilterSelect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedValue = searchParams.get("chain") || "all";

  const selectFilter = (value: string) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    if (value === "all") {
      urlSearchParams.delete("chain");
    } else {
      urlSearchParams.set("chain", value);
    }
    router.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  return (
    <Select
      defaultValue="timestamp_desc"
      onValueChange={selectFilter}
      value={selectedValue}
    >
      <SelectTrigger className="w-max">
        <SelectValue placeholder="All chains" />
      </SelectTrigger>
      <SelectContent className="w-max">
        <SelectItem value="all">All chains</SelectItem>
        {supportedChains.map((chain) => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
