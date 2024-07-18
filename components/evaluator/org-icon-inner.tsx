"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import { AttestorOrganisation } from "../../github/types/attestor-organisation.type";

export default function OrgIconInner({ org }: { org: AttestorOrganisation }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar className="h-8 w-8">
            <AvatarImage src={org.logo_url} alt={org.name} />
            <AvatarFallback>{org.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          {org.description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
