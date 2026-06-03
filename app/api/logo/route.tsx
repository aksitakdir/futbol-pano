import { ImageResponse } from "next/og";

/**
 * Downloadable SG keycap logo for social profiles / sharing.
 *
 * Renders the exact same keycap as the on-site <SgKeycap> component
 * (app/components/sg-keycap.tsx) — same body gradient, raised bottom edge,
 * glossy top face, and gradient "SG" legend — just centered on a square
 * canvas at any size.
 *
 * /api/logo?size=1000&bg=dark        -> 1000x1000, dark brand background
 * /api/logo?size=1000&bg=transparent -> transparent background (PNG)
 * /api/logo?size=1000&bg=accent      -> teal gradient background
 */

export const runtime = "edge";

const ACCENT = "linear-gradient(135deg, #00d4aa, #22d3ee, #FFB81C)";

// Load Space Grotesk (the site's display font) so the "SG" legend matches the
// on-site logo exactly, not a generic sans-serif. The font ships in
// /public/fonts and is fetched from the deploy's own origin.
let fontPromise: Promise<ArrayBuffer> | null = null;
function loadSpaceGrotesk(origin: string): Promise<ArrayBuffer> {
  if (!fontPromise) {
    fontPromise = fetch(`${origin}/fonts/space-grotesk.ttf`).then((r) => {
      if (!r.ok) throw new Error("font fetch failed");
      return r.arrayBuffer();
    });
  }
  return fontPromise;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const size = Math.min(2000, Math.max(128, Number(url.searchParams.get("size") ?? 1000)));
  const bg = url.searchParams.get("bg") ?? "dark";

  let fontData: ArrayBuffer | null = null;
  try {
    fontData = await loadSpaceGrotesk(url.origin);
  } catch {
    fontData = null; // fall back to sans-serif if the font can't be fetched
  }

  const background =
    bg === "transparent"
      ? "transparent"
      : bg === "accent"
        ? "linear-gradient(135deg, #0c1623 0%, #103042 55%, #0c1623 100%)"
        : "#060f1e";

  // Keycap occupies ~62% of the canvas; geometry mirrors <SgKeycap> exactly.
  const key = size * 0.62;
  const r = key * 0.2;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
        }}
      >
        <div style={{ position: "relative", width: key, height: key, display: "flex" }}>
          {/* Key body — dark, with a raised bottom edge. Shadow values scale
              with the key so the "button" depth holds at any size (the on-site
              component uses fixed 1px values tuned for 34px). */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: r,
              background: "linear-gradient(180deg, #1a2738, #0a131f)",
              boxShadow: `0 ${key * 0.06}px 0 0 #05101a, 0 ${key * 0.12}px ${key * 0.16}px rgba(0,0,0,0.6)`,
              display: "flex",
            }}
          />
          {/* Top face — clearly inset, glossy top edge (the second layer that
              gives the keycap its depth). Highlight thickness scales too. */}
          <div
            style={{
              position: "absolute",
              left: "11%",
              right: "11%",
              top: "9%",
              bottom: "20%",
              borderRadius: r * 0.78,
              background: "linear-gradient(180deg, #2b3e54 0%, #1b2c40 60%, #16243600 100%)",
              boxShadow: `inset 0 ${key * 0.02}px ${key * 0.02}px rgba(255,255,255,0.28), inset 0 ${-key * 0.03}px ${key * 0.05}px rgba(0,0,0,0.35)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: fontData ? "Space Grotesk" : "sans-serif",
                fontSize: key * 0.4,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                background: ACCENT,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              SG
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      ...(fontData
        ? { fonts: [{ name: "Space Grotesk", data: fontData, weight: 700 as const, style: "normal" as const }] }
        : {}),
    },
  );
}
