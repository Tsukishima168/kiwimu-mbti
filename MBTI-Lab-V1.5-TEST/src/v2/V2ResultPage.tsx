import * as React from "react"
import { motion } from "motion/react"
import { Lock, RotateCcw, Share2, ShoppingBag } from "lucide-react"
import {
  KiwimuCard,
  KiwimuCardContent,
  KiwimuButton,
  KiwimuBadge,
  KiwimuProgress,
  ImageSlot,
} from "@/src/components/kiwimu"
import { kiwimuStates } from "@/src/data"
import { V2_TW_REPORTS } from "../../../data/v2TaiwanDrafts.generated"
import { KiwimuStable, KiwimuAnxious } from "./KiwimuCharacter"
import { getV2Entitlement, unlockV2Preview, hasV2UnlockQuery } from "../../../utils/v2Access"
import { useSupabaseAuth, loginWithGoogle } from "./useSupabaseAuth"
import { trackV2Event } from "./v2Analytics"
import type { Dimension } from "@/src/types"

// --- helpers ---
type V2Report = (typeof V2_TW_REPORTS)[keyof typeof V2_TW_REPORTS]

function getV2Report(type: string): V2Report {
  if (Object.hasOwn(V2_TW_REPORTS, type)) {
    return V2_TW_REPORTS[type as keyof typeof V2_TW_REPORTS]
  }
  return V2_TW_REPORTS["INFP"]
}

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
  title,
  kiwimuSays,
}: {
  type: string
  aOrT: "A" | "T"
  title: string
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
            {title && (
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-ink/60">
                {title}
              </p>
            )}
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

        {/* Soul positioning statement */}
        <div className="border-l-2 border-acid pl-4 py-1">
          <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest mb-1">
            2026 定位語
          </p>
          <p className="font-sans font-medium text-sm leading-relaxed text-ink/90">
            {kiwimuSays}
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
function V2StateBlock({
  aOrT,
  coreTitle,
  coreBody,
  subtypeTitle,
  subtypeDesc,
}: {
  aOrT: "A" | "T"
  coreTitle: string
  coreBody: string
  subtypeTitle: string
  subtypeDesc: string
}) {
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

        {/* Kiwimu A/T state */}
        <div>
          <h2 className="font-display text-3xl font-bold uppercase text-ink leading-none mb-2">
            {state.title}
          </h2>
          <p className="font-sans text-sm text-ink/60 leading-relaxed">
            {state.description}
          </p>
        </div>

        {/* Type-specific core identity */}
        {coreTitle && (
          <div className="border-t border-ink/10 pt-4 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              靈魂核心
            </p>
            <h3 className="font-display text-xl font-bold text-ink">
              {coreTitle}
            </h3>
            <p className="font-sans text-sm text-ink/80 leading-relaxed border-l-2 border-acid pl-4">
              {coreBody}
            </p>
          </div>
        )}

        {/* A/T subtype specific */}
        {subtypeTitle && (
          <div className="bg-ink/5 rounded-2xl p-4 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              {aOrT === "A" ? "A 型 · 自信亞型" : "T 型 · 謹慎亞型"}
            </p>
            <p className="font-display text-base font-bold text-ink">{subtypeTitle}</p>
            <p className="font-sans text-xs text-ink/70 leading-relaxed">{subtypeDesc}</p>
          </div>
        )}
      </KiwimuCardContent>
    </KiwimuCard>
  )
}

// --- V2DessertBlock ---
function V2DessertBlock({ name, visualLogic }: { name: string; visualLogic: string }) {
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
          <div className="flex-1 space-y-2">
            <h3 className="font-display text-2xl font-semibold uppercase text-ink leading-none">
              {name}
            </h3>
            <p className="font-sans text-xs text-ink/60 leading-relaxed">
              {visualLogic}
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

// --- V2AbyssalBlock ---
function V2AbyssalBlock({
  questions,
}: {
  questions: readonly { readonly title: string; readonly body: string }[]
}) {
  return (
    <KiwimuCard>
      <KiwimuCardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            靈魂拷問
          </p>
          <KiwimuBadge variant="ink">Abyssal</KiwimuBadge>
        </div>

        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-mono text-[10px] text-ink/30 pt-0.5 shrink-0 w-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="space-y-0.5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
                  {q.title}
                </p>
                <p className="font-sans text-sm text-ink/80 leading-relaxed">
                  {q.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </KiwimuCardContent>
    </KiwimuCard>
  )
}

// --- V2CTABlock ---
function V2CTABlock({ closing, onReset }: { closing: string; onReset: () => void }) {
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
    <div className="space-y-4 pt-2">
      {closing && (
        <div className="text-center px-4">
          <p className="font-sans text-sm text-ink/60 leading-relaxed italic">
            {closing}
          </p>
        </div>
      )}

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

// --- V2LockOverlay ---
function V2LockOverlay({
  isLoggedIn,
  isLoading,
  onReset,
}: {
  isLoggedIn: boolean
  isLoading: boolean
  onReset: () => void
}) {
  return (
    <>
      <KiwimuCard>
        <KiwimuCardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-[1.5px] border-ink bg-ink/5 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-ink" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                完整報告鎖定中
              </p>
              <p className="font-display text-base font-bold text-ink leading-tight">
                解鎖靈魂深層報告
              </p>
            </div>
          </div>

          <div className="border-l-2 border-ink/20 pl-4 space-y-1.5">
            {["當下狀態 × 靈魂核心", "靈魂甜點配方", "靈魂拷問 3 題"].map((item) => (
              <p
                key={item}
                className="font-mono text-[10px] text-ink/50 uppercase tracking-widest"
              >
                → {item}
              </p>
            ))}
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="h-12 rounded-full bg-ink/5 animate-pulse" />
            ) : !isLoggedIn ? (
              <KiwimuButton
                variant="ink"
                size="lg"
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                Google 登入 · 解鎖報告
              </KiwimuButton>
            ) : (
              <KiwimuButton
                variant="acid"
                size="lg"
                onClick={() =>
                  window.open("https://shop.kiwimu.com", "_blank", "noopener")
                }
                className="w-full flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <ShoppingBag className="w-4 h-4" />
                購買靈魂甜點 · 解鎖報告
              </KiwimuButton>
            )}

            <p className="text-center font-mono text-[10px] text-ink/30 uppercase tracking-widest">
              {!isLoggedIn ? "登入後可驗證購買紀錄" : "購買完成後報告自動解鎖"}
            </p>
          </div>
        </KiwimuCardContent>
      </KiwimuCard>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink transition-colors py-2"
      >
        <RotateCcw className="w-3 h-3" />
        重新測驗
      </button>
    </>
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
  const { isLoggedIn, isLoading } = useSupabaseAuth()

  const [isLocked, setIsLocked] = React.useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (hasV2UnlockQuery(params)) {
      unlockV2Preview()
      return false
    }
    return getV2Entitlement().status === "locked"
  })

  // Re-check entitlement when auth state resolves
  React.useEffect(() => {
    if (!isLoading) {
      const params = new URLSearchParams(window.location.search)
      if (hasV2UnlockQuery(params)) {
        setIsLocked(false)
        return
      }
      setIsLocked(getV2Entitlement().status === "locked")
    }
  }, [isLoading])

  // Analytics: result_view
  React.useEffect(() => {
    trackV2Event("v2_result_view", { type, aOrT, locked: isLocked })
  }, [])

  const report = getV2Report(type)
  const subtype = report.professional.subtypes[aOrT]
  const subtypeDesc = subtype.items[0]?.body ?? ""

  return (
    <motion.div
      key="v2-result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full space-y-4"
    >
      <V2HeroBlock
        type={type}
        aOrT={aOrT}
        title={report.title}
        kiwimuSays={report.abstract.body}
      />
      <V2SpectrumBlock answers={answers} />

      {isLocked ? (
        <V2LockOverlay
          isLoggedIn={isLoggedIn}
          isLoading={isLoading}
          onReset={onReset}
        />
      ) : (
        <>
          <V2StateBlock
            aOrT={aOrT}
            coreTitle={report.professional.coreTitle}
            coreBody={report.professional.coreBody}
            subtypeTitle={subtype.title}
            subtypeDesc={subtypeDesc}
          />
          <V2DessertBlock
            name={report.dessert.name}
            visualLogic={report.dessert.visualLogic}
          />
          <V2AbyssalBlock questions={report.abyssal} />
          <V2CTABlock closing={report.closing} onReset={onReset} />
        </>
      )}
    </motion.div>
  )
}
