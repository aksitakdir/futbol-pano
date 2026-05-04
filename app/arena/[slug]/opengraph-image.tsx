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

// All data comes via searchParams — no Supabase call needed here.
// generateMetadata in page.tsx embeds the data into the image URL.
export default async function OgImage({
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string; c?: string; d?: string; n?: string; cnt?: string }>;
}) {
  const sp = await searchParams;
  const title = decodeURIComponent(sp.t ?? "Arena");
  const description = decodeURIComponent(sp.d ?? "Şampiyonunu seç ve paylaş.");
  const accent = CARD_COLORS[sp.c ?? "amber"] ?? "#f9bd22";
  const names = sp.n ? decodeURIComponent(sp.n).split("|").filter(Boolean) : [];
  const total = Number(sp.cnt ?? 0);
  const extra = total > names.length ? total - names.length : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#060f1e",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -100,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}28 0%, transparent 68%)`,
            filter: "blur(60px)",
          }}
        />
        {/* Glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}18 0%, transparent 68%)`,
            filter: "blur(50px)",
          }}
        />

        {/* Top accent bar */}
        <div style={{ height: 5, background: accent, width: "100%", flexShrink: 0 }} />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "52px 72px 48px",
            justifyContent: "space-between",
          }}
        >
          {/* Brand row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                background: accent,
                color: "#060f1e",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.22em",
                padding: "5px 14px",
              }}
            >
              ARENA
            </div>
            <div
              style={{
                color: "#46f1c5",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.12em",
                opacity: 0.65,
              }}
            >
              SCOUT GAMER
            </div>
          </div>

          {/* Title + description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontSize: title.length > 30 ? 60 : 72,
                fontWeight: 900,
                color: "#f1f5f9",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                maxWidth: 920,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#94a3b8",
                lineHeight: 1.45,
                maxWidth: 800,
              }}
            >
              {description.length > 115 ? description.slice(0, 115) + "…" : description}
            </div>
          </div>

          {/* Footer row: names + domain */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
              {names.slice(0, 4).map((name) => (
                <div
                  key={name}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${accent}44`,
                    color: "#cbd5e1",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "5px 13px",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </div>
              ))}
              {extra > 0 && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "#64748b",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "5px 13px",
                  }}
                >
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
