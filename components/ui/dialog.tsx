"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { dialogTransition, dialogVariants, overlayVariants } from "@/lib/motion";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

type DialogPortalProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Portal
> & {
  open: boolean;
};

function DialogPortal({ open, children, ...props }: DialogPortalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <DialogPrimitive.Portal forceMount {...props}>
          {children}
        </DialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay asChild forceMount {...props}>
    <motion.div
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={dialogTransition}
    />
  </DialogPrimitive.Overlay>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Content asChild forceMount {...props}>
    <motion.div
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 focus:outline-none",
        className,
      )}
      variants={dialogVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={dialogTransition}
    >
      {children}
    </motion.div>
  </DialogPrimitive.Content>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
};
