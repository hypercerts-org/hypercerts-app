import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./ui/button";
import Link from "next/link";

export default function PaginationButton({
  href,
  arrow,
  children,
}: {
  href: string;
  arrow: "left" | "right";
  children: string;
}) {
  return (
    <Link href={href} prefetch={true}>
      <Button
        aria-label={children}
        className="flex items-center gap-2"
        size={"sm"}
      >
        {arrow === "left" && (
          <ChevronLeft style={{ width: "10px", height: "10px" }} />
        )}
        {children}
        {arrow === "right" && (
          <ChevronRight style={{ width: "10px", height: "10px" }} />
        )}
      </Button>
    </Link>
  );
}
