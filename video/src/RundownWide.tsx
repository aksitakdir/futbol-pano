import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color, fonts, gradient, gradientText } from "./theme";
import { Brand, Grain, Hatch, Monogram, RatingBar, Rise, useIn } from "./parts";
import { Backdrop } from "./Backdrop";
import { rankCaption, section, shortLabel, whenParts } from "./labels";
import type { RundownItem, RundownProps } from "./Rundown";
import { timeline } from "./timeline.mjs";

/**
 * The Rundown at 16:9 (1920×1080), for X. Same data, same timeline, same voice-over
 * and music as the vertical reel; only the layout changes. The covers are 16:9
 * themselves, so the hook and the end card show them whole.
 */

/** X lays its player controls over the bottom of a video; keep data off the bottom and the edges. */
export const wide = { top: 64, bottom: 110, x: 120 };
const W = 1920;

const ACCENTS = [color.emerald, color.cyan, color.sky, color.amber, color.rose];

const Hook: React.FC<RundownProps> = ({ cover, kicker, subtitle, edition, items, countLabel, asOf }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.06, 1.0]);
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const [name, year] = kicker.match(/^(.*?)\s*(\d{4})?$/)!.slice(1);
  const size = name.length > 30 ? 104 : 128;
  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      {cover ? <Img src={cover} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: "brightness(0.5) saturate(0.95)" }} /> : null}
      {/* Dark along the left for the title, and along the top so the brand row reads on any cover */}
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${color.bg} 0%, color-mix(in oklch, ${color.bg} 70%, transparent) 42%, transparent 72%), linear-gradient(to top, ${color.bg} 0%, transparent 30%), linear-gradient(to bottom, color-mix(in oklch, ${color.bg} 85%, transparent) 0%, transparent 22%)` }} />
      <Brand tag={`EA FC ${edition}`} top={wide.top} x={wide.x} />
      <div style={{ position: "absolute", left: wide.x, width: 1060, top: wide.top + 80, bottom: wide.bottom, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Rise delay={4}><div style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: "0.24em", color: color.emerald, marginBottom: 22 }}>{items.length} {countLabel ?? "NOMINEES"}</div></Rise>
        <Rise delay={8}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: size, lineHeight: 0.96, letterSpacing: "-0.05em", color: color.text, textWrap: "balance" }}>{name}</div>
        </Rise>
        {year ? (
          <Rise delay={14}>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: size, lineHeight: 0.98, letterSpacing: "-0.05em", ...gradientText() }}>{year}</div>
          </Rise>
        ) : null}
        <Rise delay={22}><div style={{ fontFamily: fonts.body, fontSize: 38, lineHeight: 1.25, color: color.textSecondary, marginTop: 30, maxWidth: 900 }}>{subtitle}</div></Rise>
        {asOf ? <Rise delay={28}><div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: "0.2em", color: color.muted, marginTop: 22 }}>FIGURES AS OF {asOf.toUpperCase()}</div></Rise> : null}
      </div>
    </AbsoluteFill>
  );
};

const Progress: React.FC<{ total: number; index: number }> = ({ total, index }) => (
  <div style={{ position: "absolute", top: wide.top + 76, left: wide.x, right: wide.x, display: "flex", gap: 12 }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i <= index ? color.emerald : color.surface }} />
    ))}
  </div>
);

/** Left: the tile with the rank (or the jump) under it. Right: who, the rating, the details. */
const TILE = 330;
const RIGHT = W - wide.x * 2 - TILE - 110;
const GAP = 44;

const Item: React.FC<{ item: RundownItem; index: number; total: number; edition: string; fromEdition?: string | null }> = ({ item, index, total, edition, fromEdition }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const accent = ACCENTS[index % ACCENTS.length];
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = useIn(0, 16);
  const jump = item.jump !== undefined && item.from !== undefined;
  const numeral = jump ? `+${item.jump}` : item.rank;
  const columns = Math.max(1, item.details.length);
  const cell = (RIGHT - GAP * (columns - 1)) / columns;
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-exit * 40}px)` }}>
      <Progress total={total} index={index} />
      <div style={{ position: "absolute", left: wide.x, right: wide.x, top: wide.top + 110, bottom: wide.bottom, display: "flex", alignItems: "center", gap: 110 }}>
        <div style={{ width: TILE, flexShrink: 0 }}>
          <div style={{ opacity: enter, transform: `scale(${0.9 + enter * 0.1})`, transformOrigin: "left top" }}>
            <Monogram name={item.name} size={TILE} accent={accent} />
          </div>
          <div style={{ marginTop: 34, fontFamily: fonts.display, fontWeight: 700, fontSize: Math.min(220, TILE / (numeral.length * 0.6)), lineHeight: 0.8, letterSpacing: "-0.06em", whiteSpace: "nowrap", color: "transparent", WebkitTextStroke: `4px color-mix(in oklch, ${accent} 75%, transparent)`, opacity: enter, transform: `translateY(${(1 - enter) * 40}px)` }}>
            {numeral}
          </div>
        </div>
        <div style={{ width: RIGHT }}>
          <Rise delay={4}>
            <div style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: "0.22em", color: accent }}>
              {rankCaption(item.rank, edition, jump)} · {item.club.toUpperCase()}
            </div>
          </Rise>
          <Rise delay={7}>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: Math.min(124, RIGHT / (item.name.length * 0.56)), lineHeight: 0.95, whiteSpace: "nowrap", letterSpacing: "-0.045em", color: color.text, marginTop: 16 }}>{item.name}</div>
          </Rise>
          <div style={{ marginTop: 56 }}>
            {jump
              ? <RatingBar value={item.rating} from={item.from} floor={50} delay={10} accent={accent} label={`EA FC ${fromEdition} → ${edition}`} />
              : <RatingBar value={item.rating} delay={10} accent={accent} label={`EA FC ${edition} RATING`} />}
          </div>
          <div style={{ marginTop: 52, display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: GAP }}>
            {item.details.map((d, i) => (
              <Rise key={d.label} delay={22 + i * 6} distance={24}>
                <div style={{ borderTop: `1px solid ${color.border}`, paddingTop: 18 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.2em", color: color.muted }}>{shortLabel(d.label)}</div>
                  {/* One line per value, sized to its column, so every card keeps the same height */}
                  <div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: Math.min(40, cell / (d.value.length * 0.53)), lineHeight: 1.2, whiteSpace: "nowrap", color: color.textSecondary, marginTop: 8 }}>{d.value}</div>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Quote: React.FC<{ quote: string; turn?: string }> = ({ quote, turn }) => (
  <AbsoluteFill>
    <Hatch opacity={0.04} />
    <div style={{ position: "absolute", left: wide.x, right: wide.x, top: wide.top + 60, bottom: wide.bottom, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Rise><div style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: "0.24em", color: color.amber }}>{turn ?? "BUT THE JURY JUDGES THE SEASON"}</div></Rise>
      <Rise delay={8}>
        <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: quote.length > 110 ? 76 : 88, lineHeight: 1.08, letterSpacing: "-0.035em", color: color.text, marginTop: 40, maxWidth: 1560, textWrap: "balance" }}>
          <span style={gradientText()}>“</span>{quote}<span style={gradientText()}>”</span>
        </div>
      </Rise>
    </div>
  </AbsoluteFill>
);

const Ballot: React.FC<{ ballot: RundownProps["ballot"] }> = ({ ballot }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: wide.x, right: wide.x, top: wide.top + 60, bottom: wide.bottom, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Rise><div style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: "0.24em", color: color.emerald }}>OUR BALLOT</div></Rise>
      <Rise delay={4}><div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 80, lineHeight: 1, letterSpacing: "-0.04em", color: color.text, marginTop: 16 }}>How we would vote</div></Rise>
      <div style={{ marginTop: 70, display: "grid", gridTemplateColumns: `repeat(${ballot.length}, 1fr)`, gap: 60 }}>
        {ballot.map((b, i) => (
          <Rise key={b.name} delay={14 + i * 12} distance={50}>
            <div style={{ borderTop: `1px solid ${color.border}`, paddingTop: 26 }}>
              <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 150, lineHeight: 0.85, letterSpacing: "-0.05em", ...(i === 0 ? gradientText() : { color: color.muted }) }}>{b.points}</div>
              <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 54, letterSpacing: "-0.03em", color: color.text, marginTop: 26 }}>{b.name}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 32, lineHeight: 1.3, color: color.muted, marginTop: 10 }}>{b.note}</div>
            </div>
          </Rise>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

/** The end card: the whole cover, sharp, and over it the brand and the address in large type. */
const Close: React.FC<{ when?: string; url: string; cover?: string | null; kicker?: string }> = ({ when, url, cover, kicker }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { date, venue } = whenParts(when);
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.08]);
  const show = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const d = date ? 14 : 0;
  const tile = useIn(d + 4, 14);
  const underline = interpolate(frame, [d + 22, d + 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const dim = (pct: number) => `color-mix(in oklch, ${color.bg} ${pct}%, transparent)`;
  const glow = `color-mix(in oklch, ${color.emerald} 40%, transparent)`;
  return (
    <AbsoluteFill>
      {cover ? (
        <AbsoluteFill style={{ opacity: show, overflow: "hidden" }}>
          <Img src={cover} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: "brightness(0.6) saturate(1.1)" }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 62% 70% at 50% 50%, ${dim(66)} 0%, ${dim(36)} 70%, ${dim(14)} 100%)` }} />
      <div style={{ position: "absolute", left: wide.x, right: wide.x, top: wide.top, bottom: wide.bottom, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        {date ? (
          <div style={{ marginBottom: 46 }}>
            <Rise><div style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.24em", color: color.textSecondary }}>WINNER ANNOUNCED</div></Rise>
            <Rise delay={5}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 28, marginTop: 10 }}>
                <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 92, lineHeight: 1, letterSpacing: "-0.05em", ...gradientText() }}>{date}</span>
                {venue ? <span style={{ fontFamily: fonts.body, fontSize: 34, color: color.textSecondary }}>{venue}</span> : null}
              </div>
            </Rise>
          </div>
        ) : null}
        {/* The brand: the SG tile beside the wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: tile, transform: `scale(${0.8 + tile * 0.2})` }}>
          <div style={{ width: 120, height: 120, borderRadius: 30, padding: 3, background: gradient, boxShadow: `0 0 80px ${glow}` }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 27, background: color.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 700, fontSize: 50, letterSpacing: "-0.03em" }}>
              <span style={gradientText()}>SG</span>
            </div>
          </div>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 64, letterSpacing: "-0.03em", color: color.text }}>Scout Gamer</div>
        </div>
        <Rise delay={d + 12}><div style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: "0.3em", color: color.emerald, marginTop: date ? 40 : 60 }}>THE FULL READ</div></Rise>
        <Rise delay={d + 16}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 150, lineHeight: 1, letterSpacing: "-0.045em", marginTop: 12, whiteSpace: "nowrap", ...gradientText() }}>scoutgamer.com</div>
        </Rise>
        <div style={{ width: `${underline * 100}%`, maxWidth: 1080, height: 6, borderRadius: 999, background: gradient, boxShadow: `0 0 30px ${glow}`, marginTop: 20 }} />
        <Rise delay={d + 24}>
          <div style={{ marginTop: 36, display: "inline-flex", alignItems: "center", gap: 20, padding: "16px 32px", borderRadius: 999, maxWidth: 1500, background: dim(70), border: `1px solid ${color.border}` }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.2em", color: color.emerald }}>{section(url)}</span>
            {kicker ? <span style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 32, color: color.text }}>{kicker}</span> : null}
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

export const RundownWide: React.FC<RundownProps> = (props) => {
  const scenes = timeline(props);
  const at = (scene: string) => scenes.find((t) => t.scene === scene)!;
  const seq = (scene: string) => ({ from: at(scene).from, durationInFrames: at(scene).frames });
  const brand = (tag?: string) => <Brand tag={tag} top={wide.top} x={wide.x} />;
  return (
    <AbsoluteFill style={{ background: color.bg, color: color.text }}>
      <Backdrop src={props.cover} spec={props.backdrop} />
      <Sequence {...seq("hook")}><Hook {...props} /></Sequence>
      {props.items.map((item, i) => (
        <Sequence key={item.name} {...seq(`item-${String(i).padStart(2, "0")}`)}>
          {brand(`EA FC ${props.edition}`)}
          <Item item={item} index={i} total={props.items.length} edition={props.edition} fromEdition={props.fromEdition} />
        </Sequence>
      ))}
      {props.quote ? <Sequence {...seq("quote")}>{brand()}<Quote quote={props.quote} turn={props.turn} /></Sequence> : null}
      {props.ballot.length ? <Sequence {...seq("ballot")}>{brand()}<Ballot ballot={props.ballot} /></Sequence> : null}
      <Sequence {...seq("close")}><Close {...props} /></Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
