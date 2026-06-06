'use client';

import { Star } from 'lucide-react';

export default function Stars({
  rating,
  count,
  size = 13,
  showCount = true,
}: {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              size={size}
              strokeWidth={1.5}
              style={{
                color: filled ? 'var(--color-gold)' : 'var(--color-border-strong)',
                fill: filled ? 'var(--color-gold)' : 'transparent',
              }}
            />
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
          ({count})
        </span>
      )}
    </div>
  );
}
