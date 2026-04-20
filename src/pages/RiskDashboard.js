import React, { useEffect, useState } from "react";
import api from "../services/api";

const EXPOSURE_LIMIT = 100000;
const VAR_THRESHOLD = 5000;
const MARGIN_LIMIT = 50000;

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

export default function RiskDashboard() {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await api.get("/orders");
        const orders = extractArray(res.data);

        const openOrders = orders.filter((o) => o.status === "ACCEPTED" || o.status === "FILLED");
        const exposure = openOrders.reduce((sum, o) => sum + (o.qty * o.price), 0);
        const exposureUtilization = ((exposure / EXPOSURE_LIMIT) * 100).toFixed(1);
        const marginUsed = exposure * 0.1;
        const marginUtilization = ((marginUsed / MARGIN_LIMIT) * 100).toFixed(1);
        const varEstimate = exposure * 0.02;

        setRisk({
          exposure: exposure.toFixed(2),
          exposureUtilization,
          marginUtilization,
          var: varEstimate.toFixed(2),
          openOrders: openOrders.length,
          totalOrders: orders.length,
        });
      } catch (err) {
        setError("Failed to load risk data.");
      } finally { setLoading(false); }
    };
    fetchRisk();
  }, []);

  const statusColor = (val, threshold) => parseFloat(val) > threshold ? "#f87171" : "#34d399";
  const statusLabel = (val, threshold) => parseFloat(val) > threshold ? "High" : "Normal";

  return (
    <div style={{ width: "100%", textAlign: "left", maxWidth: "1400px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>
          Risk Management
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
          Live exposure, margin and Value at Risk monitoring
        </p>
      </div>

      {loading && <p style={{ color: "#94a3b8" }}>Loading risk metrics...</p>}

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "8px", padding: "12px 16px",
          color: "#fca5a5", fontSize: "13px", marginBottom: "1.5rem",
        }}>
          {error}
        </div>
      )}

      {risk && !error && (
        <>
          <p style={sectionLabel}>Summary</p>
          <div style={{ display: "flex", gap: "12px", marginBottom: "2rem", flexWrap: "wrap" }}>
            {[
              { label: "Total Exposure", value: `$${risk.exposure}`, color: "#f1f5f9" },
              { label: "Open Orders", value: risk.openOrders, color: "#60a5fa" },
              { label: "Value at Risk (2%)", value: `$${risk.var}`,
                color: parseFloat(risk.var) > VAR_THRESHOLD ? "#f87171" : "#34d399" },
            ].map((s) => (
              <div key={s.label} style={{ ...card, textAlign: "center", minWidth: "160px", flex: 1, padding: "18px 16px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px",
                  textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>{s.label}</div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: s.color,
                  fontFamily: "'SF Mono', Consolas, monospace", letterSpacing: "-0.01em" }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <p style={sectionLabel}>Risk Metrics</p>
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
                  { label: "Total Exposure", value: `$${risk.exposure}`,
                    color: statusColor(risk.exposureUtilization, 80),
                    status: `${risk.exposureUtilization}% of limit` },
                  { label: "Margin Utilization", value: `${risk.marginUtilization}%`,
                    color: statusColor(risk.marginUtilization, 70),
                    status: statusLabel(risk.marginUtilization, 70) },
                  { label: "Value at Risk (VaR 2%)", value: `$${risk.var}`,
                    color: statusColor(risk.var, VAR_THRESHOLD),
                    status: statusLabel(risk.var, VAR_THRESHOLD) },
                  { label: "Open Orders", value: risk.openOrders,
                    color: "#cbd5e1",
                    status: `of ${risk.totalOrders} total` },
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
        </>
      )}
    </div>
  );
}