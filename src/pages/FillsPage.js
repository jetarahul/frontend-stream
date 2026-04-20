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

export default function FillsPage() {
  const [fills, setFills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFills = async () => {
      try {
        const response = await api.get("/fills");
        setFills(response.data.fills || []);
      } catch (err) {
        console.error("Error fetching fills:", err);
        setError("Failed to load fills.");
      } finally { setLoading(false); }
    };
    fetchFills();
  }, []);

  return (
    <div style={{ width: "100%", textAlign: "left", maxWidth: "1400px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>
          Fills
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
          Executed trade fills received from the broker
        </p>
      </div>

      {loading && <p style={{ color: "#94a3b8" }}>Loading fills...</p>}

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "8px", padding: "12px 16px",
          color: "#fca5a5", fontSize: "13px", marginBottom: "1.5rem",
        }}>
          {error}
        </div>
      )}

      {!loading && !error && fills.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9", marginBottom: "8px" }}>
            No fills yet
          </div>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
            Fills will appear here once the broker executes your orders.
          </div>
        </div>
      )}

      {fills.length > 0 && (
        <>
          <p style={sectionLabel}>{fills.length} fill(s) executed</p>
          <div style={{ ...card, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f2035", borderBottom: "1px solid #1e3a5f" }}>
                  {["Fill ID", "Order ID", "Fill Price", "Fill Quantity", "Timestamp"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 18px", textAlign: "left",
                      fontSize: "11px", color: "#94a3b8",
                      fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fills.map((f, i) => (
                  <tr key={f.fill_id} style={{ borderBottom: i < fills.length - 1 ? "1px solid #1e3a5f" : "none" }}>
                    <td style={{ padding: "14px 18px", color: "#94a3b8",
                      fontFamily: "'SF Mono', Consolas, monospace", fontSize: "13px" }}>#{f.fill_id}</td>
                    <td style={{ padding: "14px 18px", color: "#94a3b8",
                      fontFamily: "'SF Mono', Consolas, monospace", fontSize: "13px" }}>#{f.order_id}</td>
                    <td style={{ padding: "14px 18px", fontFamily: "'SF Mono', Consolas, monospace",
                      fontWeight: "700", color: "#f1f5f9" }}>
                      ${Number(f.fill_price).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#cbd5e1",
                      fontFamily: "'SF Mono', Consolas, monospace" }}>{f.fill_qty}</td>
                    <td style={{ padding: "14px 18px", color: "#64748b", fontSize: "12px" }}>
                      {f.timestamp ? new Date(f.timestamp).toLocaleString() : "—"}
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