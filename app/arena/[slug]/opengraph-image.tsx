import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase";
import type { ArenaGame } from "@/lib/arena-brackets";

export const runtime = "edge";
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

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = createClient();
  const { data } = await supabase
    .from("arena_games")
    .select("title_tr,title_en,description_tr,card_color,game_type,participants")
    .eq("slug", slug)
    .maybeSingle();

  const game = data as Pick<ArenaGame, "title_tr" | "title_en" | "description_tr" | "card_color" | "game_type" | "participants"> | null;

  const title = game?.title_tr ?? "Arena";
  const description = game?.description_tr ?? "Şampiyonunu seç ve paylaş.";
  const accent = CARD_COLORS[game?.card_color ?? "amber"] ?? "#f9bd22";
  const participantCount = game?.participants?.length ?? 0;

  // Katılımcı isimlerinden ilk 4 tanesini göster
  const topNames = (game?.participants ?? [])
    .slice(0, 4)
    .map((p) => p.name)
    .filter(Boolean);

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
        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -60,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
            filter: "blur(50px)",
          }}
        />

        {/* Top accent bar */}
        <div style={{ height: 4, background: accent, width: "100%" }} />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "56px 72px",
            justifyContent: "space-between",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: accent,
                color: "#060f1e",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.2em",
                padding: "4px 12px",
              }}
            >
              ARENA
            </div>
            <div
              style={{
                color: "#46f1c5",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.1em",
                opacity: 0.7,
              }}
            >
              SCOUT GAMER
            </div>
          </div>

          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "#f1f5f9",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                maxWidth: 900,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#94a3b8",
                lineHeight: 1.4,
                maxWidth: 760,
              }}
            >
              {description.length > 110 ? description.slice(0, 110) + "…" : description}
            </div>
          </div>

          {/* Footer: participant names + count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 10 }}>
              {topNames.map((name) => (
                <div
                  key={name}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${accent}40`,
                    color: "#cbd5e1",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "6px 14px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {name}
                </div>
              ))}
              {participantCount > 4 && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "#64748b",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "6px 14px",
                  }}
                >
                  +{participantCount - 4} more
                </div>
              )}
            </div>
            <div style={{ color: accent, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em" }}>
              scoutgamer.com/arena
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
