"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { FormattedUnits } from "../formatted-units";
import { HypercertState } from "@/hypercerts/fragments/hypercert-state.fragment";
import { getAddress, isAddress } from "viem";
import { useGetUser } from "@/users/hooks";
import { Skeleton } from "../ui/skeleton";
import { UserIcon } from "../user-icon";
import { ImageIcon } from "../user-icon/ImageIcon";
import { SvgIcon } from "../user-icon/SvgIcon";
import EthAddress from "../eth-address";
import { UserName } from "../user-name";
const MAX_FRACTIONS_DISPLAYED = 5;

function Fraction({
  ownerAddress,
  totalUnits,
  units,
}: {
  ownerAddress: string;
  totalUnits: string | null | undefined;
  units: string | null | undefined;
}) {
  const address = isAddress(ownerAddress.trim())
    ? getAddress(ownerAddress.trim())
    : undefined;

  const { data: userData, isFetching } = useGetUser({
    address: address,
  });

  if (isFetching) {
    return (
      <div className="flex flex-row gap-2 items-center">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }
  return (
    <>
      {userData?.user ? (
        <div className="flex flex-row gap-2">
          {userData?.user?.avatar ? (
            <ImageIcon url={userData.user.avatar} size="tiny" />
          ) : (
            <SvgIcon size="tiny" />
          )}
          <div className="flex justify-center items-start">
            <UserName
              address={userData.user.address}
              userName={userData.user.display_name}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center gap-2">
          <UserIcon address={address} size="tiny" />
          <EthAddress address={address} showEnsName={true} />
        </div>
      )}
      &mdash; <FormattedUnits>{units as string}</FormattedUnits>
    </>
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
                <Fraction
                  ownerAddress={fraction.owner_address as string}
                  totalUnits={hypercert.units}
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
