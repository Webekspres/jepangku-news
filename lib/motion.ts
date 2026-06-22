import type { Transition, Variants } from "framer-motion";

export const easeOut = [0.32, 0.72, 0, 1] as const;

export const motionTransition: Transition = {
  duration: 0.3,
  ease: easeOut,
};

export const dialogTransition: Transition = {
  duration: 0.2,
  ease: easeOut,
};

export const imageHoverTransition: Transition = {
  duration: 0.5,
  ease: easeOut,
};

export const chevronHoverTransition: Transition = {
  duration: 0.2,
  ease: easeOut,
};

export const popoverTransition: Transition = {
  duration: 0.15,
  ease: easeOut,
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const dialogVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 8 },
};

export const slidePanelLeftVariants: Variants = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
};

export const slidePanelTopVariants: Variants = {
  initial: { y: "-100%" },
  animate: { y: 0 },
  exit: { y: "-100%" },
};

export const popoverVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};
