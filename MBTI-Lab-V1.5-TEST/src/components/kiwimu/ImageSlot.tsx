import * as React from "react"
import { cn } from "@/lib/utils"

type ImageSlotType =
  | "character"
  | "dessert"
  | "cover"
  | "avatar"
  | "thumbnail"

interface ImageSlotProps {
  type: ImageSlotType
  aspect: "1/1" | "4/3" | "3/4" | "16/9" | "2/3"
  alt: string
  src?: string
  className?: string
}

const aspectClasses: Record<ImageSlotProps["aspect"], string> = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-video",
  "2/3": "aspect-[2/3]",
}

const typeLabels: Record<ImageSlotType, string> = {
  character: "CHARACTER",
  dessert: "DESSERT",
  cover: "COVER",
  avatar: "AVATAR",
  thumbnail: "THUMBNAIL",
}

function ImageSlot({ type, aspect, alt, src, className }: ImageSlotProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border-[1.5px] border-ink",
        aspectClasses[aspect],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper">
          <div
            className="h-8 w-8 rounded-full border-[1.5px] border-ink/30"
            aria-hidden
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
            {typeLabels[type]}
          </span>
        </div>
      )}
    </div>
  )
}

export { ImageSlot }
export type { ImageSlotType, ImageSlotProps }
