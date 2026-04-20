import React, { useEffect, useState } from "react";

const STRATEGY_ENGINE_URL = "https://strategy-engine-820892686232.us-central1.run.app";

const card = {
  background: "#11243a",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
};

const sectionLabel = {
  fontSize: "11px", fontWeight: "700", color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px",
};

export default function SignalDashboard() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSignal = async () => {
    try {
      const res = await fetch(`${STRATEGY_ENGINE_URL}/debug/last-signal`);
      const data = await res.json();
      if (data.last_signal) {
        setSignals((prev) => {
          const isDuplicate = prev.some(
            (s) => s.symbol === data.last_signal.symbol &&
                   s.action === data.last_signal.action &&
                   s.entry === data.last_signal.entry
          );
          if (isDuplicate) return prev;
          return [{ ...data.last_signal, id: Date.now(), timestamp: new Date().toLocaleTimeString() }, ...prev];
        });
      }
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError("Unable to reach Strategy Engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignal();
    const interval = setInterval(fetchSignal, 5000);
    return () => clearInterval(interval);
  }, []);

  const actionBadge = (action) => ({
    display: "inline-block", padding: "3px 12px", borderRadius: "6px",
    fontWeight: "700", fontSize: "12px", letterSpacing: "0.05em",
    background: action === "BUY" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
    color: action === "BUY" ? "#34d399" : "#f87171",
    border: `1px solid ${action === "BUY" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
  });

  return (
    <div style={{ width: "100%", textAlign: "left", maxWidth: "1400px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>
            Trading Signals
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
            Live BUY/SELL signals from Strategy Engine — polling every 5 seconds
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: error ? "#ef4444" : "#10b981",
            boxShadow: error ? "0 0 6px #ef4444" : "0 0 6px #10b981",
          }} />
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            {error ? "Disconnected" : `Live · ${lastUpdated || "connecting..."}`}
          </span>
        </div>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "8px", padding: "12px 16px",
          color: "#fca5a5", fontSize: "13px", marginBottom: "1.5rem",
        }}>
          {error}
        </div>
      )}

      {loading && <p style={{ color: "#94a3b8" }}>Connecting to Strategy Engine...</p>}

      {!loading && signals.length === 0 && !error && (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9", marginBottom: "8px" }}>
            No signals yet
          </div>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
            Strategy Engine is running and monitoring live market data.
            Signals will appear here when pattern conditions are met.
          </div>
        </div>
      )}

      {signals.length > 0 && (
        <>
          <p style={sectionLabel}>{signals.length} signal(s) detected</p>
          <div style={{ ...card, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f2035", borderBottom: "1px solid #1e3a5f" }}>
                  {["Time", "Symbol", "Action", "Entry", "Stop Loss", "Target"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 18px", textAlign: "left",
                      fontSize: "11px", color: "#94a3b8",
                      fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signals.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i < signals.length - 1 ? "1px solid #1e3a5f" : "none" }}>
                    <td style={{ padding: "14px 18px", color: "#94a3b8", fontSize: "12px",
                      fontFamily: "'SF Mono', Consolas, monospace" }}>
                      {s.timestamp || "—"}
                    </td>
                    <td style={{ padding: "14px 18px", fontWeight: "700", color: "#f1f5f9" }}>
                      {s.symbol}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={actionBadge(s.action)}>{s.action}</span>
                    </td>
                    <td style={{ padding: "14px 18px", fontFamily: "'SF Mono', Consolas, monospace", color: "#f1f5f9", fontWeight: "600" }}>
                      ${s.entry?.toFixed(2)}
                    </td>
                    <td style={{ padding: "14px 18px", fontFamily: "'SF Mono', Consolas, monospace", color: "#f87171" }}>
                      ${s.stoploss?.toFixed(2)}
                    </td>
                    <td style={{ padding: "14px 18px", fontFamily: "'SF Mono', Consolas, monospace", color: "#34d399" }}>
                      ${s.target?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}