/**
 * Where the cover backdrop looks. Shared by the templates (src/Backdrop.tsx) and by
 * scripts/render.mjs, which checks the cover for faces first.
 *
 * The backdrop shows a window of the cover: the window's centre `center` (a fraction
 * of the cover's width) drifts from center[0] to center[1] over the video while the
 * zoom goes from zoom[0] to zoom[1]. A face in that window sits behind a named
 * player's card and reads as his portrait, so backdropSpec() keeps every face out of
 * it: by drifting over a clear stretch of the cover, else by zooming in on one, else
 * by blurring the cover past recognition.
 */

/** Our covers are Midjourney 16:9 (1456×816) unless the face check reports a size. */
export const COVER_ASPECT = 1456 / 816;
const BLUR = 9;
const HEAVY_BLUR = 28;
/** Around a face box: hair, ears and the blur. */
const MARGIN = 0.06;

/** Share of the cover's width in view at zoom 1 (object-fit: cover). */
const inView = (aspect, frameAspect) => Math.min(1, frameAspect / aspect);

/**
 * The drift without faces. A vertical frame sees a third of the cover and pans over
 * most of it; a 16:9 frame sees nearly all of it and only breathes.
 * @param {number} frameAspect width / height of the video
 * @param {number} [aspect] width / height of the cover
 */
export function backdropDefaults(frameAspect, aspect = COVER_ASPECT) {
  if (frameAspect >= 1) return { aspect, zoom: [1.06, 1.14], center: [0.48, 0.52], blur: BLUR };
  const v = inView(aspect, frameAspect);
  return { aspect, zoom: [1.14, 1.22], center: [0.18, 0.82].map((p) => v / 2 + p * (1 - v)), blur: BLUR };
}

/**
 * The drift for a cover with these faces (scripts/faces.swift output).
 * @param {{ width: number; height: number; faces: { x: number; w: number }[] }} found
 * @param {number} frameAspect
 */
export function backdropSpec(found, frameAspect) {
  const aspect = found.width && found.height ? found.width / found.height : COVER_ASPECT;
  const base = backdropDefaults(frameAspect, aspect);
  if (!found.faces.length) return base;
  const v = inView(aspect, frameAspect);
  const step = base.zoom[1] - base.zoom[0];
  // Room to drift: a tenth of the cover in a vertical frame, a twentieth in a wide one.
  const room = frameAspect < 1 ? 0.1 : 0.04;
  for (let z = base.zoom[0]; z <= 2.8; z = Math.round((z + 0.1) * 100) / 100) {
    // The widest window the drift shows is at its first zoom; the zoom only narrows it.
    const half = v / 2 / z;
    let clear = [[half, 1 - half]];
    for (const f of found.faces) {
      const [lo, hi] = [f.x - MARGIN - half, f.x + f.w + MARGIN + half];
      clear = clear.flatMap(([a, b]) => [[a, Math.min(b, lo)], [Math.max(a, hi), b]]).filter(([a, b]) => b > a);
    }
    const [best] = clear.sort((x, y) => (y[1] - y[0]) - (x[1] - x[0]));
    if (best && best[1] - best[0] >= room) {
      const drift = Math.min(best[1] - best[0], base.center[1] - base.center[0]);
      return { ...base, zoom: [z, z + step], center: [best[0], best[0] + drift] };
    }
  }
  return { ...base, blur: HEAVY_BLUR };
}

/** When the faces cannot be checked. */
export const blurredSpec = (frameAspect) => ({ ...backdropDefaults(frameAspect), blur: HEAVY_BLUR });
