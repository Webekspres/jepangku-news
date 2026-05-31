import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center px-2 py-1 text-xs font-bold uppercase tracking-[0.05em] transition-colors",
  {
    variants: {
      variant: {
        default: "border border-[#0A0A0A] bg-white text-[#0A0A0A]",
        red: "bg-[#D90429] text-white",
        black: "bg-[#0A0A0A] text-white",
        success: "bg-green-600 text-white",
        warning: "bg-yellow-300 text-[#0A0A0A]",
        muted: "bg-zinc-200 text-[#0A0A0A]",
        outline: "border border-[#E4E4E7] bg-white text-[#0A0A0A]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
