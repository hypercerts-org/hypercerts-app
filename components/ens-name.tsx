"use client";

import { useEnsName } from "wagmi";

export default function EnsName({
  address,
  ...props
}: {
  address?: string;
  [key: string]: any;
}) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1,
  });

  if (!address || !ensName) return null;

  return <p {...props}>{ensName}</p>;
}
