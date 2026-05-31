import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#D90429] text-white hover:bg-[#B3001B]",
        black: "bg-[#0A0A0A] text-white hover:bg-[#52525B]",
        outline: "bg-white text-[#0A0A0A] border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white",
        ghost: "hover:bg-[#F4F4F5] hover:text-[#0A0A0A]",
        link: "text-[#D90429] underline-offset-4 hover:underline",
        destructive: "bg-[#D90429] text-white hover:bg-[#B3001B]",
        secondary: "bg-[#F4F4F5] text-[#0A0A0A] hover:bg-[#E4E4E7]",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-3 py-2 text-xs",
        lg: "px-8 py-4",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
