import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(160deg, #07101b 0%, #0f1d33 50%, #09192b 100%)",
          borderRadius: 40,
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%"
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "linear-gradient(180deg, rgba(96,165,250,0.18), rgba(96,165,250,0.03))",
            border: "4px solid rgba(96,165,250,0.35)",
            borderRadius: 32,
            display: "flex",
            height: 120,
            justifyContent: "center",
            width: 120
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#7cc4ff", borderRadius: 999, height: 12, width: 64 }} />
            <div style={{ background: "#7cc4ff", borderRadius: 999, height: 12, opacity: 0.9, width: 50 }} />
            <div style={{ background: "#7cc4ff", borderRadius: 999, height: 12, opacity: 0.8, width: 36 }} />
          </div>
        </div>
      </div>
    ),
    size
  );
}
