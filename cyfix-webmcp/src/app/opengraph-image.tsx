import { ImageResponse } from "next/og";

export const alt = "Cyfix — fix web security with humans and agents together";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARK = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjYiIHkxPSIzIiB4Mj0iMzQiIHkyPSIzNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM1ZWVhZDQiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIwLjU1IiBzdG9wLWNvbG9yPSIjMmRkNGJmIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBkOTQ4OCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHBhdGggZD0iTTIwIDNsMTQgNS4ydjEwLjFjMCA5LjMtNS45IDE3LTE0IDIwLjItOC4xLTMuMi0xNC0xMC45LTE0LTIwLjJWOC4yTDIwIDN6IiBmaWxsPSIjMGIxMTE3Ii8+CiAgPHBhdGggZD0iTTIwIDNMNiA4LjJ2MTAuMWMwIDkuMyA1LjkgMTcgMTQgMjAuMiIgc3Ryb2tlPSJ1cmwoI2cpIiBzdHJva2Utd2lkdGg9IjIuMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTIwIDNsMTQgNS4ydjEwLjFjMCA5LjMtNS45IDE3LTE0IDIwLjIiIHN0cm9rZT0idXJsKCNnKSIgc3Ryb2tlLXdpZHRoPSIyLjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWRhc2hhcnJheT0iMy40IDIuNiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0xMS41IDIxLjVoMTciIHN0cm9rZT0idXJsKCNnKSIgc3Ryb2tlLXdpZHRoPSIxLjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW9wYWNpdHk9IjAuNDUiLz4KICA8cGF0aCBkPSJNMTQuNiAyMS4ybDMuOCAzLjkgNy4yLTcuNyIgc3Ryb2tlPSJ1cmwoI2cpIiBzdHJva2Utd2lkdGg9IjIuNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+Cjwvc3ZnPgo=";

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
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          {/* The real mark, inlined as a data URI — satori renders SVG through img */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARK} width={52} height={52} alt="" />
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
          {["7 WebMCP tools", "document.modelContext", "MIT licensed"].map((t) => (
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
