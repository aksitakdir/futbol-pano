import { ImageResponse } from "next/og";

/**
 * Downloadable SG keycap logo for social profiles / sharing.
 *
 * /api/logo?size=1000&bg=dark        -> 1000x1000, dark brand background
 * /api/logo?size=1000&bg=transparent -> transparent background (PNG)
 * /api/logo?size=1000&bg=accent      -> teal gradient background
 *
 * next/og (satori) has no background-clip:text, so the "SG" legend is a
 * solid accent color (same approach as the favicon / social card).
 */

export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const size = Math.min(2000, Math.max(128, Number(url.searchParams.get("size") ?? 1000)));
  const bg = url.searchParams.get("bg") ?? "dark";

  const background =
    bg === "transparent"
      ? "transparent"
      : bg === "accent"
        ? "linear-gradient(135deg, #0c1623 0%, #103042 55%, #0c1623 100%)"
        : "#060f1e";

  // Keycap geometry scales with the canvas.
  const key = size * 0.62;
  const r = key * 0.2;
  const legend = key * 0.42;

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
          {/* key body */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: r,
              background: "linear-gradient(180deg, #1f2f42, #0c1623)",
              borderBottom: `${key * 0.07}px solid #060d16`,
              boxShadow: `0 ${key * 0.06}px ${key * 0.12}px rgba(0,0,0,0.55)`,
              display: "flex",
            }}
          />
          {/* top face */}
          <div
            style={{
              position: "absolute",
              left: "9%",
              right: "9%",
              top: "7%",
              bottom: "18%",
              borderRadius: r * 0.8,
              background: "linear-gradient(180deg, #2a3d52, #16243600)",
              borderTop: `${Math.max(1, key * 0.01)}px solid rgba(255,255,255,0.22)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "sans-serif",
                fontSize: legend,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#2fe6c4",
              }}
            >
              SG
            </span>
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
