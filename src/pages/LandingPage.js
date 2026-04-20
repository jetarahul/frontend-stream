import React, { useState, useEffect } from "react";
import { loginWithGoogle } from "../services/auth";

const TICKER_DATA = [
  { symbol: "BTC/USD", price: "84,231.50", change: "+2.34%", up: true },
  { symbol: "ETH/USD", price: "2,338.27", change: "+1.82%", up: true },
  { symbol: "NIFTY",   price: "22,147.00", change: "-0.43%", up: false },
  { symbol: "BTCUSDT", price: "84,198.00", change: "+2.21%", up: true },
  { symbol: "SOL/USD", price: "142.33",    change: "+3.11%", up: true },
  { symbol: "EUR/USD", price: "1.0821",    change: "-0.12%", up: false },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Real-Time Signals",
    desc: "Strategy engine fires BUY/SELL signals based on live market patterns — W-Pattern, EMA Cross, S/R Breakout.",
  },
  {
    icon: "🤖",
    title: "Automated Execution",
    desc: "Execution engine picks up signals, runs risk checks and places orders to broker automatically via Pub/Sub.",
  },
  {
    icon: "📊",
    title: "Live Order Stream",
    desc: "Every order lifecycle event — ACCEPTED, FILLED, REJECTED — streamed live to your dashboard via SSE.",
  },
  {
    icon: "🛡️",
    title: "Risk Management",
    desc: "Built-in exposure limits, margin utilization tracking and Value at Risk monitoring on every trade.",
  },
];

export default function LandingPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tickerPos, setTickerPos] = useState(0);

  // Animate ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPos((p) => p - 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      onLogin(user.displayName || user.email || "Trader");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tickerItems = [...TICKER_DATA, ...TICKER_DATA, ...TICKER_DATA];
  const resetPos = -(TICKER_DATA.length * 180);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)",
      fontFamily: "Segoe UI, system-ui, sans-serif",
      color: "#fff",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }} />

      {/* Glow effects */}
      <div style={{
        position: "absolute", top: "-200px", left: "50%",
        transform: "translateX(-50%)",
        width: "800px", height: "400px",
        background: "radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)",
        zIndex: 0,
      }} />
      <div style={{
        position: "absolute", bottom: "0", right: "-100px",
        width: "500px", height: "500px",
        background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)",
        zIndex: 0,
      }} />

      {/* Top bar */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.25rem 3rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #2563eb, #10b981)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px",
          }}>⚡</div>
          <span style={{ fontWeight: "700", fontSize: "16px", letterSpacing: "0.5px" }}>
            AT <span style={{ color: "#2563eb" }}>P</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 8px #10b981",
          }} />
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            Markets Live
          </span>
        </div>
      </div>

      {/* Live ticker */}
      <div style={{
        position: "relative", zIndex: 2,
        background: "rgba(0,0,0,0.3)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden", height: "36px",
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          display: "flex", gap: "0",
          transform: `translateX(${tickerPos % resetPos === 0 ? 0 : tickerPos}px)`,
          whiteSpace: "nowrap",
          transition: "none",
        }}>
          {tickerItems.map((t, i) => (
            <div key={i} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "0 24px", minWidth: "180px",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600" }}>
                {t.symbol}
              </span>
              <span style={{ fontSize: "12px", color: "#fff", fontFamily: "monospace" }}>
                {t.price}
              </span>
              <span style={{
                fontSize: "11px", fontWeight: "600",
                color: t.up ? "#10b981" : "#ef4444",
              }}>
                {t.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero section */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center",
        padding: "5rem 2rem 3rem",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(37,99,235,0.15)",
          border: "1px solid rgba(37,99,235,0.3)",
          borderRadius: "100px", padding: "6px 16px",
          fontSize: "12px", color: "#93c5fd",
          marginBottom: "2rem", fontWeight: "500",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#2563eb", display: "inline-block",
          }} />
          BITS PILANI — Algorithmic Trading Research Project
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: "800",
          lineHeight: "1.1",
          marginBottom: "1.5rem",
          maxWidth: "800px",
          letterSpacing: "-0.02em",
        }}>
          Algorithmic Trading
          <br />
          <span style={{
            background: "linear-gradient(90deg, #2563eb, #10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Platform.
          </span>
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: "1.1rem", color: "#9ca3af",
          maxWidth: "560px", lineHeight: "1.7",
          marginBottom: "3rem",
        }}>
          Live market data → Strategy signals → Automated execution → Real-time
          order tracking. Built on GCP with FastAPI, Pub/Sub, and React.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "#fff",
            color: "#1a1a1a",
            border: "none",
            borderRadius: "12px",
            padding: "14px 28px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            transition: "transform 0.15s, box-shadow 0.15s",
            fontFamily: "Segoe UI, system-ui, sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
          }}
        >
          {/* Google icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        {error && (
          <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "1rem" }}>
            {error}
          </p>
        )}

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "3rem", marginTop: "4rem",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { value: "< 1s",  label: "Signal Latency" },
            { value: "3",     label: "Strategy Patterns" },
            { value: "99.9%", label: "Uptime on GCP" },
            { value: "Live",  label: "Delta Exchange Feed" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "1.8rem", fontWeight: "800",
                background: "linear-gradient(90deg, #fff, #93c5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1px",
        background: "rgba(255,255,255,0.06)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        margin: "2rem 0 0",
      }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{
            background: "rgba(10,15,30,0.8)",
            padding: "2rem",
            backdropFilter: "blur(10px)",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
            <div style={{
              fontSize: "14px", fontWeight: "700",
              color: "#fff", marginBottom: "0.5rem",
              letterSpacing: "0.01em",
            }}>
              {f.title}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: "relative", zIndex: 2,
        textAlign: "center", padding: "1.5rem",
        fontSize: "12px", color: "#374151",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        Built by <span style={{ color: "#6b7280" }}>Rahul Raj</span> — BITS PILANI Project ·
        Powered by GCP · Delta Exchange · Firebase
      </div>
    </div>
  );
}