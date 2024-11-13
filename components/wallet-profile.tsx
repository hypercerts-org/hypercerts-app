"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateEthereumAddress } from "@/lib/utils";
import ConnectDialog from "@/components/connect-dialog";
import DisconnectDialog from "@/components/disconnect-dialog";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/configs/site";
import AccountSelector from "@/components/accounts/account-selector";
import { useAccountDetails } from "@/hooks/useAccountDetails";

const WalletProfile = ({
  alignment = "end",
}: {
  alignment?: "end" | "center" | "start";
}) => {
  const { isConnecting, isDisconnected } = useAccount();
  const { address, displayName, ensName, ensAvatar } = useAccountDetails();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch by only showing content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);

  if (isConnecting || !mounted) return <Loader2 className="animate-spin" />;

  if (isDisconnected)
    return (
      <ConnectDialog isOpen={isConnectOpen} setIsOpen={setIsConnectOpen} />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"default"}
          size={"sm"}
          className="flex items-center justify-center space-x-2"
        >
          <div className="h-6 w-6 rounded-full relative overflow-hidden flex items-center border-[1.5px] border-white/60">
            <Avatar className="w-5 h-5 bg-stone-50">
              {ensAvatar && (
                <AvatarImage
                  src={ensAvatar}
                  alt="ENS Avatar"
                  className="object-center object-cover"
                />
              )}
              <AvatarFallback>
                <Image
                  src="/avatar-default.jpg"
                  alt="Default avatar"
                  fill
                  className="h-5 w-5 object-cover object-center"
                />
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="hidden md:block text-xs">
            {ensName || truncateEthereumAddress(address)}
          </p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-slate-50"
        align={alignment}
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {address ? truncateEthereumAddress(address) : "No address"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={`/profile/${address}`}>
            <DropdownMenuItem className="cursor-pointer">
              Profile
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setIsAccountSelectorOpen(true)}
          >
            Select Account
          </DropdownMenuItem>
          <Link href={siteConfig.links.settings}>
            <DropdownMenuItem className="cursor-pointer">
              Settings
            </DropdownMenuItem>
          </Link>
          <Link href={siteConfig.links.evaluators}>
            <DropdownMenuItem className="cursor-pointer">
              Evaluators
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DisconnectDialog
          isDisconnectOpen={isDisconnectOpen}
          setIsDisconnectOpen={setIsDisconnectOpen}
          setIsConnectOpen={setIsConnectOpen}
        />
      </DropdownMenuContent>
      <AccountSelector
        isOpen={isAccountSelectorOpen}
        setIsOpen={setIsAccountSelectorOpen}
      />
    </DropdownMenu>
  );
};

WalletProfile.displayName = "WalletProfile";

export { WalletProfile };
