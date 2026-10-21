import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color, fonts, gradient, safe } from "./theme";
import { Brand, Grain, Hatch, Monogram, RatingBar, Rise, useIn } from "./parts";
import { timeline, totalFrames } from "./timeline.mjs";

/**
 * "Ranked rundown": a ranking table from an article, counted down to number one, then
 * the article's turn (its pull quote) and its own ballot, then where to read it.
 * Data comes from scripts/from-article.mjs; nothing on screen is typed in here.
 */

export type RundownItem = { rank: string; name: string; club: string; rating: number; details: { label: string; value: string }[] };
export type RundownProps = {
  slug: string;
  url: string;
  cover: string | null;
  kicker: string;
  subtitle: string;
  edition: string;
  items: RundownItem[];
  quote: string | null;
  ballot: { points: number; name: string; note: string }[];
  when: string;
  /** Voice-over timings (data/<slug>.vo.json); scenes stretch to fit their lines. */
  vo?: { clips?: { scene: string; seconds: number; file: string }[] };
};

export const rundownDuration = (p: RundownProps) => totalFrames(p);

const ACCENTS = [color.emerald, color.cyan, color.sky, color.amber, color.rose];
/** "scoutgamer.com/lists/…" → "LISTS", the section a reader will land in. */
const section = (url: string) => (url.split("/")[1] ?? "").replace(/-/g, " ").toUpperCase();
const shortLabel = (l: string) => (/world cup/i.test(l) ? "WORLD CUP" : /20\d\d-\d\d/.test(l) ? (l.match(/20\d\d-\d\d/)![0] + " SEASON") : l.toUpperCase());

// ── scenes ────────────────────────────────────────────────────────────────────

const Hook: React.FC<RundownProps> = ({ cover, kicker, subtitle, edition, items }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.08, 1.0]);
  const [name, year] = kicker.match(/^(.*?)\s*(\d{4})?$/)!.slice(1);
  return (
    <AbsoluteFill>
      {cover ? <Img src={cover} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: "brightness(0.42) saturate(0.9)" }} /> : null}
      <AbsoluteFill style={{ background: `linear-gradient(to top, ${color.bg} 8%, transparent 55%), linear-gradient(to bottom, ${color.bg} 0%, transparent 30%)` }} />
      <Brand tag={`EA FC ${edition}`} />
      <div style={{ position: "absolute", left: safe.x, right: safe.x, bottom: safe.bottom + 40 }}>
        <Rise delay={4}><div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.24em", color: color.emerald, marginBottom: 26 }}>{items.length} NOMINEES</div></Rise>
        <Rise delay={8}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 168, lineHeight: 0.88, letterSpacing: "-0.05em", color: color.text }}>{name}</div>
        </Rise>
        {year ? (
          <Rise delay={14}>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 168, lineHeight: 0.95, letterSpacing: "-0.05em", background: gradient, WebkitBackgroundClip: "text", color: "transparent" }}>{year}</div>
          </Rise>
        ) : null}
        <Rise delay={22}><div style={{ fontFamily: fonts.body, fontSize: 44, lineHeight: 1.25, color: color.textSecondary, marginTop: 34, maxWidth: 860 }}>{subtitle}</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

const Progress: React.FC<{ total: number; index: number }> = ({ total, index }) => (
  <div style={{ position: "absolute", top: safe.top + 10, left: safe.x, right: safe.x, display: "flex", gap: 10 }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i <= index ? color.emerald : color.surface }} />
    ))}
  </div>
);

const Item: React.FC<{ item: RundownItem; index: number; total: number; edition: string }> = ({ item, index, total, edition }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const accent = ACCENTS[index % ACCENTS.length];
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = useIn(0, 16);
  const top = item.rank.replace("=", "") === "1";
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-exit * 60}px)` }}>
      <Progress total={total} index={index} />
      {/* Rank numeral, huge and outlined, behind the card */}
      <div style={{ position: "absolute", right: safe.x - 20, top: safe.top + 60, fontFamily: fonts.display, fontWeight: 700, fontSize: 520, lineHeight: 0.8, letterSpacing: "-0.08em", color: "transparent", WebkitTextStroke: `3px color-mix(in oklch, ${accent} 45%, transparent)`, opacity: enter, transform: `translateX(${(1 - enter) * 80}px)` }}>
        {item.rank}
      </div>
      <div style={{ position: "absolute", left: safe.x, right: safe.x + safe.rail, top: safe.top + 80, bottom: safe.bottom - 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ opacity: enter, transform: `scale(${0.9 + enter * 0.1})`, transformOrigin: "left top" }}>
          <Monogram name={item.name} size={240} accent={accent} />
        </div>
        <Rise delay={4}>
          <div style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: "0.22em", color: accent, marginTop: 56 }}>
            {/* The countdown is the game's order, not ours: say so on every card. */}
            {top ? `FC ${edition}'S No. 1` : `FC ${edition} RANK ${item.rank.replace("=", "")}${item.rank.startsWith("=") ? " (TIED)" : ""}`} · {item.club.toUpperCase()}
          </div>
        </Rise>
        <Rise delay={7}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: item.name.length > 16 ? 96 : 118, lineHeight: 0.95, letterSpacing: "-0.045em", color: color.text, marginTop: 18 }}>{item.name}</div>
        </Rise>
        <div style={{ marginTop: 72 }}>
          <RatingBar value={item.rating} delay={10} accent={accent} label={`EA FC ${edition} RATING`} />
        </div>
        <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 30 }}>
          {item.details.map((d, i) => (
            <Rise key={d.label} delay={22 + i * 6} distance={24}>
              <div style={{ borderTop: `1px solid ${color.border}`, paddingTop: 20 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.2em", color: color.muted }}>{shortLabel(d.label)}</div>
                <div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 46, lineHeight: 1.2, color: color.textSecondary, marginTop: 6 }}>{d.value}</div>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Quote: React.FC<{ quote: string }> = ({ quote }) => (
  <AbsoluteFill>
    <Hatch opacity={0.04} />
    <div style={{ position: "absolute", left: safe.x, right: safe.x, top: safe.top, bottom: safe.bottom, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Rise><div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.24em", color: color.amber }}>BUT THE JURY JUDGES THE SEASON</div></Rise>
      <Rise delay={8}>
        <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 100, lineHeight: 1.05, letterSpacing: "-0.04em", color: color.text, marginTop: 48 }}>
          <span style={{ background: gradient, WebkitBackgroundClip: "text", color: "transparent" }}>“</span>{quote}<span style={{ background: gradient, WebkitBackgroundClip: "text", color: "transparent" }}>”</span>
        </div>
      </Rise>
    </div>
  </AbsoluteFill>
);

const Ballot: React.FC<{ ballot: RundownProps["ballot"] }> = ({ ballot }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: safe.x, right: safe.x + safe.rail, top: safe.top, bottom: safe.bottom, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Rise><div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.24em", color: color.emerald }}>OUR BALLOT</div></Rise>
      <Rise delay={4}><div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 84, lineHeight: 1, letterSpacing: "-0.04em", color: color.text, marginTop: 20 }}>How we would vote</div></Rise>
      <div style={{ marginTop: 70, display: "flex", flexDirection: "column", gap: 44 }}>
        {ballot.map((b, i) => (
          <Rise key={b.name} delay={14 + i * 12} distance={50}>
            <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
              <div style={{ minWidth: 150, fontFamily: fonts.display, fontWeight: 700, fontSize: 132, lineHeight: 0.85, letterSpacing: "-0.05em", background: i === 0 ? gradient : "none", WebkitBackgroundClip: i === 0 ? "text" : undefined, color: i === 0 ? "transparent" : color.muted }}>{b.points}</div>
              <div style={{ paddingTop: 6 }}>
                <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 58, letterSpacing: "-0.03em", color: color.text }}>{b.name}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 36, lineHeight: 1.3, color: color.muted, marginTop: 8 }}>{b.note}</div>
              </div>
            </div>
          </Rise>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

const Close: React.FC<RundownProps> = ({ when, url }) => {
  const date = when.match(/\d{1,2} [A-Z][a-z]+/)?.[0];
  const venue = when.match(/at the ([A-Z][\w' ]+?(?: Palladium| Stadium| Theatre| Arena)?)(?:,|\.|$)/)?.[1];
  return (
    <AbsoluteFill>
      <Hatch opacity={0.05} />
      <div style={{ position: "absolute", left: safe.x, right: safe.x, top: safe.top, bottom: safe.bottom, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {date ? (
          <>
            <Rise><div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.24em", color: color.muted }}>WINNER ANNOUNCED</div></Rise>
            <Rise delay={6}><div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 150, lineHeight: 0.9, letterSpacing: "-0.05em", background: gradient, WebkitBackgroundClip: "text", color: "transparent", marginTop: 20 }}>{date}</div></Rise>
            {venue ? <Rise delay={10}><div style={{ fontFamily: fonts.body, fontSize: 46, color: color.textSecondary, marginTop: 18 }}>{venue}</div></Rise> : null}
          </>
        ) : null}
        <Rise delay={20}>
          <div style={{ marginTop: 110, padding: "40px 44px", borderRadius: 28, background: color.surface, border: `1px solid ${color.border}` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.2em", color: color.emerald }}>THE FULL READ</div>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 64, letterSpacing: "-0.03em", color: color.text, marginTop: 12 }}>scoutgamer.com</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.12em", color: color.muted, marginTop: 10 }}>{section(url)}</div>
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

// ── the composition ─────────────────────────────────────────────────────────────

export const Rundown: React.FC<RundownProps> = (props) => {
  const scenes = timeline(props);
  const at = (scene: string) => scenes.find((t) => t.scene === scene)!;
  const seq = (scene: string) => ({ from: at(scene).from, durationInFrames: at(scene).frames });
  return (
    <AbsoluteFill style={{ background: color.bg, color: color.text }}>
      <Sequence {...seq("hook")}><Hook {...props} /></Sequence>
      {props.items.map((item, i) => (
        <Sequence key={item.name} {...seq(`item-${String(i).padStart(2, "0")}`)}>
          <Brand tag={`EA FC ${props.edition}`} />
          <Item item={item} index={i} total={props.items.length} edition={props.edition} />
        </Sequence>
      ))}
      {props.quote ? <Sequence {...seq("quote")}><Brand /><Quote quote={props.quote} /></Sequence> : null}
      {props.ballot.length ? <Sequence {...seq("ballot")}><Brand /><Ballot ballot={props.ballot} /></Sequence> : null}
      <Sequence {...seq("close")}><Brand /><Close {...props} /></Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
