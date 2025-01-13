"use client";

import { ArrowUpRight } from "lucide-react";

import ChainDisplay from "@/components/chain-display";
import { buttonVariants } from "@/components/ui/button";
import { WalletProfile } from "@/components/wallet-profile";
import { siteConfig } from "@/configs/site";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navbar = () => {
  const currentPath = usePathname();
  const { address } = useAccount();

  return (
    <nav className="flex items-center justify-between p-3 md:px-24 border-b-[1.5px] border-black">
      <div className="flex items-center space-x-6 w-full">
        <Link href="/">
          <Image
            src="/hypercerts-header-logo.svg"
            width={120}
            height={50}
            alt="Hypercerts logo"
            className="min-w-[120px] lg:min-w-[160px]"
          />
        </Link>
        <div className="hidden md:flex items-center justify-center space-x-2 w-full">
          <Link
            key={siteConfig.links.explore}
            href={siteConfig.links.explore}
            className={`${buttonVariants({ variant: "link" })} text-lg ${
              currentPath === siteConfig.links.explore
                ? "opacity-1 font-semibold hover:opacity-100"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span className="hover:underline">Explore</span>
          </Link>
          <Link
            key={siteConfig.links.createHypercert}
            href={siteConfig.links.createHypercert}
            className={`${buttonVariants({ variant: "link" })} text-lg ${
              currentPath === siteConfig.links.createHypercert
                ? "opacity-1 font-semibold hover:opacity-100"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span className="hover:underline">Create</span>
          </Link>

          {address ? (
            <Link
              key={siteConfig.links.profile}
              href={`${siteConfig.links.profile}/${address}`}
              className={`${buttonVariants({ variant: "link" })} text-lg ${
                currentPath === siteConfig.links.profile
                  ? "opacity-1 font-semibold hover:opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <span className="hover:underline">My hypercerts</span>
            </Link>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`${buttonVariants({ variant: "link" })} opacity-50 cursor-help`}
                  >
                    My hypercerts
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  Click the &quot;Connect Wallet&quot; button and sign in to
                  access your hypercerts
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Link
            href={siteConfig.links.docs}
            key={siteConfig.links.docs}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonVariants({ variant: "link" })} text-lg opacity-70 hover:opacity-100`}
          >
            <span className="hover:underline">Docs</span>
            <ArrowUpRight
              size={18}
              className="ml-1 opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-transform duration-300 ease-in-out"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
      <div className="hidden md:flex items-center space-x-4">
        <ChainDisplay />
        <WalletProfile />
      </div>
    </nav>
  );
};

export { Navbar as default };
