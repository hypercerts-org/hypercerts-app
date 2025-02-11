"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";
import rehypeSanitize from "rehype-sanitize";

export default function ReadMore({
  text,
  length = 280,
}: {
  text: string | null | undefined;
  length?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  console.log(text);

  if (!text) {
    return null;
  }

  if (text.length <= length) {
    return <MDEditor.Markdown source={text} />;
  }

  // Find the last safe breakpoint before any markdown syntax
  const findLastBreakpoint = (text: string, maxLength: number) => {
    const substring = text.substring(0, maxLength);

    // Look for markdown syntax to avoid cutting in the middle
    const markdownStart = substring.search(/(!?\[|#{1,6}\s|```)/);
    const searchEnd = markdownStart > 0 ? markdownStart : maxLength;

    // Find the last line break or sentence end
    const lastLineBreak = substring.lastIndexOf("\n", searchEnd);
    const lastPeriod = substring.lastIndexOf(". ", searchEnd);
    const lastBreak = Math.max(lastLineBreak, lastPeriod);

    return lastBreak > 0 ? lastBreak + 1 : searchEnd;
  };

  const cutoffPoint = findLastBreakpoint(text, length);
  const cutoffText = text.substring(0, cutoffPoint);

  return (
    <div className="flex flex-col">
      {!isOpen && <MDEditor.Markdown source={cutoffText} />}
      <Collapsible onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <MDEditor.Markdown source={text} rehypePlugins={[rehypeSanitize]} />
        </CollapsibleContent>
        <CollapsibleTrigger className="text-blue-600 hover:underline text-xs lg:text-sm">
          {isOpen ? "Read less" : "Read more"}
        </CollapsibleTrigger>
      </Collapsible>
    </div>
  );
}
