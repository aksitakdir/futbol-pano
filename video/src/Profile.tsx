import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Look, color, fonts, gradient, gradientText, safe, themeVars, useLook, type ThemeName } from "./theme";
import { Brand, Grain, Rise, useIn, IN_PLACE } from "./parts";
import { Backdrop, backdropLayers, type BackdropSpec } from "./Backdrop";
import { Captions, type Cue } from "./Captions";
import { keepTogether, section } from "./labels";
import { Close, Quote } from "./Rundown";
import { timeline, totalFrames } from "./timeline.mjs";

/**
 * "Profile": an article's stat boxes, one big number at a time, then its two-sided
 * comparison row by row, its pull quote, and where to read it. For radar and
 * tactics-lab pieces, where the story is a few numbers rather than a ranking.
 * Data comes from scripts/from-article.mjs; nothing on screen is typed in here.
 */

export type ProfileProps = {
  slug: string;
  url: string;
  cover: string | null;
  kicker: string;
  subtitle: string;
  asOf?: string | null;
  turn?: string;
  stats: { value: string; label: string; note: string }[];
  /** `sub` is the vs block's subtitle line, e.g. the two dates of a receipt. */
  contrast: { left: string; right: string; rows: string[][]; sub?: string[] } | null;
  quote: string | null;
  vo?: { clips?: { scene: string; seconds: number; file: string }[] };
  /** Set by render.mjs from the faces in the cover. */
  backdrop?: Partial<BackdropSpec>;
  /** Extra backdrop images (the cover's other Midjourney variations), set by render.mjs. */
  backdrops?: { src: string; spec?: Partial<BackdropSpec> }[];
  /** Faces in the cover that macOS Vision misses (painted ones), as fractions of its width. */
  coverFaces?: { x: number; w: number }[];
  /** Where the vertical opening crops the 16:9 cover, as a fraction of its width (default the centre): a subject right of centre stays in frame. */
  coverX?: number;
  theme?: ThemeName;
  captions?: Cue[];
};

export const profileDuration = (p: ProfileProps) => totalFrames(p);


const Hook: React.FC<ProfileProps> = ({ cover, kicker, subtitle, url, asOf, coverX }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.08, 1.0]);
  const look = useLook();
  return (
    <AbsoluteFill>
      {cover ? <Img src={cover} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(coverX ?? 0.5) * 100}% 50%`, transform: `scale(${zoom})`, transformOrigin: `${(coverX ?? 0.5) * 100}% 50%`, filter: look.cover }} /> : null}
      <AbsoluteFill style={{ background: look.scrim }} />
      <Brand tag={section(url)} />
      <div style={{ position: "absolute", left: safe.x, right: safe.x, bottom: safe.bottom + 40 + look.band }}>
        <Rise delay={IN_PLACE}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: kicker.length > 22 ? 118 : 148, lineHeight: 0.96, letterSpacing: "-0.05em", color: color.text }}>{keepTogether(kicker)}</div>
        </Rise>
        {/* The subtitle is the claim: in place from frame 0 with the title, since X shows that frame as the cover */}
        <Rise delay={IN_PLACE}><div style={{ fontFamily: fonts.body, fontSize: 44, lineHeight: 1.25, color: color.textSecondary, marginTop: 34, maxWidth: 880, textWrap: "balance" }}>{subtitle}</div></Rise>
        {asOf ? <Rise delay={16}><div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.2em", color: color.muted, marginTop: 26 }}>FIGURES AS OF {asOf.toUpperCase()}</div></Rise> : null}
      </div>
    </AbsoluteFill>
  );
};

const ACCENTS = [color.emerald, color.cyan, color.sky, color.amber];

/** One stat box: the number large, its label, its note. */
const Stat: React.FC<{ stat: ProfileProps["stats"][number]; index: number; total: number }> = ({ stat, index, total }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const accent = ACCENTS[index % ACCENTS.length];
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pop = useIn(2, 12);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-exit * 60}px)` }}>
      <div style={{ position: "absolute", top: safe.top + 10, left: safe.x, right: safe.x, display: "flex", gap: 10 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i <= index ? accent : color.surface }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: safe.x, right: safe.x + safe.rail, top: safe.top, bottom: safe.bottom + useLook().band, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ opacity: pop, transform: `scale(${0.82 + pop * 0.18})`, transformOrigin: "left center" }}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: stat.value.length > 4 ? 260 : 360, lineHeight: 0.85, letterSpacing: "-0.06em", ...gradientText(`linear-gradient(120deg, ${accent} 0%, ${color.text} 140%)`) }}>
            {stat.value}
          </div>
        </div>
        <Rise delay={8}><div style={{ fontFamily: fonts.mono, fontSize: 34, letterSpacing: "0.24em", color: accent, marginTop: 40 }}>{stat.label.toUpperCase()}</div></Rise>
        <Rise delay={14}><div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 52, lineHeight: 1.25, color: color.textSecondary, marginTop: 28, maxWidth: 860, textWrap: "balance" }}>{stat.note}</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

/** The article's two-sided comparison: "Approach: …" on each side, row by row. */
const Contrast: React.FC<{ contrast: NonNullable<ProfileProps["contrast"]> }> = ({ contrast }) => {
  const split = (cell: string) => {
    const i = cell.indexOf(": ");
    return i > 0 ? [cell.slice(0, i), cell.slice(i + 2)] : ["", cell];
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: safe.x, right: safe.x, top: safe.top + 40, bottom: safe.bottom - 20 + useLook().band, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* The two names head the same two columns as the rows below them, so each side
            reads down its own column; the subtitle line (a receipt's two dates) sits under them. */}
        <Rise>
          <div style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.2em", color: color.muted, marginBottom: 14 }}>VS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "end", fontFamily: fonts.display, fontWeight: 700, fontSize: Math.min(80, 430 / (Math.max(contrast.left.length, contrast.right.length) * 0.56)), lineHeight: 1, letterSpacing: "-0.04em" }}>
            <span style={{ color: color.emerald }}>{contrast.left}</span>
            <span style={{ color: color.sky }}>{contrast.right}</span>
          </div>
          {contrast.sub ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginTop: 14, fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.2em", color: color.muted }}>
              <span>{contrast.sub[0]?.toUpperCase()}</span>
              <span>{contrast.sub[1]?.toUpperCase()}</span>
            </div>
          ) : null}
        </Rise>
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 34 }}>
          {contrast.rows.map((row, i) => {
            const [label, left] = split(row[0]);
            const [, right] = split(row[1]);
            return (
              <Rise key={i} delay={10 + i * 10} distance={30}>
                <div style={{ borderTop: `1px solid ${color.border}`, paddingTop: 20 }}>
                  {label ? <div style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.2em", color: color.muted, marginBottom: 12 }}>{label.toUpperCase()}</div> : null}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
                    <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 40, lineHeight: 1.2, color: color.text }}>{left}</div>
                    <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 40, lineHeight: 1.2, color: color.textSecondary }}>{right}</div>
                  </div>
                </div>
              </Rise>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Profile: React.FC<ProfileProps> = (props) => {
  const scenes = timeline(props);
  const at = (scene: string) => scenes.find((t) => t.scene === scene)!;
  const seq = (scene: string) => ({ from: at(scene).from, durationInFrames: at(scene).frames });
  const tag = section(props.url);
  return (
    <Look.Provider value={{ theme: props.theme ?? "dark", band: props.captions?.length ? 140 : 0 }}>
    <AbsoluteFill style={{ ...themeVars(props.theme ?? "dark"), background: color.bg, color: color.text }}>
      <Backdrop src={props.cover} spec={props.backdrop} layers={backdropLayers(props.cover, props.backdrop, props.backdrops, scenes)} />
      <Sequence {...seq("hook")}><Hook {...props} /></Sequence>
      {props.stats.map((stat, i) => (
        <Sequence key={stat.label} {...seq(`stat-${String(i).padStart(2, "0")}`)}>
          <Brand tag={tag} />
          <Stat stat={stat} index={i} total={props.stats.length} />
        </Sequence>
      ))}
      {props.contrast ? <Sequence {...seq("contrast")}><Brand tag={tag} /><Contrast contrast={props.contrast} /></Sequence> : null}
      {props.quote ? <Sequence {...seq("quote")}><Brand /><Quote quote={props.quote} turn={props.turn} /></Sequence> : null}
      <Sequence {...seq("close")}><Close url={props.url} cover={props.cover} kicker={props.kicker} /></Sequence>
      <Captions cues={props.captions} left={safe.x} right={safe.x + safe.rail} bottom={safe.bottom + 16} size={42} />
      <Grain />
    </AbsoluteFill>
    </Look.Provider>
  );
};
