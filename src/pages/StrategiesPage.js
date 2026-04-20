import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/strategy/list")
      .then((res) => setStrategies(res.data.strategies || []))
      .catch((err) => console.error("Failed to load strategies:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this strategy?")) {
      try {
        await api.delete(`/strategy/delete/${id}`);
        setStrategies((prev) => prev.filter((s) => s.strategy_id !== id));
      } catch {
        alert("Failed to delete strategy.");
      }
    }
  };

  return (
    <div style={{ width: "100%", textAlign: "left", maxWidth: "1400px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>
            Strategies
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
            Manage your automated trading strategies
          </p>
        </div>
        <button onClick={() => navigate("/create-strategy")} style={{
          background: "#3b82f6", color: "#fff",
          border: "none", borderRadius: "8px",
          padding: "10px 18px", cursor: "pointer",
          fontFamily: "Segoe UI, system-ui, sans-serif",
          fontSize: "13px", fontWeight: "600",
        }}>
          + Create Strategy
        </button>
      </div>

      <div style={{
        background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)",
        borderRadius: "8px", padding: "12px 16px", marginBottom: "1.5rem",
        fontSize: "13px", color: "#bfdbfe",
      }}>
        Platform runs <strong style={{ color: "#e2e8f0" }}>predefined logic</strong> (W-Pattern, EMA Cross, S/R Breakout)
        automatically on live market data. Create Strategy is available for future customization.
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading strategies...</p>
      ) : strategies.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "14px", color: "#94a3b8" }}>
            No strategies yet. Create one to get started.
          </div>
        </div>
      ) : (
        <>
          <p style={sectionLabel}>{strategies.length} strategy(s) configured</p>
          <div style={{ ...card, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f2035", borderBottom: "1px solid #1e3a5f" }}>
                  {["ID", "Name", "Symbol", "Pattern", "Qty", "Status", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 18px", textAlign: "left",
                      fontSize: "11px", color: "#94a3b8",
                      fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {strategies.map((s, i) => (
                  <tr key={s.strategy_id} style={{ borderBottom: i < strategies.length - 1 ? "1px solid #1e3a5f" : "none" }}>
                    <td style={{ padding: "14px 18px", color: "#94a3b8", fontSize: "13px",
                      fontFamily: "'SF Mono', Consolas, monospace" }}>#{s.strategy_id}</td>
                    <td style={{ padding: "14px 18px", fontWeight: "700", color: "#f1f5f9" }}>{s.name}</td>
                    <td style={{ padding: "14px 18px", color: "#cbd5e1", fontFamily: "'SF Mono', Consolas, monospace" }}>{s.symbol}</td>
                    <td style={{ padding: "14px 18px", color: "#cbd5e1" }}>{s.pattern_type}</td>
                    <td style={{ padding: "14px 18px", color: "#cbd5e1", fontFamily: "'SF Mono', Consolas, monospace" }}>{s.qty}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: "6px",
                        fontSize: "11px", fontWeight: "700",
                        background: s.is_active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                        color: s.is_active ? "#34d399" : "#f87171",
                        border: `1px solid ${s.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                      }}>
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        <Link to={`/strategies/${s.strategy_id}`} style={{
                          color: "#60a5fa", textDecoration: "none", fontSize: "13px", fontWeight: "600",
                        }}>View</Link>
                        <Link to={`/strategies/edit/${s.strategy_id}`} style={{
                          color: "#cbd5e1", textDecoration: "none", fontSize: "13px", fontWeight: "600",
                        }}>Edit</Link>
                        <button onClick={() => handleDelete(s.strategy_id)} style={{
                          background: "none", border: "none", color: "#f87171",
                          cursor: "pointer", fontSize: "13px", fontWeight: "600",
                          fontFamily: "Segoe UI, system-ui, sans-serif", padding: 0,
                        }}>Delete</button>
                      </div>
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