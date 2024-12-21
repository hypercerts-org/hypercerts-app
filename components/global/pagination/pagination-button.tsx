import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import Link from "next/link";

interface PaginationButtonProps {
  href?: string;
  arrow?: "left" | "right";
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export default function PaginationButton({
  href,
  arrow,
  children,
  active,
  onClick,
}: PaginationButtonProps) {
  const buttonContent = (
    <Button
      aria-label={typeof children === "string" ? children : undefined}
      className={`flex items-center gap-2 ${active ? "bg-primary text-primary-foreground" : ""}`}
      size="sm"
      onClick={onClick}
    >
      {arrow === "left" && (
        <ChevronLeft style={{ width: "10px", height: "10px" }} />
      )}
      {children}
      {arrow === "right" && (
        <ChevronRight style={{ width: "10px", height: "10px" }} />
      )}
    </Button>
  );

  if (href) {
    return (
      <Link href={href} prefetch={true}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}
