import { ImageResponse } from "next/og";

export const alt = "Cyfix — fix web security with humans and agents together";
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
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0e12 0%, #101820 55%, #0d1a1c 100%)",
          color: "#e6ebf0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 40 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#14b8a6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "#0a0e12",
            }}
          >
            C
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -0.5 }}>Cyfix</div>
        </div>

        <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1.5 }}>
          Fix web security with
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: -1.5,
          }}
        >
          <span style={{ color: "#2dd4bf" }}>humans and agents</span>
          <span>together</span>
        </div>

        <div style={{ fontSize: 27, color: "#8b9bab", marginTop: 34, lineHeight: 1.45 }}>
          Passive-only security scanning an AI agent can run —
        </div>
        <div style={{ fontSize: 27, color: "#8b9bab", lineHeight: 1.45 }}>
          but only a human can authorize.
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 46 }}>
          {["6 WebMCP tools", "document.modelContext", "MIT licensed"].map((t) => (
            <div
              key={t}
              style={{
                border: "1px solid #2a3947",
                borderRadius: 999,
                padding: "10px 22px",
                fontSize: 21,
                color: "#a9b8c6",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
