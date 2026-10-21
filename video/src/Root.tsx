import React from "react";
import { Composition } from "remotion";
import { Rundown, rundownDuration, type RundownProps } from "./Rundown";
import pilot from "../data/kopa-trophy-2026-the-ten-nominees-read-against-their-cards.json";

/**
 * One composition per template. Props come from data/<slug>.json, written by
 * scripts/from-article.mjs; the studio previews the Kopa pilot by default, and
 * scripts/render.mjs passes any article's data at render time.
 */
export const Root: React.FC = () => (
  <Composition
    id="Rundown"
    component={Rundown}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={rundownDuration(pilot as RundownProps)}
    defaultProps={pilot as RundownProps}
    calculateMetadata={({ props }) => ({ durationInFrames: rundownDuration(props) })}
  />
);
