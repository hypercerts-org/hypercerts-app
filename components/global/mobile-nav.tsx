"use client";
import ChainDisplay from "@/components/chain-display";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { WalletProfile } from "@/components/wallet-profile";
import { siteConfig } from "@/configs/site";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ArrowUpRight, Menu } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";

const MobileNav = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { address } = useAccount();

  if (isDesktop) return null;

  return (
    <Menubar className="h-14 fixed bottom-4 left-4 right-4 md:hidden backdrop-blur-sm py-3 border-[1.5px] border-slate-300 bg-slate-50/70 justify-between z-10">
      <MenubarMenu>
        <MenubarTrigger
          aria-label="Menu"
          className="focus:bg-accent data-[state=open]:bg-accent"
        >
          <Menu size={24} className="mr-1" /> Menu
        </MenubarTrigger>
        <MenubarContent>
          <Link href={siteConfig.links.explore} className="w-full h-full">
            <MenubarItem>Explore</MenubarItem>
          </Link>
          <MenubarSeparator />
          <Link
            key={siteConfig.links.createHypercert}
            href={siteConfig.links.createHypercert}
          >
            <MenubarItem>Create hypercert</MenubarItem>
          </Link>
          <Link
            key={siteConfig.links.createCollection}
            href={siteConfig.links.createCollection}
          >
            <MenubarItem>Create collection</MenubarItem>
          </Link>
          <Link
            key={siteConfig.links.createBlueprint}
            href={siteConfig.links.createBlueprint}
          >
            <MenubarItem>Create blueprint</MenubarItem>
          </Link>
          <MenubarSeparator />
          {address && (
            <Link
              key={siteConfig.links.profile}
              href={`${siteConfig.links.profile}/${address}`}
              className="w-full h-full"
            >
              <MenubarItem>Profile</MenubarItem>
            </Link>
          )}
          <MenubarSeparator />
          <Link
            href={siteConfig.links.docs}
            className="w-full h-full flex justify-between"
          >
            <MenubarItem>
              Docs
              <ArrowUpRight size={14} className="opacity-50" />
            </MenubarItem>
          </Link>
        </MenubarContent>
      </MenubarMenu>
      <section className="flex space-x-2">
        <ChainDisplay />
        <MenubarMenu>
          <div className="pr-2 py-0 bg-none data-[state=open]:bg-none focus:bg-none">
            <WalletProfile />
          </div>
        </MenubarMenu>
      </section>
    </Menubar>
  );
};

export { MobileNav as default };
