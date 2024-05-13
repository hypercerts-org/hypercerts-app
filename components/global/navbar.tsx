"use client";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/configs/site";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletProfile } from "@/components/wallet-profile";

const Navbar = () => {
  const currentPath = usePathname();

  return (
    <nav className="flex items-center justify-between p-8 md:px-24">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <span className="font-bold tex-base md:text-xl tracking-tight">
            Hypercerts
          </span>
        </Link>
        <div className="hidden md:flex items-center space-x-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`${buttonVariants({
                variant: "link",
              })} group text-lg duration-300 ease-out opacity-70 hover:opacity-100}`}
            >
              Create <ChevronDown size={18} className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className={
                  currentPath === siteConfig.links.createHypercert
                    ? "bg-accent"
                    : "bg-transparent"
                }
              >
                <Link
                  href={siteConfig.links.createHypercert}
                  className="h-full w-full"
                >
                  New Hypercert
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
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
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <WalletProfile />
      </div>
    </nav>
  );
};

export { Navbar as default };
