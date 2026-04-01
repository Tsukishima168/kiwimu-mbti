import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type KiwimuBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "ink" | "acid" | "outline"
}

function KiwimuBadge({
  className,
  variant = "ink",
  ...props
}: KiwimuBadgeProps) {
  const variantClasses = {
    ink: "bg-ink text-acid border-ink",
    acid: "bg-acid text-ink border-ink",
    outline: "bg-transparent text-ink border-[1.5px] border-ink",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-xs font-medium uppercase tracking-widest",
        "rounded-full px-3 py-0.5",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { KiwimuBadge }
