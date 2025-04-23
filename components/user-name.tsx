import React from "react";
import { CopyButton } from "./copy-button";

export function UserName({
  address,
  userName,
}: {
  address: string | undefined | null;
  userName: string | undefined | null;
}) {
  const copyAddress = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    void navigator.clipboard.writeText(address as string);
  };

  if (!address) {
    return <div>Unknown</div>;
  }
  return (
    <div className="flex items-center gap-2 content-center cursor-pointer px-1 py-0.5 bg-slate-100 rounded-md w-max text-sm">
      <div onClick={copyAddress}>
        <p>{userName}</p>
      </div>
      <CopyButton
        textToCopy={address}
        className="w-4 h-4 bg-transparent focus:opacity-70 focus:scale-90"
      />
    </div>
  );
}
