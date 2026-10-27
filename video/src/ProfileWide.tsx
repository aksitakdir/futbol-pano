import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Look, color, fonts, gradientText, themeVars, useLook } from "./theme";
import { Brand, Grain, Rise, useIn, IN_PLACE } from "./parts";
import { Backdrop, backdropLayers } from "./Backdrop";
import { Captions } from "./Captions";
import { keepTogether, section } from "./labels";
import type { ProfileProps } from "./Profile";
import { Close, Quote, wide } from "./RundownWide";
import { timeline } from "./timeline.mjs";

/**
 * The Profile at 16:9 (1920×1080), for X. Same data, timeline, voice-over and music
 * as the vertical one; the opening shows the 16:9 cover whole, each stat puts its
 * number beside its words, and the comparison reads as a table.
 */

const CAPTION_BAND = 100;
const ACCENTS = [color.emerald, color.cyan, color.sky, color.amber];

const Hook: React.FC<ProfileProps> = ({ cover, kicker, subtitle, url, asOf }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.06, 1.0]);
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const look = useLook();
  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      {cover ? <Img src={cover} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: look.coverWide }} /> : null}
      <AbsoluteFill style={{ background: look.scrimWide }} />
      <Brand tag={section(url)} top={wide.top} x={wide.x} />
      <div style={{ position: "absolute", left: wide.x, width: 1060, top: wide.top + 80, bottom: wide.bottom + look.band, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Rise delay={IN_PLACE}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: kicker.length > 26 ? 104 : 128, lineHeight: 0.96, letterSpacing: "-0.05em", color: color.text, textWrap: "balance" }}>{keepTogether(kicker)}</div>
        </Rise>
        {/* The subtitle is the claim: in place from frame 0 with the title, since X shows that frame as the cover */}
        <Rise delay={IN_PLACE}><div style={{ fontFamily: fonts.body, fontSize: 38, lineHeight: 1.25, color: color.textSecondary, marginTop: 30, maxWidth: 900, textWrap: "balance" }}>{subtitle}</div></Rise>
        {asOf ? <Rise delay={16}><div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: "0.2em", color: color.muted, marginTop: 22 }}>FIGURES AS OF {asOf.toUpperCase()}</div></Rise> : null}
      </div>
    </AbsoluteFill>
  );
};

/** One stat box: the number large on the left, its label and note beside it. */
const Stat: React.FC<{ stat: ProfileProps["stats"][number]; index: number; total: number }> = ({ stat, index, total }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { band } = useLook();
  const accent = ACCENTS[index % ACCENTS.length];
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pop = useIn(2, 12);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-exit * 40}px)` }}>
      <div style={{ position: "absolute", top: wide.top + 76, left: wide.x, right: wide.x, display: "flex", gap: 12 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i <= index ? accent : color.surface }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: wide.x, right: wide.x, top: wide.top + 110, bottom: wide.bottom + band, display: "flex", alignItems: "center", gap: 80 }}>
        <div style={{ flexShrink: 0, minWidth: 260, opacity: pop, transform: `scale(${0.82 + pop * 0.18})`, transformOrigin: "left center" }}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: stat.value.length > 3 ? 260 : 340, lineHeight: 0.85, letterSpacing: "-0.06em", whiteSpace: "nowrap", ...gradientText(`linear-gradient(120deg, ${accent} 0%, ${color.text} 140%)`) }}>
            {stat.value}
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: 1000 }}>
          <Rise delay={8}><div style={{ fontFamily: fonts.mono, fontSize: 32, letterSpacing: "0.24em", color: accent }}>{stat.label.toUpperCase()}</div></Rise>
          <Rise delay={14}><div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 48, lineHeight: 1.25, color: color.textSecondary, marginTop: 24, textWrap: "balance" }}>{stat.note}</div></Rise>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** The two-sided comparison as a table: a label column, then each side. */
const Contrast: React.FC<{ contrast: NonNullable<ProfileProps["contrast"]> }> = ({ contrast }) => {
  const { band } = useLook();
  const split = (cell: string) => {
    const i = cell.indexOf(": ");
    return i > 0 ? [cell.slice(0, i), cell.slice(i + 2)] : ["", cell];
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: wide.x, right: wide.x, top: wide.top + 60, bottom: wide.bottom + band, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Rise>
          <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 1fr", gap: 40, alignItems: "baseline", fontFamily: fonts.display, fontWeight: 700, fontSize: 72, letterSpacing: "-0.04em" }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 24, fontWeight: 400, letterSpacing: "0.2em", color: color.muted }}>VS</span>
            <span style={{ color: color.emerald }}>{contrast.left}</span>
            <span style={{ color: color.sky }}>{contrast.right}</span>
          </div>
          {contrast.sub ? (
            <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 1fr", gap: 40, marginTop: 12, fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.2em", color: color.muted }}>
              <span />
              <span>{contrast.sub[0]?.toUpperCase()}</span>
              <span>{contrast.sub[1]?.toUpperCase()}</span>
            </div>
          ) : null}
        </Rise>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 22 }}>
          {contrast.rows.map((row, i) => {
            const [label, left] = split(row[0]);
            const [, right] = split(row[1]);
            return (
              <Rise key={i} delay={10 + i * 8} distance={24}>
                <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 1fr", gap: 40, alignItems: "baseline", borderTop: `1px solid ${color.border}`, paddingTop: 16 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.18em", color: color.muted }}>{label.toUpperCase()}</div>
                  <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 36, lineHeight: 1.2, color: color.text }}>{left}</div>
                  <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 36, lineHeight: 1.2, color: color.textSecondary }}>{right}</div>
                </div>
              </Rise>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProfileWide: React.FC<ProfileProps> = (props) => {
  const scenes = timeline(props);
  const at = (scene: string) => scenes.find((t) => t.scene === scene)!;
  const seq = (scene: string) => ({ from: at(scene).from, durationInFrames: at(scene).frames });
  const brand = (tag?: string) => <Brand tag={tag} top={wide.top} x={wide.x} />;
  const tag = section(props.url);
  return (
    <Look.Provider value={{ theme: props.theme ?? "dark", band: props.captions?.length ? CAPTION_BAND : 0 }}>
    <AbsoluteFill style={{ ...themeVars(props.theme ?? "dark"), background: color.bg, color: color.text }}>
      <Backdrop src={props.cover} spec={props.backdrop} layers={backdropLayers(props.cover, props.backdrop, props.backdrops, scenes)} />
      <Sequence {...seq("hook")}><Hook {...props} /></Sequence>
      {props.stats.map((stat, i) => (
        <Sequence key={stat.label} {...seq(`stat-${String(i).padStart(2, "0")}`)}>
          {brand(tag)}
          <Stat stat={stat} index={i} total={props.stats.length} />
        </Sequence>
      ))}
      {props.contrast ? <Sequence {...seq("contrast")}>{brand(tag)}<Contrast contrast={props.contrast} /></Sequence> : null}
      {props.quote ? <Sequence {...seq("quote")}>{brand()}<Quote quote={props.quote} turn={props.turn} /></Sequence> : null}
      <Sequence {...seq("close")}><Close url={props.url} cover={props.cover} kicker={props.kicker} /></Sequence>
      <Captions cues={props.captions} left={wide.x} right={wide.x} bottom={wide.bottom + 6} size={40} />
      <Grain />
    </AbsoluteFill>
    </Look.Provider>
  );
};
