import React, { useState, useEffect } from "react"
import { AnimatePresence } from "motion/react"
import { quizA, quizB } from "@/src/data"
import type { QuizType, Dimension } from "@/src/types"
import { V2Landing } from "./V2Landing"
import { V2QuizQuestion } from "./V2QuizQuestion"
import { V2TransitionBeat } from "./V2TransitionBeat"
import { V2ResultPage } from "./V2ResultPage"

type V2Step = "landing" | "quiz" | "transition" | "result"

export default function V2App() {
  const [step, setStep] = useState<V2Step>("landing")
  const [quiz, setQuiz] = useState<QuizType>(quizA)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Dimension[]>([])
  const [currentVisual, setCurrentVisual] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const v = params.get("v")
    if (v === "A") setQuiz(quizA)
    else if (v === "B") setQuiz(quizB)
    else setQuiz(Math.random() > 0.5 ? quizA : quizB)
  }, [])

  const handleStart = () => {
    setStep("quiz")
    setCurrentIndex(0)
    setAnswers([])
  }

  const handleAnswer = (value: Dimension, visual: string) => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)
    setCurrentVisual(visual)
    setStep("transition")

    setTimeout(() => {
      if (currentIndex < quiz.questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setStep("quiz")
      } else {
        setStep("result")
      }
    }, 2000)
  }

  const handleReset = () => {
    setStep("landing")
    setAnswers([])
    setCurrentIndex(0)
    const params = new URLSearchParams(window.location.search)
    if (!params.get("v")) {
      setQuiz(Math.random() > 0.5 ? quizA : quizB)
    }
  }

  const calculateResult = () => {
    if (answers.length < 5) return { type: "INFP", aOrT: "A" as "A" | "T" }
    const type = `${answers[0]}${answers[1]}${answers[2]}${answers[3]}`
    const aOrT = answers[4] as "A" | "T"
    return { type, aOrT }
  }

  return (
    <div className="min-h-screen font-sans selection:bg-acid selection:text-ink flex flex-col items-center justify-center p-4 pt-20 pb-12">
      {/* Top Marquee */}
      <div className="marquee-container">
        <div className="marquee-track">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="marquee-text">
              KIWIMU MBTI LAB V2 // SOUL DESSERT // YZ GENERATION //
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "landing" && (
          <React.Fragment key="landing">
            <V2Landing quiz={quiz} onStart={handleStart} />
          </React.Fragment>
        )}

        {step === "quiz" && (
          <React.Fragment key={`quiz-${currentIndex}`}>
            <V2QuizQuestion
              question={quiz.questions[currentIndex]}
              currentIndex={currentIndex}
              total={quiz.questions.length}
              onAnswer={handleAnswer}
            />
          </React.Fragment>
        )}

        {step === "transition" && (
          <React.Fragment key="transition">
            <V2TransitionBeat
              visual={currentVisual}
              currentIndex={currentIndex}
              total={quiz.questions.length}
            />
          </React.Fragment>
        )}

        {step === "result" && (() => {
          const { type, aOrT } = calculateResult()
          return (
            <React.Fragment key="result">
              <V2ResultPage
                type={type}
                aOrT={aOrT}
                answers={answers}
                onReset={handleReset}
              />
            </React.Fragment>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
