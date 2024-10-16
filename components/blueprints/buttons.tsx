import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export const CreateBlueprintButton = () => {
  return (
    <Button
      className="hover:text-white rounded-sm bg-white text-black border border-slate-300"
      asChild
    >
      <Link href="/blueprints/new">Create blueprint</Link>
    </Button>
  );
};
