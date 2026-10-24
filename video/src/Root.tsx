import React from "react";
import { Composition } from "remotion";
import { Rundown, rundownDuration, type RundownProps } from "./Rundown";
import { Profile, profileDuration, type ProfileProps } from "./Profile";
import { RundownWide } from "./RundownWide";
import { ProfileWide } from "./ProfileWide";
import rundownPilot from "../data/kopa-trophy-2026-the-ten-nominees-read-against-their-cards.json";

/**
 * One composition per template. Props come from data/<slug>.json, written by
 * scripts/from-article.mjs (its "template" field says which); the studio previews a
 * pilot of each, and scripts/render.mjs passes any article's data at render time.
 */
/** Studio-only placeholder until a Profile video is made; never rendered for posting. */
const profileSample: ProfileProps = {
  slug: "sample",
  url: "scoutgamer.com/radar/sample",
  cover: null,
  kicker: "Profile template",
  subtitle: "Stat boxes, a comparison and a pull quote, from a radar or tactics piece",
  stats: [{ value: "9", label: "Minutes", note: "A stat box from the article, its note underneath" }],
  contrast: null,
  quote: null,
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Rundown"
      component={Rundown}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={rundownDuration(rundownPilot as RundownProps)}
      defaultProps={rundownPilot as RundownProps}
      calculateMetadata={({ props }) => ({ durationInFrames: rundownDuration(props) })}
    />
    {/* The same Rundown at 16:9, for X: scripts/render.mjs <slug> --format x */}
    <Composition
      id="RundownWide"
      component={RundownWide}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={rundownDuration(rundownPilot as RundownProps)}
      defaultProps={rundownPilot as RundownProps}
      calculateMetadata={({ props }) => ({ durationInFrames: rundownDuration(props) })}
    />
    <Composition
      id="Profile"
      component={Profile}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={profileDuration(profileSample)}
      defaultProps={profileSample}
      calculateMetadata={({ props }) => ({ durationInFrames: profileDuration(props) })}
    />
    {/* The Profile at 16:9, for X: scripts/render.mjs <slug> --format x */}
    <Composition
      id="ProfileWide"
      component={ProfileWide}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={profileDuration(profileSample)}
      defaultProps={profileSample}
      calculateMetadata={({ props }) => ({ durationInFrames: profileDuration(props) })}
    />
  </>
);
