"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

export default function SearchBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlSearchParams = new URLSearchParams(searchParams);
  const [searchInput, setSearchInput] = useState(
    urlSearchParams.get("search") || "",
  );

  const search = () => {
    urlSearchParams.set("search", searchInput);
    router.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  const clearSearch = () => {
    urlSearchParams.delete("search");
    router.push(`${pathname}?${urlSearchParams.toString()}`);
    setSearchInput("");
  };

  const keyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      search();
    }
  };

  return (
    <div className="flex gap-2 w-full max-w-screen-sm min-w-fit justify-between">
      <div className="relative w-full">
        <Search className="text-slate-400 absolute top-1/2 left-2 transform -translate-y-1/2" />

        <Input
          value={searchInput}
          className="w-full pl-10 h-10 border-slate-500 bg-slate-50 py-2 text-sm md:text-base font-medium placeholder:text-slate-500/60 ring-offset-white focus-visible:ring-offset-2 focus-visible:ring-black focus-visible:ring-2"
          placeholder="Search hypercerts"
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={keyDownHandler}
        />
        {searchInput && (
          <X
            className="text-slate-400 absolute top-1/2 right-2 transform -translate-y-1/2 h-7 w-7 cursor-pointer hover:bg-slate-100 p-1 rounded-sm"
            onClick={clearSearch}
          />
        )}
      </div>
      <Button className="rounded-md" onClick={search}>
        Search
      </Button>
    </div>
  );
}
