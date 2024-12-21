"use client";

import { truncate } from "lodash";
import { useState, useMemo } from "react";

interface CommentsProps {
  comments?: string;
}

export default function Comments({ comments }: CommentsProps) {
  const [showFullComments, setShowFullComments] = useState(false);

  const { truncatedComments, isTruncated } = useMemo(() => {
    if (!comments) return { truncatedComments: "", isTruncated: false };
    const truncated = truncate(comments, {
      length: 150,
      separator: "...",
    });
    return {
      truncatedComments: truncated,
      isTruncated: truncated !== comments,
    };
  }, [comments]);

  if (!comments)
    return (
      <div className="flex flex-col h-[120px]">
        <div
          className={`center text-sm text-slate-400 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100`}
        >
          No comments submitted
        </div>
      </div>
    );

  return (
    <div className="flex flex-col h-[120px]">
      <div
        className={`text-sm text-slate-700 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100`}
      >
        {showFullComments ? comments : truncatedComments}
      </div>
      {isTruncated && (
        <button
          className="text-xs font-medium text-slate-700 hover:underline mt-2"
          onClick={() => setShowFullComments(!showFullComments)}
          aria-expanded={showFullComments}
        >
          {showFullComments ? "Show less" : "Show full comments"}
        </button>
      )}
    </div>
  );
}
