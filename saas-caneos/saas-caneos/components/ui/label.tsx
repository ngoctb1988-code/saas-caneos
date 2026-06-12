"use client";
import * as React from "react";
import * as LP from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
const Label = React.forwardRef<React.ElementRef<typeof LP.Root>, React.ComponentPropsWithoutRef<typeof LP.Root>>(
  ({ className, ...props }, ref) => (
    <LP.Root ref={ref} className={cn("text-sm font-medium leading-none text-foreground/90 peer-disabled:opacity-70", className)} {...props} />
  ));
Label.displayName = "Label";
export { Label };
