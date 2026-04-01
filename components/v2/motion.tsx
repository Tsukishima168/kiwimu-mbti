/**
 * motion/react shim — 保留架構，動畫效果簡化
 * BOOT.md: "Motion 動畫先保留架構，不需要完整動畫效果"
 * 正式上線後可安裝 `motion` package 並直接替換此 import。
 */
import React from 'react';

type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  key?: React.Key;
};

const MotionDiv = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ initial, animate, exit, transition, ...props }, ref) => (
    <div ref={ref} {...props} />
  )
);
MotionDiv.displayName = 'motion.div';

export const motion = {
  div: MotionDiv,
};

export const AnimatePresence: React.FC<{
  children: React.ReactNode;
  mode?: string;
}> = ({ children }) => <>{children}</>;
