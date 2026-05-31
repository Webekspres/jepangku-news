import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-1 text-xs font-bold uppercase tracking-[0.05em] transition-colors",
  {
    variants: {
      variant: {
        default: "border border-foreground bg-white text-foreground",
        red: "bg-jepang-red text-white",
        black: "bg-foreground text-white",
        success: "bg-green-600 text-white",
        warning: "bg-yellow-300 text-foreground",
        muted: "bg-zinc-200 text-foreground",
        outline: "border border-jepang-border bg-white text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
