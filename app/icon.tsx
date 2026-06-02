import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Keycap-style favicon: dark key body with a hard bottom edge + cyan "SG".
// (next/og / satori does not support background-clip:text gradients, so the
// legend is a solid accent color rather than the gradient used on the site.)
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#060f1e",
        }}
      >
        {/* key body */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "linear-gradient(180deg, #1f2f42, #0c1623)",
            borderBottom: "3px solid #060d16",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#2fe6c4",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              fontFamily: "sans-serif",
              lineHeight: 1,
              marginTop: -2,
            }}
          >
            SG
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
