import { ImageResponse } from "next/og";

/**
 * Social share card generator (Style A — full-bleed cover + bottom gradient).
 *
 * Renders an article's custom cover image as the background with the
 * ScoutGamer brand layer (logo, category pill, title, domain) on top, matching
 * the site header's visual language. Manually invoked from the admin edit page.
 *
 * Query params:
 *   cover     - cover image URL (required; falls back to a brand gradient)
 *   title     - article title (required)
 *   category  - label shown in the top-right pill (optional)
 *   format    - "x" (1200x675) | "square" (1080x1080) | "story" (1080x1920)
 */

export const runtime = "edge";

const ACCENT = "linear-gradient(90deg, #00d4aa, #22d3ee, #FFB81C)";

const FORMATS: Record<string, { w: number; h: number }> = {
  x: { w: 1200, h: 675 },
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
};

const CATEGORY_LABEL: Record<string, string> = {
  "wc-2026": "WORLD CUP 2026",
  radar: "PLAYER RADAR",
  lists: "SCOUT LIST",
  "tactics-lab": "TACTICS LAB",
  transfer: "TRANSFERS",
};

/** Cap very long titles so the card stays clean; ellipsize on a word boundary. */
function fitTitle(raw: string, max: number): string {
  const t = (raw ?? "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

// Keycap-style logo. next/og (satori) doesn't support background-clip:text,
// so the "SG" legend uses a solid accent color instead of the site gradient.
function Logo({ scale = 1 }: { scale?: number }) {
  const s = 46 * scale;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
      <div
        style={{
          width: s,
          height: s,
          borderRadius: 11 * scale,
          background: "linear-gradient(180deg, #1f2f42, #0c1623)",
          borderBottom: `${Math.max(2, 4 * scale)}px solid #060d16`,
          boxShadow: `0 ${4 * scale}px ${8 * scale}px rgba(0,0,0,0.5)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18 * scale,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "#2fe6c4",
        }}
      >
        SG
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 22 * scale, fontWeight: 800, color: "#e8f4ff", letterSpacing: "-0.02em" }}>
          Scout Gamer
        </span>
        <span style={{ fontSize: 10 * scale, color: "#9fc2d8", letterSpacing: "0.22em", fontFamily: "monospace" }}>
          FOOTBALL × GAME CULTURE
        </span>
      </div>
    </div>
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cover = url.searchParams.get("cover") ?? "";
  const rawTitle = url.searchParams.get("title") ?? "Scout Gamer";
  const categoryKey = url.searchParams.get("category") ?? "";
  const format = url.searchParams.get("format") ?? "x";

  const { w, h } = FORMATS[format] ?? FORMATS.x;
  const category = CATEGORY_LABEL[categoryKey] ?? (categoryKey ? categoryKey.toUpperCase() : "");
  const isPortrait = h > w;
  const isStory = format === "story";

  // Tune sizing per format
  const pad = isStory ? 64 : 48;
  const titleSize = isStory ? 60 : isPortrait ? 56 : 46;
  const maxTitleChars = isStory ? 90 : isPortrait ? 80 : 95;
  const title = fitTitle(rawTitle, maxTitleChars);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "sans-serif", background: "linear-gradient(155deg, #060f1e, #0d1f35)" }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}

        {/* Legibility gradient — stronger at the bottom where the title sits */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(6,15,30,0.55) 0%, rgba(6,15,30,0.05) 32%, rgba(6,15,30,0.72) 74%, rgba(6,15,30,0.96) 100%)",
          }}
        />

        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: isStory ? 8 : 6, background: ACCENT }} />

        {/* Top-left logo */}
        <div style={{ position: "absolute", top: pad - 8, left: pad, display: "flex" }}>
          <Logo scale={isStory ? 1.2 : 1} />
        </div>

        {/* Top-right category pill */}
        {category ? (
          <div
            style={{
              position: "absolute",
              top: pad - 4,
              right: pad,
              display: "flex",
              padding: isStory ? "10px 18px" : "7px 14px",
              borderRadius: 999,
              background: "rgba(255,184,28,0.16)",
              border: "1px solid rgba(255,184,28,0.4)",
            }}
          >
            <span style={{ fontSize: isStory ? 16 : 12, fontWeight: 700, color: "#FFD479", letterSpacing: "0.14em", fontFamily: "monospace" }}>
              {category}
            </span>
          </div>
        ) : null}

        {/* Bottom: title + domain */}
        <div style={{ position: "absolute", left: pad, right: pad, bottom: pad, display: "flex", flexDirection: "column", gap: isStory ? 18 : 12 }}>
          <span
            style={{
              fontSize: titleSize,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.06,
              textShadow: "0 2px 24px rgba(0,0,0,0.7)",
            }}
          >
            {title}
          </span>
          <span style={{ fontSize: isStory ? 20 : 15, color: "#bcd6e8", letterSpacing: "0.16em", fontFamily: "monospace" }}>
            SCOUTGAMER.COM
          </span>
        </div>
      </div>
    ),
    { width: w, height: h },
  );
}
