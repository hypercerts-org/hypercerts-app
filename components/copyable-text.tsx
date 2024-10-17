"use client";

import { CopyButton } from "@/components/copy-button";

export default function CopyableText({ text }: { text: string }) {
  const copyId = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    void navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex items-center gap-2 content-center cursor-pointer px-1 py-0.5 bg-slate-100 rounded-md w-max text-sm">
      <div onClick={copyId}>{text}</div>
      <CopyButton
        textToCopy={text}
        className="w-4 h-4 bg-transparent focus:opacity-70 focus:scale-90"
      />
    </div>
  );
}
