import React, { useEffect, useState } from "react";
import api from "../services/api";

const card = {
  background: "#11243a",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
};

const sectionLabel = {
  fontSize: "11px", fontWeight: "700", color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px",
};

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const key of Object.keys(data)) if (Array.isArray(data[key])) return data[key];
  return [];
};

export default function StrategyAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [ordersRes, fillsRes] = await Promise.all([
          api.get("/orders"),
          api.get("/fills"),
        ]);
        const orders = extractArray(ordersRes.data);
        const fills = extractArray(fillsRes.data);

        const total = orders.length;
        const filled = orders.filter((o) => o.status === "FILLED").length;
        const rejected = orders.filter((o) => o.status === "REJECTED").length;
        const winRate = total > 0 ? ((filled / total) * 100).toFixed(1) : 0;

        const pnlList = fills.map((f) => {
          const order = orders.find((o) => o.order_id === f.order_id);
          if (!order) return 0;
          return (f.fill_price - order.price) * f.fill_qty;
        });
        const totalPnl = pnlList.reduce((a, b) => a + b, 0);
        const avgPnl = fills.length > 0 ? (totalPnl / fills.length).toFixed(2) : 0;
        const wins = pnlList.filter((p) => p > 0).length;
        const losses = pnlList.filter((p) => p <= 0).length;

        const bySymbol = {};
        orders.forEach((o) => {
          if (!bySymbol[o.symbol]) bySymbol[o.symbol] = { total: 0, filled: 0 };
          bySymbol[o.symbol].total++;
          if (o.status === "FILLED") bySymbol[o.symbol].filled++;
        });

        setStats({ total, filled, rejected, winRate, totalPnl: totalPnl.toFixed(2), avgPnl, wins, losses, bySymbol });
      } catch (err) {
        setError("Failed to load analytics.");
      } finally { setLoading(false); }
    };
    fetchAnalytics();
  }, []);

  const statCard = (label, value, color) => (
    <div key={label} style={{ ...card, textAlign: "center", minWidth: "120px", flex: 1, padding: "18px 16px" }}>
      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px",
        textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: "700", color: color || "#f1f5f9",
        fontFamily: "'SF Mono', Consolas, monospace", letterSpacing: "-0.01em" }}>
        {value}
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", textAlign: "left", maxWidth: "1400px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>
          Strategy Analytics
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
          Performance metrics from your executed orders and fills
        </p>
      </div>

      {loading && <p style={{ color: "#94a3b8" }}>Loading analytics...</p>}

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "8px", padding: "12px 16px",
          color: "#fca5a5", fontSize: "13px", marginBottom: "1.5rem",
        }}>
          {error}
        </div>
      )}

      {stats && !error && (
        <>
          <p style={sectionLabel}>Performance Summary</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "2rem" }}>
            {statCard("Total Orders", stats.total, "#f1f5f9")}
            {statCard("Filled", stats.filled, "#34d399")}
            {statCard("Rejected", stats.rejected, "#f87171")}
            {statCard("Win Rate", `${stats.winRate}%`, "#60a5fa")}
            {statCard("Total PnL", `$${stats.totalPnl}`, parseFloat(stats.totalPnl) >= 0 ? "#34d399" : "#f87171")}
            {statCard("Avg PnL/Fill", `$${stats.avgPnl}`, parseFloat(stats.avgPnl) >= 0 ? "#34d399" : "#f87171")}
            {statCard("Wins", stats.wins, "#34d399")}
            {statCard("Losses", stats.losses, "#f87171")}
          </div>

          <p style={sectionLabel}>Orders by Symbol</p>
          {Object.keys(stats.bySymbol).length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                No orders to break down by symbol yet.
              </div>
            </div>
          ) : (
            <div style={{ ...card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f2035", borderBottom: "1px solid #1e3a5f" }}>
                    {["Symbol", "Total Orders", "Filled", "Fill Rate"].map((h) => (
                      <th key={h} style={{
                        padding: "12px 18px", textAlign: "left",
                        fontSize: "11px", color: "#94a3b8",
                        fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.bySymbol).map(([sym, s], i, arr) => {
                    const rate = s.total > 0 ? ((s.filled / s.total) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={sym} style={{ borderBottom: i < arr.length - 1 ? "1px solid #1e3a5f" : "none" }}>
                        <td style={{ padding: "14px 18px", fontWeight: "700", color: "#f1f5f9" }}>{sym}</td>
                        <td style={{ padding: "14px 18px", color: "#cbd5e1", fontFamily: "'SF Mono', Consolas, monospace" }}>{s.total}</td>
                        <td style={{ padding: "14px 18px", color: "#34d399", fontFamily: "'SF Mono', Consolas, monospace", fontWeight: "600" }}>{s.filled}</td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{
                            display: "inline-block", padding: "3px 10px", borderRadius: "6px",
                            fontSize: "12px", fontWeight: "700",
                            fontFamily: "'SF Mono', Consolas, monospace",
                            background: parseFloat(rate) >= 50 ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                            color: parseFloat(rate) >= 50 ? "#34d399" : "#fbbf24",
                            border: `1px solid ${parseFloat(rate) >= 50 ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                          }}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}