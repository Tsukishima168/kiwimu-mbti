import * as React from "react"
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KiwimuCardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "white" | "paper"
}

function KiwimuCard({ className, variant = "white", ...props }: KiwimuCardProps) {
  return (
    <Card
      className={cn(
        "rounded-3xl border-[1.5px] border-ink shadow-[6px_6px_0px_rgba(26,26,26,0.08)]",
        "transition-[box-shadow,transform] duration-300",
        "hover:shadow-[8px_8px_0px_rgba(26,26,26,0.1)] hover:-translate-y-0.5",
        variant === "paper" ? "bg-paper" : "bg-white",
        className
      )}
      {...props}
    />
  )
}

export {
  KiwimuCard,
  CardHeader as KiwimuCardHeader,
  CardContent as KiwimuCardContent,
  CardFooter as KiwimuCardFooter,
  CardTitle as KiwimuCardTitle,
  CardDescription as KiwimuCardDescription,
}
