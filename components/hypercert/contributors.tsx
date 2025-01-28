"use client";

import EthAddress from "@/components/eth-address";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { UserCircle2 } from "lucide-react";
import { useState } from "react";
import { isAddress } from "viem";
import { HypercertState } from "@/hypercerts/fragments/hypercert-state.fragment";
const MAX_CONTRIBUTORS_DISPLAYED = 10;

function Contributor({ contributor }: { contributor: string }) {
  return isAddress(contributor) ? (
    <EthAddress address={contributor} />
  ) : (
    <div>{contributor}</div>
  );
}

export default function Contributors({
  hypercert,
}: {
  hypercert: HypercertState;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!hypercert || !hypercert.metadata?.contributors) return null;

  // if (hypercert.metadata?.contributors.length <= MAX_CONTRIBUTORS_DISPLAYED) {
  //   return (
  //     <div className="flex flex-col w-full">
  //       <span>Contributors</span>
  //       <div>
  //         {hypercert.metadata?.contributors.length === 0 && "No contributors"}
  //         {hypercert.metadata?.contributors.map((contributor) => (
  //           <Contributor contributor={contributor} key={contributor} />
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <section className="flex flex-col gap-y-2 w-full max-w-[500px]">
      <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
        Contributors
      </h5>
      <Command className="rounded-lg border-[1.5px] border-slate-200">
        <CommandInput placeholder="Find a contributor..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {hypercert.metadata?.contributors.map((contributor) => (
              <CommandItem key={contributor}>
                <UserCircle2 className="mr-2 h-4 w-4" />
                <Contributor contributor={contributor} />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </section>
  );
}
