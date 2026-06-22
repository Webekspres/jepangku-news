"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type AssetImageProps = Omit<ImageProps, "draggable">;

export default function AssetImage({
  className,
  onContextMenu,
  onDragStart,
  ...props
}: AssetImageProps) {
  return (
    <Image
      {...props}
      draggable={false}
      className={cn("asset-image", className)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.(e);
      }}
      onDragStart={(e) => {
        e.preventDefault();
        onDragStart?.(e);
      }}
    />
  );
}
