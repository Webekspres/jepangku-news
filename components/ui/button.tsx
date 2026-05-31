import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border border-jepang-red bg-jepang-red text-white hover:border-jepang-red-hover hover:bg-jepang-red-hover",

        black:
          "border border-foreground bg-foreground text-white hover:border-jepang-muted hover:bg-jepang-muted",

        outline:
          "border border-foreground bg-white text-foreground hover:border-jepang-red hover:bg-jepang-red hover:text-white",

        ghost:
          "text-foreground hover:bg-jepang-off-white hover:text-jepang-red",

        link:
          "text-jepang-red underline-offset-4 hover:underline",

        destructive:
          "border border-jepang-red bg-jepang-red text-white hover:border-jepang-red-hover hover:bg-jepang-red-hover",

        secondary:
          "border border-jepang-border bg-jepang-off-white text-foreground hover:border-jepang-muted hover:bg-jepang-border",
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
