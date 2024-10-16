"use client";
import { PropsWithChildren } from "react";
import { useAccount } from "wagmi";

export const OwnAccountOnly = ({
  children,
  addressToMatch,
}: PropsWithChildren<{ addressToMatch: string }>) => {
  const { address: currentUserAddress } = useAccount();
  if (currentUserAddress !== addressToMatch) {
    return null;
  }

  return <>{children}</>;
};
