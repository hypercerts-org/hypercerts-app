"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { truncateEthereumAddress } from "@/lib/utils";
import { UserCircle2 } from "lucide-react";
import { useState } from "react";
import { FormattedUnits } from "../formatted-units";
import { HypercertState } from "@/hypercerts/fragments/hypercert-state.fragment";

const MAX_FRACTIONS_DISPLAYED = 5;

function Fraction({
  ownerAddress,
  units,
}: {
  ownerAddress: string | null;
  units: unknown;
}) {
  return (
    <div className="flex flex-col w-full">
      {truncateEthereumAddress(ownerAddress as `0x${string}`)} &mdash;{" "}
      <FormattedUnits>{units as string}</FormattedUnits>
    </div>
  );
}

export default function Fractions({
  hypercert,
}: {
  hypercert: HypercertState;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (
    !hypercert ||
    !hypercert.fractions?.data ||
    hypercert.fractions.data.length === 0
  )
    return null;

  // if (hypercert.fractions.data.length <= MAX_FRACTIONS_DISPLAYED) {
  //   return (
  //     <div className="flex flex-col w-full">
  //       <span>Ownership</span>
  //       <div>
  //         {hypercert.fractions.data.map((fraction) => (
  //           <Fraction
  //             ownerAddress={fraction.owner_address}
  //             units={fraction.units}
  //             key={fraction.owner_address}
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <section className="flex flex-col gap-y-2 w-full max-w-[500px]">
      <h5 className="uppercase text-sm text-slate-500 font-medium tracking-wider">
        Owners
      </h5>
      <Command className="rounded-lg border-[1.5px] border-slate-200">
        <CommandInput placeholder="Find fraction owner..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {hypercert.fractions.data.map((fraction) => (
              <CommandItem
                key={fraction.fraction_id}
                title={fraction.owner_address || ""}
              >
                <UserCircle2 className="mr-2 h-4 w-4" />
                <span className="hidden">{fraction.owner_address}</span>
                <Fraction
                  ownerAddress={fraction.owner_address}
                  units={fraction.units}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </section>
  );
}
