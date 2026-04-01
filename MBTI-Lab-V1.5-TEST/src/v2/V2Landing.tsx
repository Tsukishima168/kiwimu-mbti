import * as React from "react"
import { motion } from "motion/react"
import { ScanFace } from "lucide-react"
import {
  KiwimuCard,
  KiwimuCardContent,
  KiwimuButton,
  KiwimuBadge,
} from "@/src/components/kiwimu"
import type { QuizType } from "@/src/types"

interface V2LandingProps {
  quiz: QuizType
  onStart: () => void
}

export function V2Landing({ quiz, onStart }: V2LandingProps) {
  return (
    <motion.div
      key="v2-landing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md w-full space-y-8"
    >
      <KiwimuCard className="relative overflow-hidden">
        {/* V2 BETA badge — top right */}
        <div className="absolute top-4 right-4 z-10">
          <KiwimuBadge variant="ink">V2 BETA</KiwimuBadge>
        </div>

        {/* Decorative acid circle */}
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-acid rounded-full border-[1.5px] border-ink opacity-60 mix-blend-multiply z-0" />

        <KiwimuCardContent className="p-8 space-y-8 relative z-10">
          <div className="space-y-2 pt-4">
            <p className="font-mono text-[10px] font-medium tracking-widest uppercase text-ink/50">
              Kiwimu MBTI Lab · V2
            </p>
            <h1 className="text-4xl font-display font-semibold tracking-tight leading-none uppercase text-ink">
              {quiz.title}
            </h1>
          </div>

          <p className="text-ink/70 font-medium leading-relaxed border-l-2 border-acid pl-4 text-sm">
            {quiz.description}
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-ink/50 font-mono text-[10px] uppercase tracking-widest">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-acid border border-ink" />
              5 個問題，找到你的靈魂甜點原型
            </div>
            <div className="flex items-center gap-2 text-ink/50 font-mono text-[10px] uppercase tracking-widest">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-acid border border-ink" />
              沒有對錯，只有最真實的你
            </div>
          </div>

          <KiwimuButton
            variant="acid"
            size="lg"
            onClick={onStart}
            className="w-full flex items-center justify-center gap-3 uppercase tracking-wider"
          >
            <ScanFace className="w-5 h-5" />
            開始掃描靈魂
          </KiwimuButton>
        </KiwimuCardContent>
      </KiwimuCard>

      <p className="text-center font-mono text-[10px] text-ink/40 uppercase tracking-widest">
        [ V2 · {quiz.id} · Kiwimu Lab 2026 ]
      </p>
    </motion.div>
  )
}
