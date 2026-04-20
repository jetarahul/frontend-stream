import React, { useEffect, useState } from "react";

const STREAM_SERVICE_URL = "https://stream-service-820892686232.us-central1.run.app";

const card = {
  background: "#11243a",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
};

const statusColors = {
  ACCEPTED: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)"  },
  FILLED:   { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  REJECTED: { bg: "rgba(239,68,68,0.12)",  color: "#f87171", border: "rgba(239,68,68,0.3)"  },
  CANCELED: { bg: "rgba(249,115,22,0.12)", color: "#fb923c", border: "rgba(249,115,22,0.3)" },
};

const getStatusStyle = (status) =>
  statusColors[status] || { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.2)" };

export default function OrderStream() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    let eventSource;
    const connect = () => {
      eventSource = new EventSource(`${STREAM_SERVICE_URL}/events`);
      eventSource.onopen    = () => setStatus("Connected");
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.heartbeat) return;
          setEvents((prev) => [{ ...data, receivedAt: new Date().toLocaleTimeString() }, ...prev.slice(0, 99)]);
        } catch (err) { console.error("Parse error:", err); }
      };
      eventSource.onerror = () => {
        setStatus("Reconnecting...");
        eventSource.close();
        setTimeout(connect, 3000);
      };
    };
    connect();
    return () => eventSource?.close();
  }, []);

  const isConnected = status === "Connected";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12 }}>
        <span style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: isConnected ? "#10b981" : "#f59e0b",
          boxShadow: isConnected ? "0 0 6px #10b981" : "0 0 6px #f59e0b",
        }} />
        <span style={{ color: isConnected ? "#34d399" : "#fbbf24", fontWeight: "600" }}>
          Status: {status}
        </span>
      </div>

      {events.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9", marginBottom: "8px" }}>
            Waiting for order events
          </div>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
            Events appear here when orders are accepted, filled or rejected.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {events.map((ev, i) => {
            const s = getStatusStyle(ev.status);
            return (
              <div key={i} style={{
                ...card, padding: "14px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: s.color, marginTop: 6, flexShrink: 0,
                  boxShadow: `0 0 6px ${s.color}`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: "6px",
                      fontSize: "11px", fontWeight: "700",
                      background: s.bg, color: s.color,
                      border: `1px solid ${s.border}`,
                    }}>
                      {ev.status}
                    </span>
                    <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13 }}>{ev.symbol}</span>
                    <span style={{ color: "#64748b", fontSize: 11, marginLeft: "auto",
                      fontFamily: "'SF Mono', Consolas, monospace" }}>
                      {ev.receivedAt}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                    <span style={{ color: "#94a3b8", fontFamily: "'SF Mono', Consolas, monospace" }}>#{ev.order_id}</span>
                    {" — "}
                    <span style={{
                      color: ev.side === "BUY" ? "#34d399" : ev.side === "SELL" ? "#f87171" : "#cbd5e1",
                      fontWeight: 600,
                    }}>
                      {ev.side}
                    </span>
                    {" "}{ev.qty} @ <span style={{ fontFamily: "'SF Mono', Consolas, monospace" }}>${ev.price}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}