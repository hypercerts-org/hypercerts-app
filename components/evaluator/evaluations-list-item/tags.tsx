import { Badge } from "../../ui/badge";
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
    <div className="flex flex-col items-start w-full" {...props}>
      <div className="flex items-start w-full gap-1" {...props}>
        {tags.map((tag, index) => (
          <Badge variant="secondary" key={index}>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
