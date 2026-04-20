import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

export default function StrategyViewPage() {
  const { id } = useParams();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/strategy/${id}`)
      .then((res) => {
        if (res.data.strategy) setStrategy(res.data.strategy);
        else alert("Strategy not found");
      })
      .catch(() => alert("Failed to load strategy."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: "#94a3b8", padding: "20px" }}>Loading strategy...</p>;
  if (!strategy) return null;

  const row = (label, value) => (
    <div key={label} style={{
      display: "flex", padding: "14px 0",
      borderBottom: "1px solid #1e3a5f",
    }}>
      <span style={{ width: "180px", color: "#94a3b8", fontSize: "12px", fontWeight: "700",
        textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ flex: 1, fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>
        {value}
      </span>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: "680px", textAlign: "left" }}>
      <BackButton />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>
            Strategy View
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
            Viewing details for: <span style={{ color: "#60a5fa", fontWeight: "600" }}>{strategy.name}</span>
          </p>
        </div>
        <Link to={`/strategies/edit/${id}`} style={{
          background: "rgba(59,130,246,0.12)", color: "#60a5fa",
          border: "1px solid rgba(59,130,246,0.3)",
          textDecoration: "none", borderRadius: "8px",
          padding: "8px 16px", fontSize: "13px", fontWeight: "600",
        }}>
          Edit Strategy
        </Link>
      </div>

      <div style={{
        background: "#11243a",
        border: "1px solid #1e3a5f",
        borderRadius: "10px", padding: "1.5rem",
      }}>
        {row("Strategy ID", `#${strategy.strategy_id}`)}
        {row("Name", strategy.name)}
        {row("Pattern Type", strategy.pattern_type)}
        {row("Symbol", strategy.symbol)}
        {row("Lookback Period", strategy.lookback)}
        {row("Quantity", strategy.qty)}
        {row("Status", (
          <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: "6px",
            fontSize: "11px", fontWeight: "700",
            background: strategy.is_active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            color: strategy.is_active ? "#34d399" : "#f87171",
            border: `1px solid ${strategy.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}>
            {strategy.is_active ? "Active" : "Inactive"}
          </span>
        ))}
        <div style={{ paddingTop: "14px" }}>
          <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "700",
            textTransform: "uppercase", letterSpacing: "0.06em" }}>Config JSON</span>
          <pre style={{
            background: "#0f2035", border: "1px solid #1e3a5f",
            borderRadius: "8px", padding: "14px", marginTop: "8px",
            fontSize: "13px", overflowX: "auto", color: "#34d399",
            fontFamily: "'SF Mono', Consolas, monospace",
          }}>
            {JSON.stringify(strategy.config_json, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}