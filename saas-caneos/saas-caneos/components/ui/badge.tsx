import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const v = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors", {
  variants: {
    variant: {
      default: "border-transparent bg-primary/10 text-primary",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      success: "border-transparent bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
      destructive: "border-transparent bg-destructive/12 text-destructive",
      warning: "border-transparent bg-amber-500/12 text-amber-700 dark:text-amber-400",
      outline: "text-foreground",
      muted: "border-transparent bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof v> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(v({ variant }), className)} {...props} />;
}
export { Badge };
