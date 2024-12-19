"use client";

import { CopyButton } from "./copy-button";
import { useEnsName } from "wagmi";
import { truncateEthereumAddress } from "@/lib/utils";

export default function EthAddress({
  address,
  showEnsName = false,
}: {
  address?: string | undefined | null;
  showEnsName?: boolean;
  [key: string]: any;
}) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: 1,
  });

  if (!address) {
    return <div>Unknown</div>;
  }

  const copyAddress = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    void navigator.clipboard.writeText(address);
  };

  return (
    <div className="flex items-center gap-2 content-center cursor-pointer px-1 py-0.5 bg-slate-100 rounded-md w-max text-sm">
      <div onClick={copyAddress}>
        {showEnsName && ensName
          ? ensName
          : truncateEthereumAddress(address as `0x${string}`)}
      </div>
      <CopyButton
        textToCopy={address}
        className="w-4 h-4 bg-transparent focus:opacity-70 focus:scale-90"
      />
    </div>
  );
}
