/**
 * The line under an article's cover hero, e.g. "Illustration: AI-generated".
 * Covers that show a real player must carry it (docs/CONTENT-STRATEGY-V2.md §5.3,
 * rule 6; EU AI Act art. 50), so it is plain server-rendered text, not a tooltip.
 * Sits in the hero's bottom-right corner; the hero must be position: relative.
 */
export default function CoverCaption({ text }: { text: string }) {
  return (
    <p
      className="mono"
      style={{
        position: "absolute", right: 16, bottom: 10, zIndex: 2, margin: 0,
        fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--sg-text-muted)",
      }}
    >
      {text.trim()}
    </p>
  );
}
