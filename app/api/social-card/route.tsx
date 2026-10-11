import { ImageResponse } from "next/og";
import {
  Frame, layout, loadFonts, StatBody, VerdictBody, ListBody, ContrastBody, PlayerBody, HeadlineBody, type Fmt,
} from "./cards-v2";

/**
 * Social share card generator.
 *
 * Style A (`variant=cover`, the default) is unchanged and remains the house
 * card: full-bleed cover image, brand layer, title, domain.
 *
 * Four variants were added alongside it in September 2026, for a reason worth
 * writing down. Style A carries the *headline*, which is what an OG preview
 * already does for free when somebody pastes a link. It carries no number, no
 * contrast and no reason to stop scrolling, so posting it was posting a link.
 * The variants below carry the material from inside the article instead — the
 * stat block, the vs comparison, the closing verdict, the list of names — which
 * `scripts/social-pack.mjs` already extracts verbatim from `sections_json`.
 *
 * They also need no cover image, so a piece can be distributed on the day it is
 * written rather than on the day someone finds artwork for it.
 *
 * Second generation (October 2026): every variant except Style A is drawn by
 * cards-v2.tsx — the article's art uncropped in every format, type sized to its
 * box, two new cards (headline, player). See that file's header for why.
 *
 * Query params:
 *   variant   - "cover" (default, Style A) | "headline" | "player" | "stat" | "contrast" | "verdict" | "list"
 *   format    - "x" (1200x675) | "square" (1080x1350) | "story" (1080x1920)
 *   title     - article title (required for `cover`; a kicker for the others)
 *   category  - label shown in the top-right pill (optional)
 *   cover     - cover image URL (required for `cover`; an optional dim backdrop otherwise)
 *   cta       - bottom-left call to action, e.g. "The other six → /lists" (optional)
 *
 *   stat:      value, label, note
 *   contrast:  leftName, rightName, rows — "Pace: 90~Passing: 59;Dribbling: 72~Physical: 53"
 *   verdict:   quote
 *   list:      items — semicolon-separated, e.g. "Mora;Quenda;Simões"; heading (optional)
 *   headline:  dek (optional standfirst)
 *   player:    name, meta, ovr, edition, stats ("PAC 85;DRI 79"), line, real, tier,
 *              season ("Serie A|26/27|apps|starts|min|goals|assists|2026-10-12", optional)
 */

// Node, not Edge: Next 16.3 deprecates the Edge Runtime and warns on every
// build. next/og's ImageResponse is fully supported on Node.
export const runtime = "nodejs";

const ACCENT = "linear-gradient(90deg, #00d4aa, #22d3ee, #FFB81C)";

const FORMATS: Record<string, { w: number; h: number }> = {
  x: { w: 1200, h: 675 },
  square: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
};

const CATEGORY_LABEL: Record<string, string> = {
  "wc-2026": "WORLD CUP 2026",
  radar: "PLAYER RADAR",
  lists: "SCOUT LIST",
  "tactics-lab": "TACTICS LAB",
  transfer: "TRANSFERS",
  arena: "ARENA",
};

/** "a~b;c~d" → [["a","b"],["c","d"]] — pipes are already taken by the markup parser. */
function parseRows(raw: string): [string, string][] {
  return (raw ?? "")
    .split(";")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      const [l, ...rest] = r.split("~");
      return [(l ?? "").trim(), rest.join("~").trim()] as [string, string];
    })
    .filter(([l, r]) => l || r);
}

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
  const r = s * 0.2;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
      {/* Keycap */}
      <div style={{ position: "relative", width: s, height: s, display: "flex" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: r,
            background: "linear-gradient(180deg, #1a2738, #0c1623)",
            boxShadow: `0 ${s * 0.07}px 0 0 #060d16, 0 ${s * 0.13}px ${s * 0.22}px rgba(0,0,0,0.55)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "9%",
            right: "9%",
            top: "7%",
            bottom: "18%",
            borderRadius: r * 0.8,
            background: "linear-gradient(180deg, #233447, rgba(22,36,54,0))",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: s * 0.34,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#2fe6c4",
            }}
          >
            SG
          </span>
        </div>
      </div>
      {/* Wordmark — matches site-header.tsx */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 17 * scale, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1, color: "#e8f4ff" }}>
          Scout Gamer
        </span>
        <span style={{ fontSize: 9 * scale, letterSpacing: "0.18em", color: "#9fc2d8", marginTop: 2 * scale, fontFamily: "monospace" }}>
          FOOTBALL × GAME CULTURE
        </span>
      </div>
    </div>
  );
}

async function loadFont(): Promise<ArrayBuffer> {
  const res = await fetch("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap");
  const css = await res.text();
  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (match?.[1]) {
    const fontRes = await fetch(match[1]);
    return fontRes.arrayBuffer();
  }
  return new ArrayBuffer(0);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cover = url.searchParams.get("cover") ?? "";
  const rawTitle = url.searchParams.get("title") ?? "Scout Gamer";
  const categoryKey = url.searchParams.get("category") ?? "";
  const format = url.searchParams.get("format") ?? "x";

  const { w, h } = FORMATS[format] ?? FORMATS.x;
  const category = CATEGORY_LABEL[categoryKey] ?? (categoryKey ? categoryKey.toUpperCase() : "");
  const isStory = format === "story";
  const isSquare = format === "square";

  const pad = isStory ? 64 : isSquare ? 56 : 48;
  const topPad = isSquare ? 56 : pad - 8;
  const bottomPad = isStory ? 340 : isSquare ? 80 : pad;
  const titleSize = isStory ? 60 : isSquare ? 56 : 46;
  const maxTitleChars = isStory ? 90 : isSquare ? 80 : 95;
  const title = fitTitle(rawTitle, maxTitleChars);

  let fonts: { name: string; data: ArrayBuffer; weight: 700; style: "normal" }[] = [];
  try {
    const fontData = await loadFont();
    if (fontData.byteLength > 0) {
      fonts = [{ name: "Space Grotesk", data: fontData, weight: 700 as const, style: "normal" as const }];
    }
  } catch { /* fallback to sans-serif */ }

  const fontFamily = fonts.length > 0 ? "'Space Grotesk', sans-serif" : "sans-serif";

  // ---- content-carrying variants (second generation, cards-v2.tsx) ---------
  // Style A falls through to the original render below, unchanged.
  const variant = url.searchParams.get("variant") ?? "cover";
  if (variant !== "cover") {
    const p = (k: string) => (url.searchParams.get(k) ?? "").trim();
    const fmt: Fmt = format === "square" || format === "story" ? format : "x";
    const L = layout(fmt, Boolean(cover));
    const v2Fonts = await loadFonts();
    const kicker = variant === "headline" ? "" : fitTitle(rawTitle, fmt === "x" ? 90 : 80);

    let body: React.ReactNode;
    switch (variant) {
      case "stat":
      case "hero": // the September hero experiment is now the stat card with art
        body = <StatBody L={L} value={p("value")} label={p("label")} note={p("note")} />;
        break;
      case "contrast":
        body = <ContrastBody L={L} left={p("leftName")} right={p("rightName")} rows={parseRows(p("rows")).slice(0, fmt === "story" ? 7 : 5)} />;
        break;
      case "verdict":
        body = <VerdictBody L={L} quote={fitTitle(p("quote"), fmt === "story" ? 320 : 240)} />;
        break;
      case "list":
        body = <ListBody L={L} heading={p("heading")} items={p("items").split(";").map((s) => s.trim()).filter(Boolean)} />;
        break;
      case "player":
        body = (
          <PlayerBody
            L={L}
            name={p("name")}
            meta={p("meta")}
            ovr={p("ovr")}
            edition={p("edition")}
            stats={p("stats").split(";").map((s) => s.trim()).filter(Boolean)}
            line={p("line")}
            real={p("real")}
            tier={p("tier")}
            season={p("season")}
          />
        );
        break;
      case "headline":
        body = <HeadlineBody L={L} title={rawTitle} dek={p("dek")} />;
        break;
      default:
        return new Response(`Unknown variant "${variant}"`, { status: 400 });
    }

    return new ImageResponse(
      <Frame L={L} cover={cover} category={category} kicker={kicker} cta={p("cta")}>
        {body}
      </Frame>,
      { width: L.w, height: L.h, fonts: v2Fonts.length > 0 ? v2Fonts : undefined },
    );
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "sans-serif", background: "linear-gradient(155deg, #060f1e, #0d1f35)" }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}

        {/* Top fade — logo & pill legibility */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "40%",
            display: "flex",
            background: "linear-gradient(180deg, rgba(6,15,30,0.85) 0%, rgba(6,15,30,0.4) 50%, rgba(6,15,30,0) 100%)",
          }}
        />
        {/* Bottom fade — title legibility */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: isStory ? "65%" : isSquare ? "55%" : "50%",
            display: "flex",
            background: "linear-gradient(0deg, rgba(6,15,30,0.95) 0%, rgba(6,15,30,0.55) 45%, rgba(6,15,30,0) 100%)",
          }}
        />

        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: isStory ? 8 : 6, background: ACCENT }} />

        {/* Top-left logo */}
        <div style={{ position: "absolute", top: topPad, left: pad, display: "flex" }}>
          <Logo scale={isStory ? 1.2 : 1} />
        </div>

        {/* Top-right category pill */}
        {category ? (
          <div
            style={{
              position: "absolute",
              top: topPad + 4,
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
        <div style={{ position: "absolute", left: pad, right: pad, bottom: bottomPad, display: "flex", flexDirection: "column", gap: isStory ? 18 : 12 }}>
          <span
            style={{
              fontSize: titleSize,
              fontWeight: 700,
              fontFamily,
              color: "#ffffff",
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              textShadow: "0 2px 24px rgba(0,0,0,0.7), 0 1px 0 rgba(0,0,0,0.5)",
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
    { width: w, height: h, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
