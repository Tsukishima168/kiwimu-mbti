import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface KiwimuProgressProps {
  /** 0–100 overall progress */
  value: number
  /** Current active module (1-based, 1–5). If omitted, derived from value. */
  currentModule?: number
  className?: string
}

const TOTAL_MODULES = 5

function KiwimuProgress({ value, currentModule, className }: KiwimuProgressProps) {
  const activeModule =
    currentModule ?? (Math.ceil((value / 100) * TOTAL_MODULES) || 0)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Module dots */}
      <div className="flex items-center justify-between gap-1.5">
        {Array.from({ length: TOTAL_MODULES }, (_, i) => {
          const module = i + 1
          const isActive = module === activeModule
          const isDone = module < activeModule

          return (
            <div
              key={module}
              className={cn(
                "h-2 flex-1 rounded-full border-[1.5px] transition-all duration-300",
                isDone
                  ? "border-ink bg-ink"
                  : isActive
                    ? "border-ink bg-acid"
                    : "border-ink/20 bg-transparent"
              )}
              aria-label={`Module ${module}`}
            />
          )
        })}
      </div>

      {/* Thin overall progress bar */}
      <Progress
        value={value}
        className="h-[2px] bg-ink/10 [&>[data-slot=progress-indicator]]:bg-ink"
      />
    </div>
  )
}

export { KiwimuProgress }
