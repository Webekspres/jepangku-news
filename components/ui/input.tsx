import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full border border-[#E4E4E7] bg-white px-4 py-3 text-base text-[#0A0A0A] font-[IBM_Plex_Sans,sans-serif] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#52525B] focus:border-[#0A0A0A] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
