import { Button } from "./ui/button";
import { Copy } from "lucide-react";

import type { JSX } from "react";

export function CopyButton({
  textToCopy,
  ...props
}: {
  textToCopy?: string;
  [key: string]: any;
}): JSX.Element {
  return (
    <Button
      onClick={(event): void => {
        event.stopPropagation();
        if (!textToCopy) {
          return;
        }
        void navigator.clipboard.writeText(textToCopy);
        // toast({
        //   title: "Copied.",
        //   status: "info",
        //   duration: 1000,
        //   position: "top",
        // });
      }}
      variant={"outline"}
      size={"icon"}
      {...props}
    >
      <Copy />
    </Button>
  );
}
