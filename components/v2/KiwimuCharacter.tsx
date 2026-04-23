import React from 'react';

export type KiwimuState = 'still' | 'hover' | 'watch' | 'glow' | 'ascend';

type KiwimuCharacterProps = {
  className?: string;
  decorative?: boolean;
  state?: KiwimuState;
  title?: string;
};

const STATE_LABELS: Record<KiwimuState, string> = {
  still: 'Kiwimu 靜落',
  hover: 'Kiwimu 懸停',
  watch: 'Kiwimu 守候',
  glow: 'Kiwimu 發光',
  ascend: 'Kiwimu 起飛',
};

export function KiwimuCharacter({
  className,
  decorative = true,
  state = 'still',
  title,
}: KiwimuCharacterProps) {
  const rootClassName = ['v2-kiwimu', `is-${state}`, className].filter(Boolean).join(' ');
  const accessibilityProps = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': title || STATE_LABELS[state] };

  return (
    <div className={rootClassName} {...accessibilityProps}>
      <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="kiwimu-body" cx="50%" cy="24%" r="76%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#F8F8F5" />
          </radialGradient>
          <radialGradient id="kiwimu-acid" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(204,255,0,0.95)" />
            <stop offset="100%" stopColor="rgba(204,255,0,0)" />
          </radialGradient>
        </defs>

        <g className="v2-kiwimu-aura">
          <circle cx="110" cy="104" r="72" fill="url(#kiwimu-acid)" />
        </g>

        <g className="v2-kiwimu-orbits">
          <circle cx="38" cy="80" r="8" />
          <circle cx="180" cy="62" r="6" />
          <circle cx="170" cy="172" r="5" />
        </g>

        <g className="v2-kiwimu-body">
          <ellipse className="v2-kiwimu-shadow" cx="110" cy="188" rx="48" ry="14" />
          <path
            d="M110 34
              C 83 34, 58 54, 51 82
              C 44 109, 49 142, 66 162
              C 79 178, 93 186, 110 188
              C 127 186, 141 178, 154 162
              C 171 142, 176 109, 169 82
              C 162 54, 137 34, 110 34 Z"
            fill="url(#kiwimu-body)"
            stroke="currentColor"
            strokeWidth="6"
          />
          <path
            d="M108 35
              C 105 12, 129 8, 136 27
              C 141 41, 133 54, 118 65"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="6"
          />
          <path
            d="M83 106
              C 92 116, 104 121, 110 121
              C 116 121, 128 116, 137 106"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <path
            d="M78 145
              C 92 157, 128 157, 142 145"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <circle className="v2-kiwimu-eye left" cx="92" cy="132" r="5" />
          <circle className="v2-kiwimu-eye right" cx="128" cy="132" r="5" />
          <path
            className="v2-kiwimu-mouth"
            d="M101 149 C 104 153, 116 153, 119 149"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3.5"
          />
        </g>
      </svg>
    </div>
  );
}

export function KiwimuStable(props: Omit<KiwimuCharacterProps, 'state'>) {
  return <KiwimuCharacter {...props} state="still" />;
}

export function KiwimuAnxious(props: Omit<KiwimuCharacterProps, 'state'>) {
  return <KiwimuCharacter {...props} state="hover" />;
}
