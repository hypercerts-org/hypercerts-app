"use client";

import { truncate } from "lodash";
import { useState } from "react";

interface CommentsProps {
  comments?: string;
}

export default function Comments({ comments }: CommentsProps) {
  const [showFullComments, setShowFullComments] = useState(false);
  if (!comments) return null;

  const truncatedComments = truncate(comments, {
    length: 200,
    separator: "...",
  });

  const showFullCommentsButton = showFullComments ? (
    <button
      className="text-xs font-medium text-slate-700"
      onClick={() => setShowFullComments(false)}
    >
      Show less
    </button>
  ) : (
    <button
      className="text-xs font-medium text-slate-700"
      onClick={() => setShowFullComments(true)}
    >
      Show full comments
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="overflow-hidden text-sm text-slate-700">
          {showFullComments ? comments : truncatedComments}
        </div>
      </div>
      <div>
        <div className="flex justify-center">{showFullCommentsButton}</div>
      </div>
    </div>
  );
}
