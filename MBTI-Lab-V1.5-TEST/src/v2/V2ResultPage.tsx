import * as React from "react"
import { motion } from "motion/react"
import { RotateCcw, Share2, ShoppingBag } from "lucide-react"
import {
  KiwimuCard,
  KiwimuCardContent,
  KiwimuButton,
  KiwimuBadge,
  KiwimuProgress,
  ImageSlot,
} from "@/src/components/kiwimu"
import { personalities, kiwimuStates } from "@/src/data"
import { KiwimuStable, KiwimuAnxious } from "./KiwimuCharacter"
import type { Dimension } from "@/src/types"

// --- TypeBadge ---
function TypeBadge({ type, aOrT }: { type: string; aOrT: "A" | "T" }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="font-mono text-2xl font-bold tracking-widest text-ink uppercase">
        {type}
      </span>
      <span className="font-mono text-sm font-medium text-ink/50 border-[1.5px] border-ink/30 rounded-full px-2 py-0.5">
        -{aOrT}
      </span>
    </div>
  )
}

// --- V2HeroBlock ---
function V2HeroBlock({
  type,
  aOrT,
  kiwimuSays,
}: {
  type: string
  aOrT: "A" | "T"
  kiwimuSays: string
}) {
  return (
    <KiwimuCard>
      <KiwimuCardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <KiwimuBadge variant="ink">靈魂掃描結果</KiwimuBadge>
            <div className="pt-2">
              <TypeBadge type={type} aOrT={aOrT} />
            </div>
          </div>
          <div className="w-24 h-24 shrink-0">
            <ImageSlot type="character" aspect="1/1" alt={`${type} character`} />
          </div>
        </div>

        {/* Kiwimu character SVG */}
        <div className="flex justify-center py-4">
          <div className="w-40 h-40 rounded-full border-[1.5px] border-ink bg-acid/30 flex items-center justify-center p-4">
            {aOrT === "A" ? <KiwimuStable /> : <KiwimuAnxious />}
          </div>
        </div>

        {/* Soul quote */}
        <div className="border-l-2 border-acid pl-4 py-1">
          <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest mb-1">
            Kiwimu Says
          </p>
          <p className="font-sans font-medium text-sm leading-relaxed text-ink/90 italic">
            "{kiwimuSays}"
          </p>
        </div>
      </KiwimuCardContent>
    </KiwimuCard>
  )
}

// --- V2SpectrumBlock ---
const DIMENSIONS: { label: string; left: string; right: string; dimIndex: number }[] = [
  { label: "E / I", left: "外向", right: "內向", dimIndex: 0 },
  { label: "S / N", left: "感知", right: "直覺", dimIndex: 1 },
  { label: "T / F", left: "思考", right: "情感", dimIndex: 2 },
  { label: "J / P", left: "判斷", right: "感知", dimIndex: 3 },
  { label: "A / T", left: "自信", right: "起伏", dimIndex: 4 },
]

const LEFT_VALUES = new Set(["E", "S", "T", "J", "A"])

function V2SpectrumBlock({ answers }: { answers: Dimension[] }) {
  return (
    <KiwimuCard variant="paper">
      <KiwimuCardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            五維光譜
          </p>
          <KiwimuBadge variant="outline">Spectrum</KiwimuBadge>
        </div>

        <div className="space-y-4">
          {DIMENSIONS.map(({ label, left, right, dimIndex }) => {
            const answer = answers[dimIndex]
            const isLeft = answer ? LEFT_VALUES.has(answer) : true
            const value = isLeft ? 75 : 25
            const module = dimIndex + 1

            return (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                  <span className={isLeft ? "text-ink font-bold" : "text-ink/40"}>
                    {left}
                  </span>
                  <span className="text-ink/30">{label}</span>
                  <span className={!isLeft ? "text-ink font-bold" : "text-ink/40"}>
                    {right}
                  </span>
                </div>
                <KiwimuProgress value={value} currentModule={module} />
              </div>
            )
          })}
        </div>
      </KiwimuCardContent>
    </KiwimuCard>
  )
}

// --- V2StateBlock ---
function V2StateBlock({ aOrT }: { aOrT: "A" | "T" }) {
  const state = kiwimuStates[aOrT]
  return (
    <KiwimuCard>
      <KiwimuCardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            當下狀態報告
          </p>
          <KiwimuBadge variant={aOrT === "A" ? "acid" : "ink"}>
            {state.title}
          </KiwimuBadge>
        </div>

        <h2 className="font-display text-3xl font-bold uppercase text-ink leading-none">
          {state.title}
        </h2>

        <p className="font-sans text-sm text-ink/70 leading-relaxed border-l-2 border-acid pl-4">
          {state.description}
        </p>

        <p className="font-sans text-sm text-ink/60 leading-relaxed">
          {aOrT === "A"
            ? "你的靈魂像剛出爐的完美擠花，穩定、有形狀，面對外界的震動依然保有核心。這不是麻木，是一種深層的自我接納。"
            : "你的靈魂像被攪拌過度的鮮奶油——邊緣有些塌陷，但那恰恰說明你對事情有感受、有溫度。焦慮是你追求完美的燃料。"}
        </p>
      </KiwimuCardContent>
    </KiwimuCard>
  )
}

// --- V2DessertBlock ---
function V2DessertBlock({ name, core }: { name: string; core: string }) {
  return (
    <KiwimuCard variant="paper">
      <KiwimuCardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            靈魂甜點
          </p>
          <KiwimuBadge variant="acid">Soul Dessert</KiwimuBadge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-1">
            <h3 className="font-display text-2xl font-semibold uppercase text-ink leading-none">
              {name}
            </h3>
            <p className="font-mono text-[10px] text-ink/50 uppercase tracking-widest">
              {core}
            </p>
          </div>
          <div className="w-28 shrink-0">
            <ImageSlot type="dessert" aspect="4/3" alt={name} />
          </div>
        </div>
      </KiwimuCardContent>
    </KiwimuCard>
  )
}

// --- V2CTABlock ---
function V2CTABlock({ onReset }: { onReset: () => void }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Kiwimu MBTI Lab — 靈魂甜點測驗",
          text: "我找到了我的靈魂甜點，來測測你的！",
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("連結已複製！"))
        .catch(() => {})
    }
  }

  return (
    <div className="space-y-3 pt-2">
      <KiwimuButton
        variant="acid"
        size="lg"
        onClick={() =>
          window.open("https://shop.kiwimu.com", "_blank", "noopener")
        }
        className="w-full flex items-center justify-center gap-3 uppercase tracking-wider"
      >
        <ShoppingBag className="w-5 h-5" />
        訂購靈魂甜點
      </KiwimuButton>

      <KiwimuButton
        variant="ghost"
        size="lg"
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-3 uppercase tracking-wider"
      >
        <Share2 className="w-5 h-5" />
        分享結果
      </KiwimuButton>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink transition-colors py-2"
      >
        <RotateCcw className="w-3 h-3" />
        重新測驗
      </button>
    </div>
  )
}

// --- V2ResultPage (main) ---
interface V2ResultPageProps {
  type: string
  aOrT: "A" | "T"
  answers: Dimension[]
  onReset: () => void
}

export function V2ResultPage({ type, aOrT, answers, onReset }: V2ResultPageProps) {
  const personality = personalities[type] ?? personalities["INFP"]

  return (
    <motion.div
      key="v2-result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full space-y-4"
    >
      <V2HeroBlock type={type} aOrT={aOrT} kiwimuSays={personality.kiwimuSays} />
      <V2SpectrumBlock answers={answers} />
      <V2StateBlock aOrT={aOrT} />
      <V2DessertBlock name={personality.name} core={personality.core} />
      <V2CTABlock onReset={onReset} />
    </motion.div>
  )
}
