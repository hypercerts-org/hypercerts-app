import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationButtonProps {
  href?: string;
  arrow?: "left" | "right";
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function PaginationButton({
  href,
  arrow,
  children,
  active,
  onClick,
  disabled,
}: PaginationButtonProps) {
  const buttonContent = (
    <Button
      aria-label={typeof children === "string" ? children : undefined}
      className={cn(
        "flex items-center gap-2 border-black border-2",
        active && "bg-white text-black cursor-default hover:bg-white",
      )}
      size="sm"
      onClick={onClick}
      disabled={disabled}
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

  if (href && !active && !disabled) {
    return (
      <Link href={href} prefetch={true}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}
