import { Button } from "@/components/ui/button";
import { siteConfig } from "@/configs/site";
import Link from "next/link";
import React from "react";

export const CreateBlueprintButton = () => {
  return (
    <Button
      className="hover:text-white rounded-sm bg-white text-black border border-slate-300"
      asChild
    >
      <Link href={siteConfig.links.createBlueprint}>Create blueprint</Link>
    </Button>
  );
};
