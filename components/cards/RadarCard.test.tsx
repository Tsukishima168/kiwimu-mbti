import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { CardProps } from './Types';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  RadarChart: ({ data }: { data: unknown }) => <output>{JSON.stringify(data)}</output>,
  Radar: () => null, PolarGrid: () => null, PolarAngleAxis: () => null, PolarRadiusAxis: () => null,
}));
import { RadarCard } from './RadarCard';

describe('radar score accuracy', () => {
  it('keeps valid zero-percent scores instead of plotting a fabricated midpoint', () => {
    const props = {
      percentages: { E: 0, I: 100, S: 0, N: 100, T: 0, F: 100, J: 0, P: 100, A: 0, Turbulent: 100 },
      t: (key: string) => key,
    } as CardProps;
    const html = renderToStaticMarkup(<RadarCard {...props} />);
    expect((html.match(/&quot;A&quot;:0/g) || []).length).toBe(5);
    expect(html).not.toContain('&quot;A&quot;:50');
  });
});
