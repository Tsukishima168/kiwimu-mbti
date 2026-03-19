import * as React from "react"
import { motion } from "motion/react"
import { KiwimuProgress } from "@/src/components/kiwimu"
import { KiwimuStable } from "./KiwimuCharacter"

interface V2TransitionBeatProps {
  visual: string
  currentIndex: number
  total: number
}

export function V2TransitionBeat({ visual, currentIndex, total }: V2TransitionBeatProps) {
  const progress = Math.round(((currentIndex + 1) / total) * 100)
  const currentModule = currentIndex + 1

  return (
    <motion.div
      key="v2-transition"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-md w-full flex flex-col items-center justify-center text-center space-y-8 py-16"
    >
      {/* Kiwimu character */}
      <div className="w-32 h-32 rounded-full border-[1.5px] border-ink bg-acid flex items-center justify-center shadow-[4px_4px_0px_#1A1A1A] p-4">
        <KiwimuStable />
      </div>

      {/* Visual response text */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-ink text-paper px-6 py-4 font-display font-medium text-base tracking-wide border-[1.5px] border-ink shadow-[4px_4px_0px_#CCFF00] rounded-2xl max-w-xs"
      >
        {visual}
      </motion.div>

      {/* Progress */}
      <div className="w-full space-y-1">
        <KiwimuProgress
          value={progress}
          currentModule={currentModule}
          className="w-full"
        />
        <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest text-center pt-1">
          {currentModule} / {total} 完成
        </p>
      </div>
    </motion.div>
  )
}
