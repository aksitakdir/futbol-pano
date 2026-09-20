import { ImageResponse } from "next/og";

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
 * Query params:
 *   variant   - "cover" (default, Style A) | "stat" | "contrast" | "verdict" | "list"
 *   format    - "x" (1200x675) | "square" (1080x1350) | "story" (1080x1920)
 *   title     - article title (required for `cover`; a kicker for the others)
 *   category  - label shown in the top-right pill (optional)
 *   cover     - cover image URL (required for `cover`; an optional dim backdrop otherwise)
 *   cta       - bottom-left call to action, e.g. "The other six → /lists" (optional)
 *
 *   stat:      value, label, note
 *   contrast:  leftName, rightName, rows — "Pace: 90~Passing: 59;Dribbling: 72~Physical: 53"
 *   verdict:   quote
 *   list:      items — semicolon-separated, e.g. "Mora;Quenda;Simões"
 */

export const runtime = "edge";

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

// ---- variant layer -------------------------------------------------------
// Everything below serves the four content-carrying variants. Style A's render
// path is untouched; these share only the logo, the formats and the accent.

const CORAL = "#ff6b5a";
const MINT = "#2fe6c4";

/**
 * Scale a display number to its own length. "9" and "16y 361d" cannot share a
 * font size, and satori has no text-fitting of its own.
 */
function displaySize(text: string, base: number): number {
  const n = (text ?? "").length;
  if (n <= 3) return base;
  if (n <= 5) return base * 0.86;
  if (n <= 8) return base * 0.72;
  if (n <= 12) return base * 0.5;
  return base * 0.36;
}

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

type Chrome = {
  isStory: boolean;
  isSquare: boolean;
  pad: number;
  category: string;
  cta: string;
  kicker: string;
  cover: string;
  fontFamily: string;
};

/** Brand furniture shared by all four variants: accent bar, logo, pill, footer. */
function Frame({ c, children }: { c: Chrome; children: React.ReactNode }) {
  const { isStory, isSquare, pad, category, cta, kicker, cover, fontFamily } = c;
  const logoScale = isStory ? 1.25 : isSquare ? 1.1 : 1;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "sans-serif",
        background: "linear-gradient(155deg, #060f1e 0%, #0b1c30 55%, #0d2338 100%)",
      }}
    >
      {cover ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* The cover is a texture here, never the subject — the number is. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background: "linear-gradient(160deg, rgba(6,15,30,0.93), rgba(9,26,44,0.88))",
            }}
          />
        </>
      ) : null}

      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: isStory ? 8 : 6, background: ACCENT }} />

      {/* Header row */}
      <div
        style={{
          position: "absolute",
          top: pad - 4,
          left: pad,
          right: pad,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo scale={logoScale} />
        {category ? (
          <div
            style={{
              display: "flex",
              padding: isStory ? "10px 18px" : "7px 14px",
              borderRadius: 999,
              background: "rgba(255,184,28,0.16)",
              border: "1px solid rgba(255,184,28,0.4)",
            }}
          >
            <span
              style={{
                fontSize: isStory ? 16 : 12,
                fontWeight: 700,
                color: "#FFD479",
                letterSpacing: "0.14em",
                fontFamily: "monospace",
              }}
            >
              {category}
            </span>
          </div>
        ) : null}
      </div>

      {/* Body — the variant's own content, vertically centred */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: pad + (isStory ? 150 : isSquare ? 120 : 92),
          bottom: pad + (isStory ? 170 : isSquare ? 130 : 96),
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {children}
      </div>

      {/* Footer — the kicker names the piece, the CTA says where to go */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          bottom: pad,
          display: "flex",
          flexDirection: "column",
          gap: isStory ? 14 : 10,
        }}
      >
        <div style={{ display: "flex", width: "100%", height: 2, background: "rgba(146,190,220,0.22)" }} />
        {kicker ? (
          <span
            style={{
              fontSize: isStory ? 26 : isSquare ? 22 : 18,
              fontWeight: 700,
              fontFamily,
              color: "#dceefb",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {kicker}
          </span>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: isStory ? 20 : 14,
              color: cta ? MINT : "#bcd6e8",
              letterSpacing: "0.1em",
              fontFamily: "monospace",
            }}
          >
            {cta || "SCOUTGAMER.COM"}
          </span>
          {cta ? (
            <span
              style={{ fontSize: isStory ? 18 : 13, color: "#8fb2c9", letterSpacing: "0.16em", fontFamily: "monospace" }}
            >
              SCOUTGAMER.COM
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** One number, big enough to stop a thumb. The format that earns a reply. */
function StatBody({ c, value, label, note }: { c: Chrome; value: string; label: string; note: string }) {
  const base = c.isStory ? 260 : c.isSquare ? 220 : 180;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: c.isStory ? 26 : 18 }}>
      <span
        style={{
          fontSize: displaySize(value, base),
          fontWeight: 700,
          fontFamily: c.fontFamily,
          color: "#ffffff",
          letterSpacing: "-0.05em",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: c.isStory ? 40 : c.isSquare ? 34 : 28,
          fontWeight: 700,
          fontFamily: c.fontFamily,
          color: MINT,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {label}
      </span>
      {note ? (
        <span
          style={{
            fontSize: c.isStory ? 26 : c.isSquare ? 22 : 18,
            color: "#9fc2d8",
            lineHeight: 1.35,
          }}
        >
          {note}
        </span>
      ) : null}
    </div>
  );
}

function ContrastColumn({
  c,
  name,
  items,
  align,
}: {
  c: Chrome;
  name: string;
  items: string[];
  align: "flex-start" | "flex-end";
}) {
  const nameSize = c.isStory ? 32 : c.isSquare ? 28 : 22;
  const rowSize = c.isStory ? 34 : c.isSquare ? 30 : 24;
  const textAlign = align === "flex-start" ? "left" : "right";
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: c.isStory ? 20 : 14, alignItems: align }}>
      <span
        style={{
          fontSize: nameSize,
          fontWeight: 700,
          fontFamily: c.fontFamily,
          color: align === "flex-start" ? MINT : CORAL,
          letterSpacing: "-0.02em",
          textAlign,
        }}
      >
        {name}
      </span>
      {items.map((t, i) => (
        <span
          key={i}
          style={{
            fontSize: rowSize,
            color: "#e8f4ff",
            fontFamily: c.fontFamily,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textAlign,
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/** Two columns and a rule. Our one ownable claim, drawn. */
function ContrastBody({
  c,
  leftName,
  rightName,
  rows,
}: {
  c: Chrome;
  leftName: string;
  rightName: string;
  rows: [string, string][];
}) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: c.isStory ? 40 : 28 }}>
      <ContrastColumn c={c} name={leftName} items={rows.map((r) => r[0])} align="flex-start" />
      <div style={{ display: "flex", width: 2, background: "rgba(146,190,220,0.25)" }} />
      <ContrastColumn c={c} name={rightName} items={rows.map((r) => r[1])} align="flex-end" />
    </div>
  );
}

/** The closing line, which is the only sentence in the piece written to be quoted. */
function VerdictBody({ c, quote }: { c: Chrome; quote: string }) {
  const size = quote.length > 170 ? (c.isStory ? 38 : 28) : quote.length > 100 ? (c.isStory ? 46 : 34) : c.isStory ? 58 : 42;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: c.isStory ? 24 : 16 }}>
      <span style={{ fontSize: c.isStory ? 110 : 80, fontWeight: 700, color: CORAL, lineHeight: 0.7, fontFamily: c.fontFamily }}>
        &ldquo;
      </span>
      <span
        style={{
          fontSize: size,
          fontWeight: 700,
          fontFamily: c.fontFamily,
          color: "#ffffff",
          letterSpacing: "-0.03em",
          lineHeight: 1.22,
        }}
      >
        {quote}
      </span>
    </div>
  );
}

/** Seven names, numbered. A list piece maps to this with nothing left over. */
function ListBody({ c, items }: { c: Chrome; items: string[] }) {
  const size = items.length > 7 ? (c.isStory ? 34 : 24) : c.isStory ? 42 : c.isSquare ? 36 : 28;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: c.isStory ? 20 : items.length > 7 ? 10 : 14 }}>
      {items.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "baseline", gap: c.isStory ? 22 : 16 }}>
          <span
            style={{
              fontSize: size * 0.68,
              fontWeight: 700,
              color: CORAL,
              fontFamily: "monospace",
              letterSpacing: "0.02em",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            style={{
              fontSize: size,
              fontWeight: 700,
              fontFamily: c.fontFamily,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {t}
          </span>
        </div>
      ))}
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

  // ---- content-carrying variants ---------------------------------------
  // Style A falls through to the original render below, unchanged.
  const variant = url.searchParams.get("variant") ?? "cover";
  if (variant !== "cover") {
    const p = (k: string) => (url.searchParams.get(k) ?? "").trim();
    const chrome: Chrome = {
      isStory,
      isSquare,
      pad,
      category,
      cta: p("cta"),
      kicker: fitTitle(rawTitle, isStory ? 80 : 70),
      cover,
      fontFamily,
    };

    let body: React.ReactNode;
    switch (variant) {
      case "stat":
        body = <StatBody c={chrome} value={p("value")} label={p("label")} note={p("note")} />;
        break;
      case "contrast":
        body = (
          <ContrastBody
            c={chrome}
            leftName={p("leftName")}
            rightName={p("rightName")}
            rows={parseRows(p("rows")).slice(0, isStory ? 7 : 5)}
          />
        );
        break;
      case "verdict":
        body = <VerdictBody c={chrome} quote={fitTitle(p("quote"), isStory ? 260 : 200)} />;
        break;
      case "list":
        body = (
          <ListBody
            c={chrome}
            items={p("items").split(";").map((s) => s.trim()).filter(Boolean).slice(0, isStory ? 10 : 8)}
          />
        );
        break;
      default:
        return new Response(`Unknown variant "${variant}"`, { status: 400 });
    }

    return new ImageResponse(<Frame c={chrome}>{body}</Frame>, {
      width: w,
      height: h,
      fonts: fonts.length > 0 ? fonts : undefined,
    });
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
