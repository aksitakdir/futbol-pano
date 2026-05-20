/** OVR → renk skalası (liste butonları, kadro chip) */
export type OverallTone = "elite" | "high" | "mid" | "low" | "unknown";

export function overallTone(ovr: number | null | undefined): OverallTone {
  if (ovr == null || Number.isNaN(ovr)) return "unknown";
  if (ovr >= 85) return "elite";
  if (ovr >= 80) return "high";
  if (ovr >= 74) return "mid";
  return "low";
}

export function overallToneCssVar(tone: OverallTone): string {
  switch (tone) {
    case "elite":
      return "var(--emerald)";
    case "high":
      return "var(--cyan)";
    case "mid":
      return "var(--amber)";
    case "low":
      return "var(--sg-text-muted)";
    default:
      return "var(--sg-border)";
  }
}
