"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ChainDisplay from "@/components/chain-display";
import Image from "next/image";
import Link from "next/link";
import { WalletProfile } from "@/components/wallet-profile";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/configs/site";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

const Navbar = () => {
  const currentPath = usePathname();
  const { address } = useAccount();

  return (
    <nav className="flex items-center justify-between p-3 md:px-24 border-b-[1.5px] border-black">
      <div className="flex items-center space-x-6 w-full">
        <Link href="/">
          <div className="relative flex space-x-1">
            <Image
              src="/hypercerts-logo.png"
              width={20}
              height={20}
              alt="Hypercerts mark"
              className="w-6 h-6"
            />
            <span className="font-semibold text-base md:text-xl tracking-tight">
              Hypercerts
            </span>
          </div>
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
              currentPath === siteConfig.links.explore
                ? "opacity-1 font-semibold hover:opacity-100"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span className="hover:underline">Create hypercert</span>
          </Link>

          {address && (
            <Link
              key={siteConfig.links.profile}
              href={`${siteConfig.links.profile}/${address}`}
              className={`${buttonVariants({ variant: "link" })} text-lg ${
                currentPath === siteConfig.links.explore
                  ? "opacity-1 font-semibold hover:opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <span className="hover:underline">My hypercerts</span>
            </Link>
          )}

          {/*<DropdownMenu>*/}
          {/*  <DropdownMenuTrigger*/}
          {/*    className={`${buttonVariants({*/}
          {/*      variant: "link",*/}
          {/*    })} group text-lg duration-300 ease-out opacity-70 hover:opacity-100}`}*/}
          {/*  >*/}
          {/*    Create <ChevronDown size={18} className="ml-1" />*/}
          {/*  </DropdownMenuTrigger>*/}
          {/*  <DropdownMenuContent>*/}
          {/*    <DropdownMenuItem*/}
          {/*      className={*/}
          {/*        currentPath === siteConfig.links.createHypercert*/}
          {/*          ? "bg-accent"*/}
          {/*          : "bg-transparent"*/}
          {/*      }*/}
          {/*    >*/}
          {/*      <Link*/}
          {/*        href={siteConfig.links.createHypercert}*/}
          {/*        className="h-full w-full"*/}
          {/*      >*/}
          {/*        New Hypercert*/}
          {/*      </Link>*/}
          {/*    </DropdownMenuItem>*/}
          {/* <DropdownMenuItem
                className={
                  currentPath === siteConfig.links.createHyperboard
                    ? "bg-accent"
                    : "bg-transparent"
                }
              >
                <Link
                  href={siteConfig.links.createHyperboard}
                  className="h-full w-full"
                >
                  New Hyperboard
                </Link>
              </DropdownMenuItem> */}
          {/*  </DropdownMenuContent>*/}
          {/*</DropdownMenu>*/}
          <a
            href={siteConfig.links.docs}
            key={siteConfig.links.docs}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonVariants({
              variant: "link",
            })} group text-lg duration-300 ease-out opacity-70 hover:opacity-100}`}
          >
            <span>Docs</span>
            <ArrowUpRight
              size={18}
              className="ml-1 opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-transform duration-300 ease-in-out"
              aria-hidden="true"
            />
          </a>
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
