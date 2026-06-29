"use client";

import { formatHighlightPillText } from "@/lib/highlight-pill-text";

/** Content cards — outline pill + accent (lists / radar / tactics / arena) */
export function ContentHighlightPills({
  tags,
  accent,
  label,
}: {
  tags: string[];
  accent: string;
  label: string;
}) {
  if (!tags.length) return null;
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 9,
          letterSpacing: "0.14em",
          color: "var(--sg-text-muted)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="chip chip-highlight-pill"
            style={{
              borderColor: accent,
              color: accent,
              fontSize: 10,
              background: "transparent",
            }}
          >
            {formatHighlightPillText(tag)}
          </span>
        ))}
      </div>
    </div>
  );
}
