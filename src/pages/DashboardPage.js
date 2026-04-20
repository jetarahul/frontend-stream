import React, { useEffect, useState } from "react";
import api from "../services/api";

const EXPOSURE_LIMIT = 100000;
const VAR_THRESHOLD = 5000;
const MARGIN_LIMIT = 50000;
const TICK_URL = "https://tick-ingestion-820892686232.us-central1.run.app/stream";

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const key of Object.keys(data)) if (Array.isArray(data[key])) return data[key];
  return [];
};

const card = {
  background: "#11243a",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
};

const sectionLabel = {
  fontSize: "11px", fontWeight: "700", color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px",
};

export default function DashboardPage({ userName }) {
  const [btc, setBtc] = useState(null);
  const [eth, setEth] = useState(null);
  const [prevBtc, setPrevBtc] = useState(null);
  const [prevEth, setPrevEth] = useState(null);
  const [stats, setStats] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const es = new EventSource(TICK_URL);
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.symbol === "BTCUSD") setBtc((prev) => { setPrevBtc(prev); return d.mark_price; });
        if (d.symbol === "ETHUSD") setEth((prev) => { setPrevEth(prev); return d.mark_price; });
      } catch {}
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, fillsRes] = await Promise.all([api.get("/orders"), api.get("/fills")]);
        const orders = extractArray(ordersRes.data);
        const fills = extractArray(fillsRes.data);
        const total = orders.length;
        const filled = orders.filter((o) => o.status === "FILLED").length;
        const rejected = orders.filter((o) => o.status === "REJECTED").length;
        const winRate = total > 0 ? ((filled / total) * 100).toFixed(1) : "0.0";
        const pnlList = fills.map((f) => {
          const order = orders.find((o) => o.order_id === f.order_id);
          return order ? (f.fill_price - order.price) * f.fill_qty : 0;
        });
        const totalPnl = pnlList.reduce((a, b) => a + b, 0);
        const wins = pnlList.filter((p) => p > 0).length;
        const losses = pnlList.filter((p) => p <= 0).length;
        setStats({ total, filled, rejected, winRate, totalPnl: totalPnl.toFixed(2), wins, losses });
        const open = orders.filter((o) => o.status === "ACCEPTED" || o.status === "FILLED");
        const exposure = open.reduce((s, o) => s + o.qty * o.price, 0);
        setRisk({
          exposure: exposure.toFixed(2),
          exposureUtil: ((exposure / EXPOSURE_LIMIT) * 100).toFixed(1),
          marginUtil: (((exposure * 0.1) / MARGIN_LIMIT) * 100).toFixed(1),
          var: (exposure * 0.02).toFixed(2),
          openOrders: open.length,
          totalOrders: total,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setStats(null); setRisk(null);
      } finally { setLoadingStats(false); }
    };
    fetchData();
  }, []);

  const priceColor = (c, p) => !c || !p ? "#f1f5f9" : c > p ? "#10b981" : c < p ? "#ef4444" : "#f1f5f9";
  const arrow = (c, p) => !c || !p ? "" : c > p ? " ▲" : c < p ? " ▼" : "";
  const sc = (val, thresh) => parseFloat(val) > thresh ? "#ef4444" : "#10b981";
  const sl = (val, thresh) => parseFloat(val) > thresh ? "High" : "Normal";

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
          Welcome back, {userName || "Trader"}
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
          Your algo trading platform is live and monitoring markets
        </p>
      </div>

      {/* Live Prices */}
      <p style={sectionLabel}>Live Market Prices</p>
      <div style={{ display: "flex", gap: "16px", marginBottom: "2rem", flexWrap: "wrap" }}>
        {[["BTCUSD", btc, prevBtc], ["ETHUSD", eth, prevEth]].map(([sym, curr, prev]) => (
          <div key={sym} style={{ ...card, minWidth: "220px", flex: 1, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>{sym}</span>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: curr ? "#10b981" : "#64748b",
                boxShadow: curr ? "0 0 8px #10b981" : "none",
                display: "inline-block",
              }} />
            </div>
            <div style={{
              fontSize: "30px", fontWeight: "700",
              fontFamily: "'SF Mono', Consolas, monospace",
              color: priceColor(curr, prev), letterSpacing: "-0.02em",
            }}>
              {curr ? `$${parseFloat(curr).toFixed(2)}${arrow(curr, prev)}` : "Connecting..."}
            </div>
            {prev && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
                prev: ${parseFloat(prev).toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Performance */}
      <p style={sectionLabel}>Performance Summary</p>
      {loadingStats ? (
        <p style={{ color: "#94a3b8" }}>Loading stats...</p>
      ) : stats ? (
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "2rem" }}>
          {statCard("Total Orders", stats.total, "#f1f5f9")}
          {statCard("Filled", stats.filled, "#10b981")}
          {statCard("Rejected", stats.rejected, "#ef4444")}
          {statCard("Win Rate", `${stats.winRate}%`, "#3b82f6")}
          {statCard("Total PnL", `$${stats.totalPnl}`, parseFloat(stats.totalPnl) >= 0 ? "#10b981" : "#ef4444")}
          {statCard("Wins", stats.wins, "#10b981")}
          {statCard("Losses", stats.losses, "#ef4444")}
        </div>
      ) : (
        <p style={{ color: "#ef4444" }}>Could not load stats.</p>
      )}

      {/* Risk */}
      <p style={sectionLabel}>Risk Overview</p>
      {risk ? (
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f2035", borderBottom: "1px solid #1e3a5f" }}>
                {["Metric", "Value", "Status"].map((h) => (
                  <th key={h} style={{
                    padding: "12px 18px", textAlign: "left",
                    fontSize: "11px", color: "#94a3b8",
                    fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Total Exposure", value: `$${risk.exposure}`, status: `${risk.exposureUtil}% of limit`, color: sc(risk.exposureUtil, 80) },
                { label: "Margin Utilization", value: `${risk.marginUtil}%`, status: sl(risk.marginUtil, 70), color: sc(risk.marginUtil, 70) },
                { label: "Value at Risk (2%)", value: `$${risk.var}`, status: sl(risk.var, VAR_THRESHOLD), color: sc(risk.var, VAR_THRESHOLD) },
                { label: "Open Orders", value: risk.openOrders, status: `of ${risk.totalOrders} total`, color: "#cbd5e1" },
              ].map((row, i, arr) => (
                <tr key={row.label} style={{ borderBottom: i < arr.length - 1 ? "1px solid #1e3a5f" : "none" }}>
                  <td style={{ padding: "14px 18px", color: "#cbd5e1", fontSize: "14px" }}>{row.label}</td>
                  <td style={{ padding: "14px 18px", fontWeight: "600", color: "#f1f5f9",
                    fontFamily: "'SF Mono', Consolas, monospace" }}>{row.value}</td>
                  <td style={{ padding: "14px 18px", color: row.color, fontSize: "13px", fontWeight: "600" }}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loadingStats && <p style={{ color: "#ef4444" }}>Could not load risk data.</p>}
    </div>
  );
}