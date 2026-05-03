import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#060f1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Köşe aksanları */}
        <div style={{ position: "absolute", top: 12, left: 12, width: 36, height: 4, background: "#46f1c5" }} />
        <div style={{ position: "absolute", top: 12, left: 12, width: 4, height: 36, background: "#46f1c5" }} />
        <div style={{ position: "absolute", bottom: 12, right: 12, width: 36, height: 4, background: "#5b8dee" }} />
        <div style={{ position: "absolute", bottom: 12, right: 12, width: 4, height: 36, background: "#5b8dee" }} />

        {/* SG metni */}
        <span
          style={{
            color: "#46f1c5",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          SG
        </span>
      </div>
    ),
    { ...size },
  );
}
