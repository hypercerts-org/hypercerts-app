"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ExploreOrderBySelect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedValue = searchParams.get("orderBy") || "creation_block_number_desc";

  const orderBy = (value: string) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set("orderBy", value);
    router.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  return (
    <Select
      defaultValue="creation_block_number_desc"
      onValueChange={orderBy}
      value={selectedValue}
    >
      <SelectTrigger className="w-max">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="w-max">
        <SelectItem value="creation_block_number_desc">Newest first</SelectItem>
        <SelectItem value="creation_block_number_asc">Oldest first</SelectItem>
        <SelectItem value="claim_attestation_count_desc">
          Most evaluations first
        </SelectItem>
        <SelectItem value="claim_attestation_count_asc">
          Fewest evaluations first
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
