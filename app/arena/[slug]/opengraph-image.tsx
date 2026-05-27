import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Scout Gamer Arena";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CARD_COLORS: Record<string, string> = {
  primary:   "#46f1c5",
  secondary: "#38bdf8",
  tertiary:  "#a78bfa",
  amber:     "#f9bd22",
  rose:      "#fb7185",
};

// All data comes via searchParams — no Supabase call needed.
// generateMetadata in page.tsx embeds the data into the image URL.
export default async function OgImage({
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    t?: string; c?: string; d?: string; n?: string; cnt?: string;
    champion?: string; lang?: string;
  }>;
}) {
  const sp = await searchParams;
  const gameTitle  = decodeURIComponent(sp.t ?? "Arena");
  const accent     = CARD_COLORS[sp.c ?? "amber"] ?? "#f9bd22";
  const championName = sp.champion ? decodeURIComponent(sp.champion) : null;

  // ── Champion result card ────────────────────────────────────────────────────
  if (championName) {
    const label   = "MY CHAMPION";
    const cta     = "Who's yours? Play →  scoutgamer.com/arena";
    const subline = `in "${gameTitle}"`;

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200, height: 630, background: "#060f1e",
            display: "flex", flexDirection: "column",
            position: "relative", overflow: "hidden", fontFamily: "sans-serif",
          }}
        >
          {/* Big glow */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700, height: 700, borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}30 0%, transparent 68%)`,
            filter: "blur(80px)",
          }} />
          {/* Top bar */}
          <div style={{ height: 6, background: accent, width: "100%", flexShrink: 0 }} />

          <div style={{
            display: "flex", flexDirection: "column", flex: 1,
            padding: "52px 80px 52px", justifyContent: "space-between", alignItems: "flex-start",
          }}>
            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                background: accent, color: "#060f1e",
                fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", padding: "4px 12px",
              }}>
                ARENA
              </div>
              <div style={{ color: "#46f1c5", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.6 }}>
                SCOUT GAMER
              </div>
            </div>

            {/* Main result */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                fontSize: 13, fontWeight: 800, letterSpacing: "0.28em",
                color: accent, textTransform: "uppercase",
              }}>
                🏆 {label}
              </div>
              <div style={{
                fontSize: championName.length > 16 ? 88 : 108,
                fontWeight: 900, color: "#f1f5f9",
                lineHeight: 1.0, letterSpacing: "-0.04em",
                // Gradient text simulation using a colored shadow
                textShadow: `0 0 60px ${accent}66`,
              }}>
                {championName}
              </div>
              <div style={{ fontSize: 22, color: "#64748b", fontWeight: 500 }}>
                {subline}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              fontSize: 18, color: accent, fontWeight: 700, letterSpacing: "0.06em",
            }}>
              {cta}
            </div>
          </div>
        </div>
      ),
      { ...size },
    );
  }

  // ── Default game listing card ───────────────────────────────────────────────
  const description = decodeURIComponent(sp.d ?? "Pick your champion and share.");
  const names = sp.n ? decodeURIComponent(sp.n).split("|").filter(Boolean) : [];
  const total = Number(sp.cnt ?? 0);
  const extra = total > names.length ? total - names.length : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630, background: "#060f1e",
          display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden", fontFamily: "sans-serif",
        }}
      >
        <div style={{
          position: "absolute", top: -140, left: -100, width: 640, height: 640,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}28 0%, transparent 68%)`,
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", bottom: -80, right: -80, width: 420, height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}18 0%, transparent 68%)`,
          filter: "blur(50px)",
        }} />

        <div style={{ height: 5, background: accent, width: "100%", flexShrink: 0 }} />

        <div style={{
          display: "flex", flexDirection: "column", flex: 1,
          padding: "52px 72px 48px", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              background: accent, color: "#060f1e",
              fontSize: 12, fontWeight: 800, letterSpacing: "0.22em", padding: "5px 14px",
            }}>
              ARENA
            </div>
            <div style={{ color: "#46f1c5", fontSize: 15, fontWeight: 700, letterSpacing: "0.12em", opacity: 0.65 }}>
              SCOUT GAMER
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{
              fontSize: gameTitle.length > 30 ? 60 : 72, fontWeight: 900,
              color: "#f1f5f9", lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: 920,
            }}>
              {gameTitle}
            </div>
            <div style={{ fontSize: 22, color: "#94a3b8", lineHeight: 1.45, maxWidth: 800 }}>
              {description.length > 115 ? description.slice(0, 115) + "…" : description}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {names.slice(0, 4).map((name) => (
                <div key={name} style={{
                  background: "rgba(255,255,255,0.06)", border: `1px solid ${accent}44`,
                  color: "#cbd5e1", fontSize: 13, fontWeight: 600,
                  padding: "5px 13px", letterSpacing: "0.04em", whiteSpace: "nowrap",
                }}>
                  {name}
                </div>
              ))}
              {extra > 0 && (
                <div style={{
                  background: "rgba(255,255,255,0.04)", color: "#64748b",
                  fontSize: 13, fontWeight: 600, padding: "5px 13px",
                }}>
                  +{extra} more
                </div>
              )}
            </div>
            <div style={{ color: accent, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>
              scoutgamer.com/arena
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
