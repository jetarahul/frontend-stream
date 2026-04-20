import React from "react";

const card = {
  background: "#11243a",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
  padding: "24px",
};

const sectionLabel = {
  fontSize: "11px", fontWeight: "700", color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px",
};

export default function AboutMe() {
  const flow = [
    { step: "01", title: "Market Data", desc: "Live ticks from Delta Exchange WebSocket → Cloud SQL" },
    { step: "02", title: "Signal Engine", desc: "Strategy patterns (W, EMA, S/R) fire BUY/SELL signals" },
    { step: "03", title: "Execution", desc: "Execution Engine picks up signals via Pub/Sub, places orders" },
    { step: "04", title: "Risk Check", desc: "Exposure, margin, VaR validated before order submission" },
    { step: "05", title: "Order Events", desc: "ACCEPTED/FILLED/REJECTED streamed live via SSE" },
    { step: "06", title: "Dashboard", desc: "Real-time UI shows positions, P&L and risk metrics" },
  ];

  const techStack = [
    { label: "Frontend",   value: "React, Redux, Firebase Auth, Netlify" },
    { label: "Backend",    value: "FastAPI, Cloud Run, Pub/Sub, Cloud SQL" },
    { label: "Data",       value: "Delta Exchange WebSocket, PostgreSQL, GCS" },
    { label: "Monitoring", value: "Cloud Logging, Cloud Monitoring" },
  ];

  return (
    <div style={{ width: "100%", textAlign: "left", maxWidth: "960px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>
          About This Project
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
          Algorithmic Trading Platform — BITS PILANI Research Project by Rahul Raj
        </p>
      </div>

      <p style={sectionLabel}>Project Overview</p>
      <div style={{ ...card, marginBottom: "2rem" }}>
        <p style={{ fontSize: "15px", lineHeight: "1.75", color: "#cbd5e1", margin: 0 }}>
          The <span style={{ color: "#f1f5f9", fontWeight: "600" }}>Algorithmic Trading Platform</span> developed
          by <span style={{ color: "#60a5fa", fontWeight: "700" }}>Rahul Raj</span> as part of his{" "}
          <span style={{ color: "#60a5fa", fontWeight: "700" }}>BITS PILANI project</span> is a full-stack,
          cloud-native system that integrates real-time market data with automated trading strategies.
          The platform runs predefined strategy logic continuously against live market data,
          generates signals automatically, and places orders — all without manual intervention.
        </p>
      </div>

      <p style={sectionLabel}>End-to-End Flow</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "12px", marginBottom: "2rem",
      }}>
        {flow.map((f) => (
          <div key={f.step} style={{ ...card, display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{
              fontSize: "11px", fontWeight: "800", color: "#60a5fa",
              background: "rgba(59,130,246,0.12)", borderRadius: "6px",
              padding: "4px 10px", flexShrink: 0, letterSpacing: "0.05em",
              fontFamily: "'SF Mono', Consolas, monospace",
            }}>
              {f.step}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#f1f5f9", marginBottom: "4px" }}>
                {f.title}
              </div>
              <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={sectionLabel}>Technology Stack</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        {techStack.map((t) => (
          <div key={t.label} style={card}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              {t.label}
            </div>
            <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>
              {t.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}