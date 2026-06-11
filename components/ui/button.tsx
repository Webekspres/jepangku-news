import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jepang-orange/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border border-jepang-orange bg-jepang-orange text-white hover:border-jepang-orange-hover hover:bg-jepang-orange-hover",

        black:
          "border border-jepang-navy bg-jepang-navy text-white hover:bg-[#2a2668] hover:border-[#2a2668]",

        outline:
          "border border-jepang-border bg-white text-jepang-navy hover:border-jepang-orange hover:bg-jepang-orange hover:text-white",

        ghost:
          "text-jepang-navy hover:bg-jepang-off-white hover:text-jepang-red",

        link:
          "text-jepang-red underline-offset-4 hover:underline",

        destructive:
          "border border-jepang-red bg-jepang-red text-white hover:border-jepang-red-hover hover:bg-jepang-red-hover",

        secondary:
          "border border-jepang-border bg-jepang-off-white text-jepang-navy hover:border-jepang-grey hover:bg-jepang-border",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-3 py-2 text-xs",
        lg: "px-8 py-4",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
