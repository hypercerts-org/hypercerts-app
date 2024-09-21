"use client";

import { CopyButton } from "@/components/copy-button";

export default function CopyableHypercertId({ id }: { id: string }) {
  const copyId = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    void navigator.clipboard.writeText(id);
  };

  return (
    <div className="flex items-center gap-2 content-center cursor-pointer px-1 py-0.5 bg-slate-100 rounded-md w-max text-sm">
      <div onClick={copyId}>{truncateHypercertId(id)}</div>
      <CopyButton
        textToCopy={id}
        className="w-4 h-4 bg-transparent focus:opacity-70 focus:scale-90"
      />
    </div>
  );
}

// Take first 4 and last 6 characters of the id
const truncateHypercertId = (id: string) => {
  return `${id.slice(0, 4)}...${id.slice(-6)}`;
};
