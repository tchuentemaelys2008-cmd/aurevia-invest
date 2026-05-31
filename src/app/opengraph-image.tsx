import { ImageResponse } from "next/og";

// Lightweight, share-friendly card (≈ a few dozen KB) so WhatsApp, Facebook,
// Telegram, X/Twitter and LinkedIn all render a rich preview reliably.
export const runtime = "edge";
export const alt = "Aurevia Invest — Investissez en Afrique, gagnez chaque jour";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #04070f 0%, #0c1428 55%, #111d38 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: -160, left: 360, width: 520, height: 520, borderRadius: 520, background: "rgba(91,110,245,0.35)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -180, right: 280, width: 460, height: 460, borderRadius: 460, background: "rgba(108,92,231,0.30)", filter: "blur(60px)" }} />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 150,
            height: 150,
            borderRadius: 38,
            background: "linear-gradient(135deg,#5b6ef5,#6c5ce7)",
            fontSize: 96,
            fontWeight: 800,
            boxShadow: "0 20px 60px rgba(91,110,245,0.5)",
          }}
        >
          A
        </div>

        <div style={{ display: "flex", marginTop: 36, fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>
          Aurevia Invest
        </div>

        <div style={{ display: "flex", marginTop: 18, fontSize: 36, color: "rgba(255,255,255,0.72)" }}>
          Investissez en Afrique, gagnez chaque jour
        </div>

        <div style={{ display: "flex", gap: 18, marginTop: 46 }}>
          {["Revenus quotidiens", "Mobile Money", "Parrainage 5%"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                fontSize: 28,
                color: "#cfe0ff",
                padding: "12px 26px",
                borderRadius: 999,
                background: "rgba(91,110,245,0.16)",
                border: "1px solid rgba(120,160,255,0.35)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
