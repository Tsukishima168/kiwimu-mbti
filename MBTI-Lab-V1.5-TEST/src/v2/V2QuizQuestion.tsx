import * as React from "react"
import { motion } from "motion/react"
import {
  KiwimuCard,
  KiwimuCardContent,
  KiwimuButton,
  KiwimuProgress,
} from "@/src/components/kiwimu"
import type { Question, Dimension } from "@/src/types"

interface V2QuizQuestionProps {
  question: Question
  currentIndex: number
  total: number
  onAnswer: (value: Dimension, visual: string) => void
}

export function V2QuizQuestion({
  question,
  currentIndex,
  total,
  onAnswer,
}: V2QuizQuestionProps) {
  const progress = Math.round(((currentIndex) / total) * 100)
  const currentModule = currentIndex + 1

  return (
    <motion.div
      key={`v2-q-${currentIndex}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md w-full space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between font-mono text-xs text-ink/50 border-b-[1.5px] border-ink/15 pb-3">
        <span>Q.{String(currentIndex + 1).padStart(2, "0")}</span>
        <KiwimuProgress
          value={progress}
          currentModule={currentModule}
          className="flex-1 mx-4"
        />
        <span>{String(total).padStart(2, "0")}</span>
      </div>

      {/* Question */}
      <KiwimuCard>
        <KiwimuCardContent className="p-6 space-y-6">
          <p className="font-display text-xl font-medium leading-snug text-ink">
            {question.text}
          </p>

          <div className="space-y-3 pt-2">
            {question.options.map((option, idx) => (
              <KiwimuButton
                key={idx}
                variant="default"
                size="lg"
                onClick={() => onAnswer(option.value, option.visual)}
                className="w-full justify-start text-left leading-relaxed whitespace-normal h-auto py-4 px-5 rounded-2xl"
              >
                <span className="font-mono text-[10px] text-ink/40 uppercase tracking-widest mr-3 shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-medium text-ink">{option.text}</span>
              </KiwimuButton>
            ))}
          </div>
        </KiwimuCardContent>
      </KiwimuCard>

      <p className="text-center font-mono text-[10px] text-ink/30 uppercase tracking-widest">
        {question.dimension} · Kiwimu Lab
      </p>
    </motion.div>
  )
}
