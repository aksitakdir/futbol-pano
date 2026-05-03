import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#060f1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Köşe aksanı */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 8,
            height: 2,
            background: "#46f1c5",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 2,
            height: 8,
            background: "#46f1c5",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 8,
            height: 2,
            background: "#5b8dee",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 2,
            height: 8,
            background: "#5b8dee",
          }}
        />
        {/* SG metni */}
        <span
          style={{
            color: "#46f1c5",
            fontSize: 13,
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
