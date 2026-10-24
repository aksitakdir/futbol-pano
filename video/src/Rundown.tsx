import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Look, color, fonts, gradient, gradientText, safe, themeVars, useLook, type ThemeName } from "./theme";
import { Brand, Grain, Hatch, Monogram, RatingBar, Rise, useIn, IN_PLACE } from "./parts";
import { Backdrop, backdropLayers, type BackdropSpec } from "./Backdrop";
import { Captions, type Cue } from "./Captions";
import { keepTogether, rankCaption, section, shortLabel, whenParts } from "./labels";
import { timeline, totalFrames } from "./timeline.mjs";

/**
 * "Ranked rundown": a ranking table from an article, counted down to number one, then
 * the article's turn (its pull quote) and its own ballot, then where to read it.
 * Data comes from scripts/from-article.mjs; nothing on screen is typed in here.
 */

export type RundownItem = {
  rank: string; name: string; club: string; rating: number; details: { label: string; value: string }[];
  /** Jump rankings: the earlier edition's rating and the rise. */
  from?: number; jump?: number;
};
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
  /** "rating" ranks by the card; "jump" by the rise from `fromEdition` to `edition`. */
  mode?: "rating" | "jump";
  fromEdition?: string | null;
  countLabel?: string;
  /** The eyebrow over the pull quote. */
  turn?: string;
  /** "12 October 2026": when the article's figures were taken. */
  asOf?: string | null;
  /** Voice-over timings (data/<slug>.vo.json); scenes stretch to fit their lines. */
  vo?: { clips?: { scene: string; seconds: number; file: string }[] };
  /** Set by render.mjs from the faces in the cover. */
  backdrop?: Partial<BackdropSpec>;
  /** Extra backdrop images (the cover's other Midjourney variations), set by render.mjs. */
  backdrops?: { src: string; spec?: Partial<BackdropSpec> }[];
  /** Faces in the cover that macOS Vision misses (painted ones), as fractions of its width. */
  coverFaces?: { x: number; w: number }[];
  /** The palette (render.mjs --theme). */
  theme?: ThemeName;
  /** Burnt-in captions from the voice-over (render.mjs; src/captions.mjs). */
  captions?: Cue[];
};

export const rundownDuration = (p: RundownProps) => totalFrames(p);

const ACCENTS = [color.emerald, color.cyan, color.sky, color.amber, color.rose];
/** Kept clear at the bottom of every scene for the captions, when there are any. */
const CAPTION_BAND = 140;
/** The card column's width, and what is left of it beside the 240px tile. */
const COLUMN = 1080 - safe.x * 2 - safe.rail;
const NUMERAL_ROOM = COLUMN - 240 - 40;

// ── scenes ────────────────────────────────────────────────────────────────────

const Hook: React.FC<RundownProps> = ({ cover, kicker, subtitle, edition, items, countLabel, asOf }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.08, 1.0]);
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const [name, year] = kicker.match(/^(.*?)\s*(\d{4})?$/)!.slice(1);
  const look = useLook();
  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      {cover ? <Img src={cover} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: look.cover }} /> : null}
      <AbsoluteFill style={{ background: look.scrim }} />
      <Brand tag={`EA FC ${edition}`} />
      <div style={{ position: "absolute", left: safe.x, right: safe.x, bottom: safe.bottom + 40 + look.band }}>
        <Rise delay={IN_PLACE}><div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.24em", color: color.emerald, marginBottom: 26 }}>{items.length} {countLabel ?? "NOMINEES"}</div></Rise>
        <Rise delay={IN_PLACE}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: name.length > 30 ? 150 : 168, lineHeight: 0.96, letterSpacing: "-0.05em", color: color.text }}>{keepTogether(name)}</div>
        </Rise>
        {year ? (
          <Rise delay={IN_PLACE}>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 168, lineHeight: 0.95, letterSpacing: "-0.05em", ...gradientText() }}>{year}</div>
          </Rise>
        ) : null}
        <Rise delay={10}><div style={{ fontFamily: fonts.body, fontSize: 44, lineHeight: 1.25, color: color.textSecondary, marginTop: 34, maxWidth: 860, textWrap: "balance" }}>{subtitle}</div></Rise>
        {asOf ? <Rise delay={16}><div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.2em", color: color.muted, marginTop: 26 }}>FIGURES AS OF {asOf.toUpperCase()}</div></Rise> : null}
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

const Item: React.FC<{ item: RundownItem; index: number; total: number; edition: string; fromEdition?: string | null }> = ({ item, index, total, edition, fromEdition }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const accent = ACCENTS[index % ACCENTS.length];
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = useIn(0, 16);
  const jump = item.jump !== undefined && item.from !== undefined;
  const numeral = jump ? `+${item.jump}` : item.rank;
  const { band } = useLook();
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-exit * 60}px)` }}>
      <Progress total={total} index={index} />
      <div style={{ position: "absolute", left: safe.x, right: safe.x + safe.rail, top: safe.top + 80, bottom: safe.bottom - 40 + band, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* The tile, and beside it the rank (or the jump) in outline, sized to the room left so the two never touch. */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
          <div style={{ opacity: enter, transform: `scale(${0.9 + enter * 0.1})`, transformOrigin: "left top" }}>
            <Monogram name={item.name} size={240} accent={accent} />
          </div>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: Math.min(300, NUMERAL_ROOM / (numeral.length * 0.6)), lineHeight: 0.8, letterSpacing: "-0.06em", whiteSpace: "nowrap", color: "transparent", WebkitTextStroke: `4px color-mix(in oklch, ${accent} 75%, transparent)`, opacity: enter, transform: `translateX(${(1 - enter) * 80}px)` }}>
            {numeral}
          </div>
        </div>
        <Rise delay={4}>
          <div style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: "0.22em", color: accent, marginTop: 56 }}>
            {rankCaption(item.rank, edition, jump)} · {item.club.toUpperCase()}
          </div>
        </Rise>
        <Rise delay={7}>
          {/* A fixed-height row: a long name set smaller must not move the card's other rows */}
          <div style={{ height: 118 * 0.95, display: "flex", alignItems: "flex-end", fontFamily: fonts.display, fontWeight: 700, fontSize: Math.min(118, COLUMN / (item.name.length * 0.56)), lineHeight: 0.95, whiteSpace: "nowrap", letterSpacing: "-0.045em", color: color.text, marginTop: 18 }}>{item.name}</div>
        </Rise>
        <div style={{ marginTop: 72 }}>
          {jump
            ? <RatingBar value={item.rating} from={item.from} floor={50} delay={10} accent={accent} label={`EA FC ${fromEdition} → ${edition}`} />
            : <RatingBar value={item.rating} delay={10} accent={accent} label={`EA FC ${edition} RATING`} />}
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

export const Quote: React.FC<{ quote: string; turn?: string }> = ({ quote, turn }) => (
  <AbsoluteFill>
    <Hatch opacity={0.04} />
    <div style={{ position: "absolute", left: safe.x, right: safe.x, top: safe.top, bottom: safe.bottom + useLook().band, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Rise><div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.24em", color: color.amber }}>{turn ?? "BUT THE JURY JUDGES THE SEASON"}</div></Rise>
      <Rise delay={8}>
        <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 100, lineHeight: 1.05, letterSpacing: "-0.04em", color: color.text, marginTop: 48 }}>
          <span style={{ ...gradientText() }}>“</span>{quote}<span style={{ ...gradientText() }}>”</span>
        </div>
      </Rise>
    </div>
  </AbsoluteFill>
);

const Ballot: React.FC<{ ballot: RundownProps["ballot"] }> = ({ ballot }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: safe.x, right: safe.x + safe.rail, top: safe.top, bottom: safe.bottom + useLook().band, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Rise><div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.24em", color: color.emerald }}>OUR BALLOT</div></Rise>
      <Rise delay={4}><div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 84, lineHeight: 1, letterSpacing: "-0.04em", color: color.text, marginTop: 20 }}>How we would vote</div></Rise>
      <div style={{ marginTop: 70, display: "flex", flexDirection: "column", gap: 44 }}>
        {ballot.map((b, i) => (
          <Rise key={b.name} delay={14 + i * 12} distance={50}>
            <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
              <div style={{ minWidth: 150, fontFamily: fonts.display, fontWeight: 700, fontSize: 132, lineHeight: 0.85, letterSpacing: "-0.05em", ...(i === 0 ? gradientText() : { color: color.muted }) }}>{b.points}</div>
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

/**
 * The end card: the cover comes back sharp, and over it the brand and the address
 * in large type, so the last thing on screen is where to read the piece.
 */
export const Close: React.FC<{ when?: string; url: string; cover?: string | null; kicker?: string }> = ({ when, url, cover, kicker }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { date, venue } = whenParts(when);
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.1]);
  const show = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const tile = useIn(date ? 16 : 4, 14);
  const underline = interpolate(frame, [date ? 34 : 22, date ? 58 : 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const d = date ? 14 : 0;
  const dim = (pct: number) => `color-mix(in oklch, ${color.bg} ${pct}%, transparent)`;
  const glow = `color-mix(in oklch, ${color.emerald} 40%, transparent)`;
  const long = (kicker ?? "").length > 34;
  const look = useLook();
  return (
    <AbsoluteFill>
      {cover ? (
        <AbsoluteFill style={{ opacity: show, overflow: "hidden" }}>
          <Img src={cover} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: look.close }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 48% at 50% 54%, ${dim(look.closeWash[0])} 0%, ${dim(look.closeWash[1])} 70%, ${dim(look.closeWash[2])} 100%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${color.bg} 0%, transparent 20%, transparent 74%, ${color.bg} 100%)` }} />
      <div style={{ position: "absolute", left: safe.x, right: safe.x, top: safe.top, bottom: safe.bottom + look.band, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        {date ? (
          <div style={{ marginBottom: 96 }}>
            <Rise><div style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: "0.24em", color: color.textSecondary }}>WINNER ANNOUNCED</div></Rise>
            <Rise delay={5}><div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 132, lineHeight: 0.95, letterSpacing: "-0.05em", ...gradientText(), marginTop: 14 }}>{date}</div></Rise>
            {venue ? <Rise delay={9}><div style={{ fontFamily: fonts.body, fontSize: 40, color: color.textSecondary, marginTop: 10 }}>{venue}</div></Rise> : null}
          </div>
        ) : null}
        {/* The brand: a big SG tile with a glow, then the wordmark */}
        <div style={{ opacity: tile, transform: `scale(${0.7 + tile * 0.3})` }}>
          <div style={{ width: 168, height: 168, borderRadius: 40, padding: 3, background: gradient, boxShadow: `0 0 90px ${glow}` }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 37, background: color.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 700, fontSize: 70, letterSpacing: "-0.03em" }}>
              <span style={{ ...gradientText() }}>SG</span>
            </div>
          </div>
        </div>
        <Rise delay={d + 8}><div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 56, letterSpacing: "-0.03em", color: color.text, marginTop: 30 }}>Scout Gamer</div></Rise>
        <Rise delay={d + 14}><div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.3em", color: color.emerald, marginTop: date ? 64 : 96 }}>THE FULL READ</div></Rise>
        <Rise delay={d + 18}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 116, lineHeight: 1, letterSpacing: "-0.045em", ...gradientText(), marginTop: 18, whiteSpace: "nowrap" }}>scoutgamer.com</div>
        </Rise>
        <div style={{ width: `${underline * 100}%`, maxWidth: 820, height: 6, borderRadius: 999, background: gradient, boxShadow: `0 0 30px ${glow}`, marginTop: 22 }} />
        <Rise delay={d + 26}>
          {/* Section and title on one pill; a long title goes under the section instead of wrapping beside it. */}
          <div style={{ marginTop: 40, display: "inline-flex", flexDirection: long ? "column" : "row", alignItems: "center", gap: long ? 10 : 18, padding: long ? "22px 40px" : "18px 30px", borderRadius: long ? 32 : 999, maxWidth: 860, background: dim(70), border: `1px solid ${color.border}` }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.2em", color: color.emerald }}>{section(url)}</span>
            {kicker ? <span style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 32, lineHeight: 1.25, color: color.text, textWrap: "balance" }}>{keepTogether(kicker)}</span> : null}
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
    <Look.Provider value={{ theme: props.theme ?? "dark", band: props.captions?.length ? CAPTION_BAND : 0 }}>
    <AbsoluteFill style={{ ...themeVars(props.theme ?? "dark"), background: color.bg, color: color.text }}>
      <Backdrop src={props.cover} spec={props.backdrop} layers={backdropLayers(props.cover, props.backdrop, props.backdrops, scenes)} />
      <Sequence {...seq("hook")}><Hook {...props} /></Sequence>
      {props.items.map((item, i) => (
        <Sequence key={item.name} {...seq(`item-${String(i).padStart(2, "0")}`)}>
          <Brand tag={`EA FC ${props.edition}`} />
          <Item item={item} index={i} total={props.items.length} edition={props.edition} fromEdition={props.fromEdition} />
        </Sequence>
      ))}
      {props.quote ? <Sequence {...seq("quote")}><Brand /><Quote quote={props.quote} turn={props.turn} /></Sequence> : null}
      {props.ballot.length ? <Sequence {...seq("ballot")}><Brand /><Ballot ballot={props.ballot} /></Sequence> : null}
      <Sequence {...seq("close")}><Close {...props} /></Sequence>
      <Captions cues={props.captions} left={safe.x} right={safe.x + safe.rail} bottom={safe.bottom + 16} size={42} />
      <Grain />
    </AbsoluteFill>
    </Look.Provider>
  );
};
