import { Badge } from "@/components/ui/badge";
import React from "react";

export default function Tags({
  tags,
  ...props
}: {
  tags?: string[];
  [key: string]: any;
}) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap items-start w-full gap-1" {...props}>
      {tags.map((tag, index) => (
        <Badge variant="secondary" key={index} className="text-xs py-0 px-2">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
