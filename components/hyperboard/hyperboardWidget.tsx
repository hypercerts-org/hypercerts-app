"use client";

import Script from "next/script";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import Script with no SSR to prevent hydration issues
const DynamicScript = dynamic(() => import("next/script"), { ssr: false });

export const HyperboardWidget = ({
  hyperboardId,
  showTable = false,
}: {
  hyperboardId: string;
  showTable?: boolean;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleScriptLoad = () => {
    setIsLoaded(true); // Update state when script loads
  };

  return (
    <div className="hyperboard-widget-container">
      <Script
        async
        src="https://staging.hyperboards.org/widget/hyperboard-widget.js"
        type="module"
        onLoad={handleScriptLoad} // Utilize onLoad to confirm script loading
      />
      {!isLoaded && <Skeleton className="h-12 w-48 rounded-md" />}
      {isLoaded && (
        <div
          className="hyperboard-widget"
          data-hyperboard-id={hyperboardId}
          data-hyperboard-show-table={showTable.toString()}
        ></div>
      )}
    </div>
  );
};
