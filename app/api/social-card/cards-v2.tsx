/**
 * Social cards, second generation (2026-10-12).
 *
 * WHY: the first content cards (stat / contrast / verdict / list, Sept 2026) were
 * built for the X format and stretched to the others. On a 4:5 post the content
 * filled about a quarter of the canvas and the rest was flat navy; the owner's
 * custom art for every article was either not sent to them or hidden under a 93%
 * overlay; the list card silently dropped every name after the eighth. Cards for
 * pieces worth reading looked like placeholders.
 *
 * The rules this generation is built on:
 * 1. The article's own art is part of every card, never cropped. X: full-bleed
 *    with the text on a dark left panel. 4:5 and 9:16: the 16:9 art sits whole in
 *    a band, the card's content below it. No art: a pitch-line pattern, so a
 *    card is never an empty rectangle.
 * 2. Type is sized to the box it lives in. Every body measures its own text and
 *    fills the space it is given; nothing is a fixed size for all three formats.
 * 3. Nothing is dropped silently. A list that does not fit says "+N more".
 * 4. Every string still comes verbatim from the article (lib/social-extract.mjs).
 *
 * Style A (`variant=cover`) lives in route.tsx and is unchanged.
 */
import type { ReactNode } from "react";

export type Fmt = "x" | "square" | "story";

export const SIZE: Record<Fmt, { w: number; h: number }> = {
  x: { w: 1200, h: 675 },
  square: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
};

const BG = "#07111f";
const INK = "#eef6ff";
const MUTED = "#9fbdd3";
const MINT = "#2fe6c4";
const CORAL = "#ff6b5a";
const GOLD = "#ffc23d";
const ACCENT = "linear-gradient(90deg, #00d4aa, #22d3ee, #FFB81C)";

export const TIER_COLOR: Record<string, string> = {
  generational: "#ffd166",
  "elite now": MINT,
  "elite-in-waiting": "#38bdf8",
  "ready now": "#a3e635",
  watchlist: GOLD,
  "raw gem": CORAL,
};

// ---- measuring ------------------------------------------------------------
// satori cannot fit text, so every body estimates its own lines. Space Grotesk
// averages ~0.55em per character in bold; the estimate errs on the wide side.

type Box = { left: number; top: number; width: number; height: number };

function lineCount(text: string, width: number, size: number, cw: number): number {
  const perLine = Math.max(1, Math.floor(width / (size * cw)));
  let lines = 1;
  let used = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const len = word.length;
    if (used === 0) used = len;
    else if (used + 1 + len <= perLine) used += 1 + len;
    else {
      lines++;
      used = len;
    }
  }
  return lines;
}

/** Largest size, stepping down, at which `text` fits `width` × `height`. */
function fit(text: string, width: number, height: number, max: number, min: number, lh = 1.15, cw = 0.56): number {
  for (let s = max; s > min; s -= 2) {
    if (lineCount(text, width, s, cw) * s * lh <= height) return s;
  }
  return min;
}

// ---- layout ---------------------------------------------------------------

type Layout = {
  fmt: Fmt;
  w: number;
  h: number;
  pad: number;
  art: "bleed" | "band" | "none";
  bandTop: number;
  bandH: number;
  headerTop: number;
  content: Box;
  footerBottom: number;
};

export function layout(fmt: Fmt, hasArt: boolean): Layout {
  const { w, h } = SIZE[fmt];
  if (fmt === "x") {
    const pad = 52;
    return {
      fmt, w, h, pad,
      art: hasArt ? "bleed" : "none",
      bandTop: 0, bandH: 0,
      headerTop: 38,
      content: { left: pad, top: 116, width: hasArt ? 600 : w - pad * 2, height: h - 116 - 128 },
      footerBottom: 34,
    };
  }
  if (fmt === "square") {
    const pad = 60;
    const bandH = Math.round((w * 9) / 16); // the art is 16:9 — the band shows all of it
    const top = hasArt ? bandH + 34 : 170;
    return {
      fmt, w, h, pad,
      art: hasArt ? "band" : "none",
      bandTop: 0, bandH,
      headerTop: 44,
      content: { left: pad, top, width: w - pad * 2, height: h - 168 - top },
      footerBottom: 52,
    };
  }
  // story: Instagram covers ~250px at the top and ~330px at the bottom with its UI
  const pad = 64;
  const bandH = Math.round((w * 9) / 16);
  const bandTop = 250;
  const top = hasArt ? bandTop + bandH + 40 : 300;
  return {
    fmt, w, h, pad,
    art: hasArt ? "band" : "none",
    bandTop, bandH,
    headerTop: 150,
    // the footer sits on the line Instagram's reply bar starts at; content ends above it
    content: { left: pad, top, width: w - pad * 2, height: 1500 - top },
    footerBottom: 300,
  };
}

// ---- furniture --------------------------------------------------------------

function Logo({ scale = 1, chip = false }: { scale?: number; chip?: boolean }) {
  const s = 44 * scale;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12 * scale,
        padding: chip ? `${8 * scale}px ${14 * scale}px ${8 * scale}px ${8 * scale}px` : 0,
        borderRadius: 14 * scale,
        background: chip ? "rgba(6,15,30,0.72)" : "transparent",
      }}
    >
      <div
        style={{
          width: s,
          height: s,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: s * 0.22,
          background: "linear-gradient(180deg, #1d2c40, #0c1623)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.16), 0 3px 0 #060d16",
        }}
      >
        <span style={{ fontSize: s * 0.36, fontWeight: 700, color: MINT, letterSpacing: "-0.04em" }}>SG</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 18 * scale, fontWeight: 700, color: INK, letterSpacing: "-0.02em", lineHeight: 1 }}>Scout Gamer</span>
        <span style={{ fontSize: 9.5 * scale, color: MUTED, letterSpacing: "0.2em", marginTop: 3 * scale, fontFamily: "Space Mono" }}>
          FOOTBALL × GAME CULTURE
        </span>
      </div>
    </div>
  );
}

function Pill({ text, color, scale = 1, solid = false }: { text: string; color: string; scale?: number; solid?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        padding: `${8 * scale}px ${16 * scale}px`,
        borderRadius: 999,
        background: solid ? color : "rgba(6,15,30,0.72)",
        border: `${1.5 * scale}px solid ${color}`,
      }}
    >
      <span
        style={{
          fontSize: 13 * scale,
          fontWeight: 700,
          color: solid ? BG : color,
          letterSpacing: "0.16em",
          fontFamily: "Space Mono",
        }}
      >
        {text.toUpperCase()}
      </span>
    </div>
  );
}

/** Faint pitch markings — the no-art backdrop, so a card is never an empty field. */
function Pitch({ w, h }: { w: number; h: number }) {
  const stroke = "rgba(47,230,196,0.09)";
  return (
    <svg width={w} height={h} viewBox="0 0 1050 680" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", left: 0, top: 0 }}>
      <rect x="20" y="20" width="1010" height="640" fill="none" stroke={stroke} strokeWidth="3" />
      <line x1="525" y1="20" x2="525" y2="660" stroke={stroke} strokeWidth="3" />
      <circle cx="525" cy="340" r="92" fill="none" stroke={stroke} strokeWidth="3" />
      <rect x="20" y="178" width="165" height="324" fill="none" stroke={stroke} strokeWidth="3" />
      <rect x="865" y="178" width="165" height="324" fill="none" stroke={stroke} strokeWidth="3" />
      <rect x="20" y="258" width="55" height="164" fill="none" stroke={stroke} strokeWidth="3" />
      <rect x="975" y="258" width="55" height="164" fill="none" stroke={stroke} strokeWidth="3" />
    </svg>
  );
}

export type FrameProps = {
  L: Layout;
  cover: string;
  category: string;
  kicker: string;
  cta: string;
  tier?: string;
  children: ReactNode;
};

/** Background, art, header and footer shared by every v2 card. */
export function Frame({ L, cover, category, kicker, cta, children }: FrameProps) {
  const scale = L.fmt === "story" ? 1.3 : L.fmt === "square" ? 1.15 : 1;
  const onArt = L.art !== "none" && (L.fmt === "x" || L.headerTop + 60 > L.bandTop);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: BG, fontFamily: "Space Grotesk" }}>
      {L.art === "none" ? <Pitch w={L.w} h={L.h} /> : null}

      {L.art === "bleed" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" style={{ position: "absolute", left: 0, top: 0, width: L.w, height: L.h, objectFit: "cover" }} />
          <div
            style={{
              position: "absolute", left: 0, top: 0, width: L.w, height: L.h, display: "flex",
              background: "linear-gradient(90deg, rgba(7,17,31,0.97) 0%, rgba(7,17,31,0.93) 44%, rgba(7,17,31,0.45) 66%, rgba(7,17,31,0.05) 100%)",
            }}
          />
        </>
      ) : null}

      {L.art === "band" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" style={{ position: "absolute", left: 0, top: L.bandTop, width: L.w, height: L.bandH, objectFit: "cover" }} />
          {/* fade the bottom of the band into the card */}
          <div
            style={{
              position: "absolute", left: 0, top: L.bandTop + L.bandH * 0.62, width: L.w, height: L.bandH * 0.38 + 2, display: "flex",
              background: `linear-gradient(180deg, rgba(7,17,31,0) 0%, ${BG} 100%)`,
            }}
          />
          {L.bandTop > 0 ? (
            <div
              style={{
                position: "absolute", left: 0, top: L.bandTop - 2, width: L.w, height: 70, display: "flex",
                background: `linear-gradient(0deg, rgba(7,17,31,0) 0%, ${BG} 100%)`,
              }}
            />
          ) : null}
        </>
      ) : null}

      <div style={{ position: "absolute", left: 0, top: 0, width: L.w, height: L.fmt === "story" ? 8 : 6, display: "flex", background: ACCENT }} />

      {/* header */}
      <div
        style={{
          position: "absolute", left: L.pad, right: L.pad, top: L.headerTop,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Logo scale={scale} chip={onArt} />
        {category ? <Pill text={category} color={GOLD} scale={scale} /> : null}
      </div>

      {/* body */}
      <div
        style={{
          position: "absolute", left: L.content.left, top: L.content.top,
          width: L.content.width, height: L.content.height,
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}
      >
        {children}
      </div>

      {/* footer */}
      <div
        style={{
          position: "absolute", left: L.pad, right: L.pad, bottom: L.footerBottom,
          display: "flex", flexDirection: "column", gap: 10 * scale,
        }}
      >
        <div style={{ display: "flex", width: "100%", height: 2, background: "rgba(146,190,220,0.22)" }} />
        {kicker ? (
          <span style={{ fontSize: 19 * scale, fontWeight: 700, color: "#dceefb", letterSpacing: "-0.015em", lineHeight: 1.2 }}>
            {kicker}
          </span>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14 * scale, color: MINT, letterSpacing: "0.12em", fontFamily: "Space Mono", fontWeight: 700 }}>
            {(cta || "Read the full report").toUpperCase()}
          </span>
          <span style={{ fontSize: 14 * scale, color: MUTED, letterSpacing: "0.16em", fontFamily: "Space Mono", fontWeight: 700 }}>
            SCOUTGAMER.COM
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- bodies -------------------------------------------------------------------

export function StatBody({ L, value, label, note }: { L: Layout; value: string; label: string; note: string }) {
  const { width, height } = L.content;
  const maxV = L.fmt === "story" ? 360 : L.fmt === "square" ? (height > 800 ? 380 : 290) : 210;
  let vSize = Math.min(maxV, height * 0.5, width / Math.max(1.6, value.length * 0.6));
  let lSize = 0;
  let nSize = 0;
  // Shrink the whole stack together until number + label + note fit the box.
  for (let i = 0; i < 30; i++) {
    lSize = fit(label, width, height * 0.22, Math.round(vSize * 0.3), 24, 1.1);
    nSize = note ? fit(note, width, height * 0.2, Math.round(lSize * 0.62), 18, 1.3, 0.5) : 0;
    const total =
      vSize * 0.15 + vSize * 0.95 + vSize * 0.16 +
      lineCount(label, width, lSize, 0.56) * lSize * 1.1 +
      (note ? vSize * 0.08 + lineCount(note, width, nSize, 0.5) * nSize * 1.3 : 0);
    if (total <= height * 0.96) break;
    vSize *= 0.93;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: vSize * 0.08 }}>
      <div style={{ display: "flex", width: vSize * 0.5, height: Math.max(6, vSize * 0.035), background: CORAL, marginBottom: vSize * 0.06 }} />
      <span style={{ fontSize: vSize, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.05em", lineHeight: 0.95 }}>{value}</span>
      <span style={{ fontSize: lSize, fontWeight: 700, color: MINT, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{label}</span>
      {note ? <span style={{ fontSize: nSize, fontWeight: 500, color: MUTED, lineHeight: 1.3 }}>{note}</span> : null}
    </div>
  );
}

export function VerdictBody({ L, quote }: { L: Layout; quote: string }) {
  const { width, height } = L.content;
  const max = L.fmt === "story" ? 90 : L.fmt === "square" ? (height > 800 ? 92 : 76) : 52;
  const size = fit(quote, width, height * 0.82, max, 24, 1.2);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: size * 0.3 }}>
      <span style={{ fontSize: size * 2.2, fontWeight: 700, color: CORAL, lineHeight: 0.6, height: size * 1.1 }}>&ldquo;</span>
      <span style={{ fontSize: size, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.2 }}>{quote}</span>
    </div>
  );
}

export function ListBody({ L, items, heading }: { L: Layout; items: string[]; heading: string }) {
  const { width, height } = L.content;
  const cap = L.fmt === "story" ? 16 : 14;
  const shown = items.slice(0, cap);
  const more = items.length - shown.length;
  const twoCol = shown.length > (L.fmt === "x" ? 5 : L.fmt === "square" ? 7 : 9);
  const cols = twoCol ? 2 : 1;
  const rows = Math.ceil(shown.length / cols) + (more > 0 ? 1 : 0);
  const longest = Math.max(...shown.map((s) => s.length), 6);
  const headSize = heading ? Math.min(30, Math.max(18, width / 28)) : 0;
  const avail = height - (heading ? headSize * 2.2 : 0);
  const colW = width / cols - (twoCol ? 24 : 0);
  const max = L.fmt === "x" ? 46 : height > 800 ? 80 : 64;
  const size = Math.max(20, Math.min(max, avail / (rows * 1.55), (colW - 70) / (longest * 0.56)));
  const half = Math.ceil(shown.length / cols);
  const column = (list: string[], offset: number) => (
    <div style={{ display: "flex", flexDirection: "column", gap: size * 0.42, width: colW }}>
      {list.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "baseline", gap: size * 0.45 }}>
          <span style={{ fontSize: size * 0.62, fontWeight: 700, color: CORAL, fontFamily: "Space Mono", width: size * 1.05 }}>
            {String(offset + i + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: size, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.1 }}>{t}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: headSize * 0.9 }}>
      {heading ? (
        <span style={{ fontSize: headSize, fontWeight: 700, color: MINT, letterSpacing: "0.14em", fontFamily: "Space Mono" }}>
          {heading.toUpperCase()}
        </span>
      ) : null}
      <div style={{ display: "flex", gap: 48 }}>
        {column(shown.slice(0, half), 0)}
        {twoCol ? column(shown.slice(half), half) : null}
      </div>
      {more > 0 ? (
        <span style={{ fontSize: size * 0.6, fontWeight: 700, color: MUTED, fontFamily: "Space Mono", letterSpacing: "0.1em" }}>
          + {more} MORE IN THE REPORT
        </span>
      ) : null}
    </div>
  );
}

export function ContrastBody({ L, left, right, rows }: { L: Layout; left: string; right: string; rows: [string, string][] }) {
  const { width, height } = L.content;
  const colW = width / 2 - 28;
  const max = L.fmt === "x" ? 34 : height > 800 ? 54 : 46;
  // Cells wrap, so size to the height the wrapped rows actually take.
  const total = (s: number) =>
    s * 1.35 * 1.25 +
    rows.reduce((h, [l, r]) => h + Math.max(lineCount(l, colW, s, 0.52), lineCount(r, colW, s, 0.52)) * s * 1.25 + s * 1.3, 0);
  let size = max;
  while (size > 16 && total(size) > height * 0.95) size -= 1;
  const nameSize = Math.min(size * 1.4, colW / (Math.max(left.length, right.length, 4) * 0.56));
  const cell = (t: string, align: "left" | "right") => (
    <span style={{ fontSize: size, fontWeight: 700, color: INK, lineHeight: 1.25, textAlign: align, width: colW }}>{t}</span>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: size * 0.75 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
        <div style={{ display: "flex", width: colW }}>
          <span style={{ fontSize: nameSize, fontWeight: 700, color: MINT, letterSpacing: "-0.02em" }}>{left}</span>
        </div>
        <div style={{ display: "flex", width: colW, justifyContent: "flex-end" }}>
          <span style={{ fontSize: nameSize, fontWeight: 700, color: CORAL, letterSpacing: "-0.02em" }}>{right}</span>
        </div>
        <span
          style={{
            position: "absolute", left: width / 2 - size * 0.6, bottom: nameSize * 0.12,
            fontSize: size * 0.7, fontWeight: 700, color: MUTED, fontFamily: "Space Mono",
          }}
        >
          VS
        </span>
      </div>
      {rows.map(([l, r], i) => (
        <div
          key={i}
          style={{
            display: "flex", justifyContent: "space-between", paddingTop: size * 0.55,
            borderTop: "1.5px solid rgba(146,190,220,0.2)",
          }}
        >
          {cell(l, "left")}
          {cell(r, "right")}
        </div>
      ))}
    </div>
  );
}

/** The Scout Gamer Read: one player, the game's card against the football. */
/** "Serie A|26/27|4|4|335|1|0|2026-10-12" → the season strip on the player card. */
function parseSeason(raw: string) {
  const [competition, season, apps, starts, minutes, goals, assists, asOf] = (raw ?? "").split("|");
  if (!competition || !apps) return null;
  const d = asOf ? new Date(asOf) : null;
  const when = d && !isNaN(+d) ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) : "";
  return { competition, season, apps, starts, minutes, goals, assists, when };
}

export function PlayerBody({
  L, name, meta, ovr, edition, stats, line, real, tier, season,
}: {
  L: Layout; name: string; meta: string; ovr: string; edition: string; stats: string[]; line: string; real: string; tier: string; season?: string;
}) {
  const sz = parseSeason(season ?? "");
  const { width, height } = L.content;
  const tierColor = TIER_COLOR[tier.toLowerCase()] ?? MINT;
  const big = L.fmt !== "x";
  const roomy = height > 800; // no art: almost twice the room, so everything grows
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const nameSize = fit(name, width, height * (big ? 0.22 : 0.2), roomy ? 136 : big ? 104 : 62, 34, 1.02, 0.58);
  const badge = Math.min(height * (big ? (sz ? 0.2 : 0.24) : sz ? 0.24 : 0.3), roomy ? 250 : big ? (sz ? 160 : 190) : sz ? 104 : 132);
  const chip = Math.max(18, badge * (big ? 0.17 : 0.16));
  const textSize = fit(`${line} ${real}`, width, height * (sz ? 0.15 : 0.2), roomy ? 46 : big ? 36 : 24, 16, 1.3, 0.5);
  const cell = roomy ? 44 : big ? 36 : 24;
  const metaSize = roomy ? 30 : big ? 25 : 17;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: height * (roomy ? 0.03 : 0.028) }}>
      {tier ? (
        <div style={{ display: "flex" }}>
          <Pill text={`Tier · ${tier}`} color={tierColor} scale={roomy ? 1.5 : big ? 1.25 : 1} solid />
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: nameSize * 0.12 }}>
        <span style={{ fontSize: nameSize, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.04em", lineHeight: 1.02 }}>{name}</span>
        {meta ? <span style={{ fontSize: metaSize, color: MUTED, fontWeight: 500, lineHeight: 1.25 }}>{meta}</span> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: badge * 0.16 }}>
        {ovr ? (
          <div
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              width: badge * 0.92, height: badge, borderRadius: badge * 0.1,
              background: "linear-gradient(160deg, #1b3550, #0c1a2b)", border: `2px solid ${tierColor}`,
            }}
          >
            <span style={{ fontSize: badge * 0.48, fontWeight: 700, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.04em" }}>{ovr}</span>
            <span style={{ fontSize: badge * 0.1, color: tierColor, fontFamily: "Space Mono", fontWeight: 700, letterSpacing: "0.12em", marginTop: badge * 0.05 }}>
              {`EA FC ${edition || "27"}`}
            </span>
          </div>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", gap: chip * 0.45 }}>
          {stats.slice(0, 3).map((s, i) => {
            const [k, v] = s.split(/\s+/);
            return (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: chip * 0.5 }}>
                <span style={{ fontSize: chip * 0.8, color: MUTED, fontFamily: "Space Mono", fontWeight: 700, width: chip * 2.4 }}>{k}</span>
                <span style={{ fontSize: chip * 1.5, color: "#ffffff", fontWeight: 700, lineHeight: 1 }}>{v}</span>
              </div>
            );
          })}
        </div>
      </div>
      {sz ? (
        <div
          style={{
            display: "flex", flexDirection: "column", gap: cell * 0.3,
            padding: `${cell * 0.45}px ${cell * 0.6}px`, borderRadius: cell * 0.3,
            background: "rgba(146,190,220,0.08)", border: "1.5px solid rgba(146,190,220,0.18)",
          }}
        >
          <span style={{ fontSize: cell * 0.42, color: MUTED, fontFamily: "Space Mono", fontWeight: 700, letterSpacing: "0.12em" }}>
            {`THIS SEASON · ${sz.competition.toUpperCase()}${sz.when ? ` · AS OF ${sz.when.toUpperCase()}` : ""}`}
          </span>
          <div style={{ display: "flex", gap: cell * 1.1 }}>
            {[
              [sz.starts, sz.starts === "1" ? "START" : "STARTS"],
              [sz.minutes, "MIN"],
              [sz.goals, sz.goals === "1" ? "GOAL" : "GOALS"],
              [sz.assists, sz.assists === "1" ? "ASSIST" : "ASSISTS"],
            ].map(([v, k], i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: cell * 0.22 }}>
                <span style={{ fontSize: cell, color: "#ffffff", fontWeight: 700, lineHeight: 1 }}>{v}</span>
                <span style={{ fontSize: cell * 0.36, color: MUTED, fontFamily: "Space Mono", fontWeight: 700 }}>{k}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {line || real ? (
        <div style={{ display: "flex", flexDirection: "column", gap: textSize * 0.35 }}>
          {line ? <span style={{ fontSize: textSize, color: INK, fontWeight: 500, lineHeight: 1.3 }}>{cap(line)}</span> : null}
          {real ? (
            <span style={{ fontSize: textSize, color: tierColor, fontWeight: 700, lineHeight: 1.3 }}>{`Real-level: ${real}`}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** The headline card, art first and uncropped — Style A's job without the crop. */
export function HeadlineBody({ L, title, dek }: { L: Layout; title: string; dek: string }) {
  const { width, height } = L.content;
  const max = L.fmt === "story" ? 92 : L.fmt === "square" ? 80 : 58;
  const tSize = fit(title, width, height * (dek ? 0.62 : 0.85), max, 30, 1.08, 0.55);
  const dSize = dek ? fit(dek, width, height * 0.3, Math.round(tSize * 0.42), 18, 1.35, 0.5) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tSize * 0.4 }}>
      <div style={{ display: "flex", width: 90, height: 7, background: CORAL }} />
      <span style={{ fontSize: tSize, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.035em", lineHeight: 1.08 }}>{title}</span>
      {dek ? <span style={{ fontSize: dSize, fontWeight: 500, color: "#c9ddec", lineHeight: 1.35 }}>{dek}</span> : null}
    </div>
  );
}

// ---- fonts --------------------------------------------------------------------

type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: "normal" };
let fontsPromise: Promise<Font[]> | null = null;

async function googleFont(family: string, weights: number[], name: string): Promise<Font[]> {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weights.join(";")}&display=swap`)).text();
  const out: Font[] = [];
  for (const block of css.split("@font-face").slice(1)) {
    const weight = Number(block.match(/font-weight:\s*(\d+)/)?.[1] ?? 400) as 400 | 500 | 700;
    const src = block.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!src || out.some((f) => f.weight === weight)) continue;
    out.push({ name, data: await (await fetch(src)).arrayBuffer(), weight, style: "normal" });
  }
  return out;
}

/** Loaded once per server instance — the first generation fetched it on every card. */
export function loadFonts(): Promise<Font[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      googleFont("Space+Grotesk", [500, 700], "Space Grotesk"),
      googleFont("Space+Mono", [700], "Space Mono"),
    ])
      .then((r) => r.flat())
      .catch(() => {
        fontsPromise = null;
        return [];
      });
  }
  return fontsPromise;
}
