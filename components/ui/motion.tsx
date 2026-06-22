"use client";

import * as React from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  chevronHoverTransition,
  imageHoverTransition,
  motionTransition,
  overlayVariants,
  popoverTransition,
  popoverVariants,
  slidePanelLeftVariants,
  slidePanelTopVariants,
} from "@/lib/motion";

type MotionOverlayProps = HTMLMotionProps<"button"> & {
  onDismiss?: () => void;
};

export const MotionOverlay = React.forwardRef<HTMLButtonElement, MotionOverlayProps>(
  ({ className, onDismiss, ...props }, ref) => (
    <motion.button
      ref={ref}
      type="button"
      aria-label="Tutup"
      className={cn("fixed inset-0 cursor-default", className)}
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={motionTransition}
      onClick={onDismiss}
      {...props}
    />
  ),
);
MotionOverlay.displayName = "MotionOverlay";

type MotionSlidePanelProps = HTMLMotionProps<"aside"> & {
  side?: "left" | "top";
};

export const MotionSlidePanel = React.forwardRef<HTMLElement, MotionSlidePanelProps>(
  ({ className, side = "left", ...props }, ref) => {
    const variants = side === "top" ? slidePanelTopVariants : slidePanelLeftVariants;

    return (
      <motion.aside
        ref={ref}
        className={className}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={motionTransition}
        {...props}
      />
    );
  },
);
MotionSlidePanel.displayName = "MotionSlidePanel";

type MotionPresenceLayerProps = {
  open: boolean;
  children: React.ReactNode;
};

export function MotionPresenceLayer({ open, children }: MotionPresenceLayerProps) {
  return <AnimatePresence>{open ? children : null}</AnimatePresence>;
}

export const MotionPopoverPanel = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      variants={popoverVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={popoverTransition}
      {...props}
    />
  ),
);
MotionPopoverPanel.displayName = "MotionPopoverPanel";

type MotionHoverScaleProps = HTMLMotionProps<"div"> & {
  scale?: number;
};

export const MotionHoverScale = React.forwardRef<HTMLDivElement, MotionHoverScaleProps>(
  ({ className, children, scale = 1.05, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      whileHover={{ scale }}
      transition={imageHoverTransition}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
MotionHoverScale.displayName = "MotionHoverScale";

export const MotionHoverChevron = React.forwardRef<
  HTMLSpanElement,
  HTMLMotionProps<"span">
>(({ className, children, ...props }, ref) => (
  <motion.span
    ref={ref}
    className={className}
    whileHover={{ x: 2 }}
    transition={chevronHoverTransition}
    {...props}
  >
    {children}
  </motion.span>
));
MotionHoverChevron.displayName = "MotionHoverChevron";

export { motion, AnimatePresence };
