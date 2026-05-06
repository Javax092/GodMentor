import { ImageResponse } from "next/og";

export const runtime = "edge";

function toNumber(raw: string) {
  return raw === "512" ? 512 : 192;
}

function EvoluaIcon({ size }: { size: number }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(160deg, #07101b 0%, #0f1d33 50%, #09192b 100%)",
        borderRadius: size * 0.22,
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%"
      }}
    >
      <div
        style={{
          border: `${Math.max(10, Math.round(size * 0.035))}px solid rgba(255,255,255,0.1)`,
          borderRadius: size * 0.18,
          display: "flex",
          height: "84%",
          inset: "8%",
          position: "absolute",
          width: "84%"
        }}
      />
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(180deg, rgba(96,165,250,0.16), rgba(96,165,250,0.03))",
          border: `${Math.max(6, Math.round(size * 0.02))}px solid rgba(96,165,250,0.35)`,
          borderRadius: size * 0.16,
          display: "flex",
          height: "68%",
          justifyContent: "center",
          width: "68%"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: Math.round(size * 0.045)
          }}
        >
          {[
            { width: "100%", opacity: 1 },
            { width: "78%", opacity: 0.9 },
            { width: "56%", opacity: 0.8 }
          ].map((bar) => (
            <div
              key={bar.width}
              style={{
                background: "#7cc4ff",
                borderRadius: 999,
                height: Math.max(14, Math.round(size * 0.07)),
                opacity: bar.opacity,
                width: bar.width
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function GET(_: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: rawSize } = await params;
  const size = toNumber(rawSize);

  return new ImageResponse(<EvoluaIcon size={size} />, {
    width: size,
    height: size
  });
}
