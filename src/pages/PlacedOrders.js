import React, { useEffect, useState } from "react";
import api from "../services/api";
import { handleApiError, handleSuccess } from "../utils/errorHandler";

const card = {
  background: "#11243a",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
};

const thStyle = {
  padding: "12px 18px", textAlign: "left",
  fontSize: "11px", color: "#94a3b8",
  fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em",
  background: "#0f2035",
};

const tdStyle = { padding: "14px 18px", fontSize: "14px" };

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

const sideBadge = (side) => ({
  display: "inline-block", padding: "3px 10px", borderRadius: "6px",
  fontSize: "11px", fontWeight: "700",
  background: side === "BUY" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
  color: side === "BUY" ? "#34d399" : "#f87171",
  border: `1px solid ${side === "BUY" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
});

export default function PlacedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        const data = response.data;
        if (Array.isArray(data))             setOrders(data);
        else if (Array.isArray(data.orders)) setOrders(data.orders);
        else setOrders([]);
      } catch (error) { handleApiError(error, "Fetching orders"); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const handleExport = async () => {
    try {
      await api.get("/export/orders");
      handleSuccess("Orders export triggered successfully!");
    } catch (error) { handleApiError(error, "Export orders"); }
  };

  if (loading) return <p style={{ color: "#94a3b8" }}>Loading orders...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={handleExport} style={{
          background: "transparent", color: "#cbd5e1",
          border: "1px solid #1e3a5f", borderRadius: "8px",
          padding: "8px 16px", cursor: "pointer",
          fontFamily: "Segoe UI, system-ui, sans-serif",
          fontSize: "13px", fontWeight: "600",
        }}>
          Export to GCS
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "14px", color: "#94a3b8" }}>No orders found</div>
        </div>
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a5f" }}>
                {["ID","Symbol","Side","Quantity","Price","Status","Timestamp"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? "1px solid #1e3a5f" : "none" }}>
                  <td style={{ ...tdStyle, color: "#94a3b8",
                    fontFamily: "'SF Mono', Consolas, monospace", fontSize: "13px" }}>#{o.id}</td>
                  <td style={{ ...tdStyle, fontWeight: "700", color: "#f1f5f9" }}>{o.symbol}</td>
                  <td style={tdStyle}><span style={sideBadge(o.side)}>{o.side}</span></td>
                  <td style={{ ...tdStyle, color: "#cbd5e1", fontFamily: "'SF Mono', Consolas, monospace" }}>{o.quantity}</td>
                  <td style={{ ...tdStyle, color: "#cbd5e1", fontFamily: "'SF Mono', Consolas, monospace" }}>
                    ${Number(o.price).toLocaleString()}
                  </td>
                  <td style={tdStyle}><span style={statusBadge(o.status)}>{o.status}</span></td>
                  <td style={{ ...tdStyle, color: "#64748b", fontSize: "12px" }}>
                    {o.timestamp ? new Date(o.timestamp).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}