import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border border-jepang-border bg-white text-jepang-navy",
        red: "bg-jepang-red text-white",
        black: "bg-jepang-navy text-white",
        success: "bg-green-600 text-white",
        warning: "bg-amber-100 text-jepang-navy",
        muted: "bg-jepang-off-white text-jepang-muted",
        outline: "border border-jepang-border bg-white text-jepang-navy",
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
