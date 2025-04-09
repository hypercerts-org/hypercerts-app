import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Loading = () => {
  return (
    <main className="flex flex-col p-8 md:px-24 md:pt-14 pb-24 space-y-4 flex-1">
      {/* Hypercert Details Loading State */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image skeleton */}
          <Skeleton className="w-full md:w-[400px] h-[400px] rounded-lg" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" /> {/* Title */}
            <Skeleton className="h-4 w-1/4" /> {/* ID */}
            <Skeleton className="h-20 w-full" /> {/* Description */}
            {/* Work scope */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Sections Loading State */}
      <Accordion type="multiple" className="w-full">
        {/* Creator's Feed Section */}
        <AccordionItem value="creator-feed">
          <AccordionTrigger className="uppercase text-sm text-slate-500 font-medium tracking-wider">
            CREATOR&apos;S FEED
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Evaluations Section */}
        <AccordionItem value="evaluations">
          <AccordionTrigger className="uppercase text-sm text-slate-500 font-medium tracking-wider">
            EVALUATIONS
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Marketplace Section */}
        <AccordionItem value="marketplace-listings">
          <AccordionTrigger className="uppercase text-sm text-slate-500 font-medium tracking-wider">
            MARKETPLACE
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
};

export default Loading;
