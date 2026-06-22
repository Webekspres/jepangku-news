import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-lg border border-jepang-border bg-white px-4 py-3 text-base text-jepang-navy transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-jepang-muted focus:border-jepang-navy focus:outline-none focus:ring-2 focus:ring-jepang-orange/20 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
