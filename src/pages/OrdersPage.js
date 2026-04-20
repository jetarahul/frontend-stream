import React, { useState, useEffect } from "react";
import api from "../services/api";

const STREAM_URL = "https://stream-service-820892686232.us-central1.run.app/orders";

const card = {
  background: "#11243a",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
};

const tabStyle = (active) => ({
  padding: "10px 20px",
  marginRight: "4px",
  border: "none",
  borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
  background: "transparent",
  fontWeight: active ? "700" : "500",
  color: active ? "#f1f5f9" : "#94a3b8",
  cursor: "pointer",
  fontSize: "14px",
  fontFamily: "Segoe UI, system-ui, sans-serif",
  transition: "color 0.15s",
});

const thStyle = {
  padding: "12px 18px", textAlign: "left",
  fontSize: "11px", color: "#94a3b8",
  fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em",
  background: "#0f2035",
};

const tdStyle = { padding: "14px 18px", fontSize: "14px" };

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const key of Object.keys(data)) if (Array.isArray(data[key])) return data[key];
  return [];
};

const statusBadge = (status) => {
  const map = {
    FILLED:   { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
    REJECTED: { bg: "rgba(239,68,68,0.12)",  color: "#f87171", border: "rgba(239,68,68,0.3)" },
    ACCEPTED: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
    PLACED:   { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
    PENDING:  { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
    CANCELED: { bg: "rgba(249,115,22,0.12)", color: "#fb923c", border: "rgba(249,115,22,0.3)" },
  };
  const s = map[status] || { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.2)" };
  return {
    display: "inline-block", padding: "3px 10px", borderRadius: "6px",
    fontSize: "11px", fontWeight: "700",
    background: s.bg, color: s.color,
    border: `1px solid ${s.border}`,
  };
};

function OpenOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/orders")
      .then((r) => setOrders(extractArray(r.data)))
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "#94a3b8" }}>Loading orders...</p>;
  if (error)   return <p style={{ color: "#f87171" }}>{error}</p>;
  if (orders.length === 0) return (
    <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
      <div style={{ fontSize: "14px", color: "#94a3b8" }}>
        No orders yet. Orders appear here once the strategy engine generates signals.
      </div>
    </div>
  );

  return (
    <>
      <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "1rem" }}>
        {orders.length} order(s) — {orders.filter(o => o.status === "PLACED").length} awaiting,{" "}
        {orders.filter(o => o.status === "FILLED").length} filled,{" "}
        {orders.filter(o => o.status === "REJECTED").length} rejected
      </p>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e3a5f" }}>
              {["Order ID", "Symbol", "Side", "Qty", "Price", "Status", "Sent At"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={o.order_id} style={{ borderBottom: i < orders.length - 1 ? "1px solid #1e3a5f" : "none" }}>
                <td style={{ ...tdStyle, color: "#94a3b8", fontFamily: "'SF Mono', Consolas, monospace", fontSize: "13px" }}>#{o.order_id}</td>
                <td style={{ ...tdStyle, fontWeight: "700", color: "#f1f5f9" }}>{o.symbol}</td>
                <td style={{ ...tdStyle, fontWeight: "700",
                  color: o.side?.toUpperCase() === "BUY" ? "#34d399" : "#f87171" }}>
                  {o.side?.toUpperCase()}
                </td>
                <td style={{ ...tdStyle, color: "#cbd5e1", fontFamily: "'SF Mono', Consolas, monospace" }}>{o.qty}</td>
                <td style={{ ...tdStyle, color: "#cbd5e1", fontFamily: "'SF Mono', Consolas, monospace" }}>${o.price?.toLocaleString()}</td>
                <td style={tdStyle}><span style={statusBadge(o.status)}>{o.status}</span></td>
                <td style={{ ...tdStyle, color: "#64748b", fontSize: "12px" }}>
                  {new Date(o.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TradeHistoryTab() {
  const [fills, setFills] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/fills"), api.get("/orders")])
      .then(([fillsRes, ordersRes]) => {
        setFills(extractArray(fillsRes.data));
        setOrders(extractArray(ordersRes.data));
      })
      .catch(() => setError("Failed to load trade history."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "#94a3b8" }}>Loading trade history...</p>;
  if (error)   return <p style={{ color: "#f87171" }}>{error}</p>;
  if (fills.length === 0) return (
    <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
      <div style={{ fontSize: "14px", color: "#94a3b8" }}>
        No trades executed yet. Fills appear here once the broker executes your orders.
      </div>
    </div>
  );

  return (
    <>
      <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "1rem" }}>
        {fills.length} trade(s) executed by broker
      </p>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e3a5f" }}>
              {["Fill ID", "Order ID", "Symbol", "Side", "Fill Price", "Fill Qty", "Value", "Executed At"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fills.map((f, i) => {
              const order = orders.find((o) => o.order_id === f.order_id);
              return (
                <tr key={f.fill_id} style={{ borderBottom: i < fills.length - 1 ? "1px solid #1e3a5f" : "none" }}>
                  <td style={{ ...tdStyle, color: "#94a3b8", fontFamily: "'SF Mono', Consolas, monospace", fontSize: "13px" }}>#{f.fill_id}</td>
                  <td style={{ ...tdStyle, color: "#94a3b8", fontFamily: "'SF Mono', Consolas, monospace", fontSize: "13px" }}>#{f.order_id}</td>
                  <td style={{ ...tdStyle, fontWeight: "700", color: "#f1f5f9" }}>{order?.symbol ?? "—"}</td>
                  <td style={{ ...tdStyle, fontWeight: "700",
                    color: order?.side?.toUpperCase() === "BUY" ? "#34d399" : "#f87171" }}>
                    {order?.side?.toUpperCase() ?? "—"}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "'SF Mono', Consolas, monospace", fontWeight: "600", color: "#f1f5f9" }}>
                    ${f.fill_price?.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, color: "#cbd5e1", fontFamily: "'SF Mono', Consolas, monospace" }}>{f.fill_qty}</td>
                  <td style={{ ...tdStyle, fontFamily: "'SF Mono', Consolas, monospace", color: "#60a5fa", fontWeight: "700" }}>
                    ${(f.fill_price * f.fill_qty)?.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, color: "#64748b", fontSize: "12px" }}>
                    {new Date(f.timestamp).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function LiveFeedTab() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    let es;
    const connect = () => {
      es = new EventSource(STREAM_URL);
      es.onopen    = () => setStatus("Connected");
      es.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          if (d.heartbeat) return;
          setEvents((prev) => [
            { ...d, receivedAt: new Date().toLocaleTimeString() },
            ...prev.slice(0, 99),
          ]);
        } catch {}
      };
      es.onerror = () => {
        setStatus("Disconnected — reconnecting in 3s...");
        es.close();
        setTimeout(connect, 3000);
      };
    };
    connect();
    return () => es?.close();
  }, []);

  const statusColors = {
    ACCEPTED: "#60a5fa", FILLED: "#34d399",
    REJECTED: "#f87171", CANCELED: "#fb923c",
  };

  const connected = status === "Connected";

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "1rem" }}>
        Live broker events streamed via SSE — order lifecycle updates in real time
      </p>
      <div style={{
        ...card, padding: "1.5rem",
        fontFamily: "'SF Mono', Consolas, monospace", minHeight: "300px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", fontSize: "12px" }}>
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: connected ? "#10b981" : "#f59e0b",
            boxShadow: connected ? "0 0 6px #10b981" : "0 0 6px #f59e0b",
          }} />
          <span style={{ color: connected ? "#34d399" : "#fbbf24", fontWeight: "600" }}>{status}</span>
        </div>
        {events.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "13px" }}>
            Waiting for broker events... Events appear here when orders are accepted, filled or rejected.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {events.map((e, i) => (
              <li key={i} style={{
                marginBottom: "6px", fontSize: "13px",
                color: statusColors[e.status] || "#cbd5e1",
              }}>
                <span style={{ color: "#64748b" }}>[{e.receivedAt}]</span>{" "}
                <strong>{e.status}</strong> — {e.symbol} |{" "}
                {e.side} | Qty: {e.quantity ?? e.qty} | Price: {e.price ?? "—"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState("open");

  return (
    <div style={{ width: "100%", textAlign: "left", maxWidth: "1400px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>
          Orders
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
          Track your orders, executed trades and live broker events
        </p>
      </div>

      <div style={{ borderBottom: "1px solid #1e3a5f", marginBottom: "1.5rem", display: "flex" }}>
        {[["open", "Open Orders"], ["history", "Trade History"], ["feed", "Live Feed"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={tabStyle(tab === key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "open"    && <OpenOrdersTab />}
      {tab === "history" && <TradeHistoryTab />}
      {tab === "feed"    && <LiveFeedTab />}
    </div>
  );
}