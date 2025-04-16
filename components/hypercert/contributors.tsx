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
import { getAddress, isAddress } from "viem";
import { HypercertState } from "@/hypercerts/fragments/hypercert-state.fragment";
import { useGetUser } from "@/users/hooks";
import { UserIcon } from "../user-icon";
import { ImageIcon } from "../user-icon/ImageIcon";
import { SvgIcon } from "../user-icon/SvgIcon";
import { Skeleton } from "../ui/skeleton";
import { UserName } from "../user-name";
const MAX_CONTRIBUTORS_DISPLAYED = 10;

function Contributor({ contributor }: { contributor: string }) {
  const address = isAddress(contributor.trim())
    ? getAddress(contributor.trim())
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

  return userData?.user ? (
    <div className="flex gap-2">
      {userData.user.avatar ? (
        <ImageIcon url={userData.user.avatar} size="tiny" />
      ) : (
        <SvgIcon size="tiny" />
      )}
      <div className="flex flex-col justify-center items-start">
        <UserName
          address={userData.user.address}
          userName={userData.user.display_name}
        />
      </div>
    </div>
  ) : address ? (
    <div className="flex gap-2">
      <UserIcon address={address} size="tiny" />
      <div className="flex flex-col justify-center items-start">
        <EthAddress address={address} showEnsName={true} />
      </div>
    </div>
  ) : (
    <div className="flex items-center flex-row">
      <UserCircle2 className="mr-2 h-4 w-4" />
      {contributor}
    </div>
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
                <Contributor contributor={contributor} />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </section>
  );
}
