import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type KiwimuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "acid" | "ghost"
  size?: "sm" | "md" | "lg"
}

function KiwimuButton({
  className,
  variant = "default",
  size = "md",
  ...props
}: KiwimuButtonProps) {
  const sizeClasses = {
    sm: "h-8 px-4 text-sm",
    md: "h-10 px-6 text-sm",
    lg: "h-12 px-8 text-base",
  }

  const variantClasses = {
    default: [
      "bg-white border-[1.5px] border-ink text-ink",
      "shadow-[2px_2px_0px_var(--color-ink)]",
      "hover:bg-paper hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_var(--color-ink)]",
      "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
    ].join(" "),
    acid: [
      "bg-acid border-[1.5px] border-ink text-ink",
      "shadow-[2px_2px_0px_var(--color-ink)]",
      "hover:bg-ink hover:text-acid hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_var(--color-ink)]",
      "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
    ].join(" "),
    ghost: [
      "bg-transparent border-[1.5px] border-ink/30 text-ink",
      "hover:border-ink hover:bg-paper",
    ].join(" "),
  }

  return (
    <Button
      asChild={false}
      variant="outline"
      className={cn(
        "rounded-full font-sans font-medium transition-all duration-200",
        "cursor-pointer select-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { KiwimuButton }
