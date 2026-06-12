"use client";
import * as React from "react";
import * as SP from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";
const Separator = React.forwardRef<React.ElementRef<typeof SP.Root>, React.ComponentPropsWithoutRef<typeof SP.Root>>(
  ({ className, orientation="horizontal", decorative=true, ...props }, ref) => (
    <SP.Root ref={ref} decorative={decorative} orientation={orientation}
      className={cn("shrink-0 bg-border", orientation==="horizontal"?"h-[1px] w-full":"h-full w-[1px]", className)} {...props} />
  ));
Separator.displayName = "Separator";
export { Separator };
