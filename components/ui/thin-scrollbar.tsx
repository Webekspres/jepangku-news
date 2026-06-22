import * as React from "react";
import { cn } from "@/lib/utils";

export const THIN_SCROLLBAR_CLASS = "thin-scrollbar";

export type ThinScrollbarProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
};

/** Wrapper scrollable dengan scrollbar tipis (Firefox + WebKit). */
export function ThinScrollbar({
  as: Component = "div",
  className,
  ...props
}: ThinScrollbarProps) {
  return (
    <Component className={cn(THIN_SCROLLBAR_CLASS, className)} {...props} />
  );
}
