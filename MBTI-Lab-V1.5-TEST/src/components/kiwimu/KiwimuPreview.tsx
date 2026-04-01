import React from "react"
import { KiwimuCard, KiwimuCardContent, KiwimuCardHeader, KiwimuCardTitle, KiwimuCardDescription } from "./KiwimuCard"
import { KiwimuButton } from "./KiwimuButton"
import { KiwimuBadge } from "./KiwimuBadge"
import { ImageSlot } from "./ImageSlot"
import { KiwimuProgress } from "./KiwimuProgress"

export default function KiwimuPreview() {
  const [progress, setProgress] = React.useState(40)

  return (
    <div className="min-h-screen bg-paper p-8 font-sans">
      <div className="mx-auto max-w-2xl space-y-12">

        {/* Header */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Phase 1 — Design System Preview
          </span>
          <h1 className="font-display text-4xl font-bold uppercase text-ink">
            Kiwimu Blocks
          </h1>
        </div>

        {/* KiwimuBadge */}
        <section className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/40">KiwimuBadge</p>
          <div className="flex flex-wrap gap-3">
            <KiwimuBadge variant="ink">INTJ-A</KiwimuBadge>
            <KiwimuBadge variant="acid">Kiwimu Lab</KiwimuBadge>
            <KiwimuBadge variant="outline">2026</KiwimuBadge>
          </div>
        </section>

        {/* KiwimuButton */}
        <section className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/40">KiwimuButton</p>
          <div className="flex flex-wrap gap-4">
            <KiwimuButton variant="default" size="sm">Default SM</KiwimuButton>
            <KiwimuButton variant="default" size="md">Default MD</KiwimuButton>
            <KiwimuButton variant="acid" size="md">Acid Primary</KiwimuButton>
            <KiwimuButton variant="acid" size="lg">Start Scan</KiwimuButton>
            <KiwimuButton variant="ghost" size="md">Ghost</KiwimuButton>
          </div>
        </section>

        {/* KiwimuProgress */}
        <section className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/40">KiwimuProgress</p>
          <div className="space-y-4 max-w-sm">
            <KiwimuProgress value={progress} />
            <KiwimuProgress value={60} currentModule={3} />
            <KiwimuProgress value={100} currentModule={5} />
            <div className="flex gap-2">
              <KiwimuButton variant="ghost" size="sm" onClick={() => setProgress(p => Math.max(0, p - 20))}>−20</KiwimuButton>
              <KiwimuButton variant="ghost" size="sm" onClick={() => setProgress(p => Math.min(100, p + 20))}>+20</KiwimuButton>
            </div>
          </div>
        </section>

        {/* ImageSlot */}
        <section className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/40">ImageSlot</p>
          <div className="grid grid-cols-3 gap-4">
            <ImageSlot type="character" aspect="1/1" alt="Character placeholder" />
            <ImageSlot type="dessert" aspect="4/3" alt="Dessert placeholder" />
            <ImageSlot type="avatar" aspect="1/1" alt="Avatar" src="https://placehold.co/200x200/CCFF00/1A1A1A?text=Kiwimu" />
          </div>
        </section>

        {/* KiwimuCard */}
        <section className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/40">KiwimuCard</p>
          <div className="grid grid-cols-2 gap-4">
            <KiwimuCard variant="white">
              <KiwimuCardHeader>
                <KiwimuCardTitle>White Card</KiwimuCardTitle>
                <KiwimuCardDescription>ink border + hard shadow</KiwimuCardDescription>
              </KiwimuCardHeader>
              <KiwimuCardContent>
                <div className="flex gap-2">
                  <KiwimuBadge variant="ink">INTJ</KiwimuBadge>
                  <KiwimuBadge variant="acid">A</KiwimuBadge>
                </div>
              </KiwimuCardContent>
            </KiwimuCard>

            <KiwimuCard variant="paper">
              <KiwimuCardHeader>
                <KiwimuCardTitle>Paper Card</KiwimuCardTitle>
                <KiwimuCardDescription>bg-paper variant</KiwimuCardDescription>
              </KiwimuCardHeader>
              <KiwimuCardContent>
                <KiwimuButton variant="acid" size="sm">CTA</KiwimuButton>
              </KiwimuCardContent>
            </KiwimuCard>
          </div>
        </section>

        {/* Combined — Quiz Question Card preview */}
        <section className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/40">Combined — Quiz Q Card</p>
          <KiwimuCard variant="white">
            <KiwimuCardHeader>
              <div className="flex items-center justify-between">
                <KiwimuBadge variant="outline">Q.01 / 05</KiwimuBadge>
                <KiwimuBadge variant="ink">Analyzing</KiwimuBadge>
              </div>
            </KiwimuCardHeader>
            <KiwimuCardContent className="space-y-4">
              <KiwimuProgress value={20} currentModule={1} />
              <p className="font-display text-xl font-medium text-ink leading-snug">
                在一個忙碌的週末，你更可能選擇？
              </p>
              <div className="space-y-3 pt-2">
                <KiwimuButton variant="default" size="lg" className="w-full justify-start text-left">
                  A. 獨自充電，整理思緒
                </KiwimuButton>
                <KiwimuButton variant="default" size="lg" className="w-full justify-start text-left">
                  B. 與朋友出去，感受活力
                </KiwimuButton>
              </div>
            </KiwimuCardContent>
          </KiwimuCard>
        </section>

      </div>
    </div>
  )
}
