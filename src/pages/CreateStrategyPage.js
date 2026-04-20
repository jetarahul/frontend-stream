import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

const inputStyle = {
  flex: 1, padding: "10px 12px",
  background: "#0f2035",
  border: "1px solid #1e3a5f",
  borderRadius: "8px",
  fontFamily: "Segoe UI, system-ui, sans-serif",
  fontSize: "14px",
  color: "#f1f5f9",
  outline: "none",
};

const labelStyle = {
  width: "160px", textAlign: "right", marginRight: "1rem",
  fontWeight: "500", color: "#cbd5e1", fontSize: "13px", flexShrink: 0,
};

const rowStyle = { display: "flex", alignItems: "center", marginBottom: "1rem" };

export default function CreateStrategyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", pattern_type: "", symbol: "BTCUSDT",
    lookback: 5, qty: 1, config_json: "{}", is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let parsedConfig = {};
      try { parsedConfig = form.config_json ? JSON.parse(form.config_json) : {}; }
      catch { alert('Config JSON must be valid JSON'); return; }
      await api.post("/strategy/create", {
        name: form.name, pattern_type: form.pattern_type, symbol: form.symbol,
        lookback: Number(form.lookback), qty: Number(form.qty),
        config_json: parsedConfig, is_active: form.is_active,
      }, { headers: { "Content-Type": "application/json" } });
      alert("Strategy created successfully!");
      navigate("/strategies");
    } catch (err) {
      console.error("Error creating strategy:", err.response?.data || err);
      alert("Failed to create strategy");
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "640px", textAlign: "left" }}>
      <BackButton />

      <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", marginBottom: "6px", letterSpacing: "-0.01em" }}>
        Create New Strategy
      </h1>
      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "2rem" }}>
        Define a new trading strategy to be tracked in the platform
      </p>

      <div style={{
        background: "#11243a",
        border: "1px solid #1e3a5f",
        borderRadius: "10px", padding: "2rem",
      }}>
        <form onSubmit={handleSubmit}>
          <div style={rowStyle}>
            <label style={labelStyle}>Strategy Name</label>
            <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} placeholder="e.g. BTC EMA Cross" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Pattern Type</label>
            <select name="pattern_type" value={form.pattern_type} onChange={handleChange} required style={inputStyle}>
              <option value="">— Select Pattern —</option>
              <option value="W_PATTERN">W Pattern</option>
              <option value="EMA_CROSS">EMA Cross</option>
              <option value="S_R_BREAK">S/R Breakout</option>
            </select>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Trading Symbol</label>
            <select name="symbol" value={form.symbol} onChange={handleChange} style={inputStyle}>
              <option value="BTCUSDT">BTCUSDT</option>
              <option value="ETHUSD">ETHUSD</option>
              <option value="NIFTY">NIFTY</option>
            </select>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Lookback Period</label>
            <input type="number" name="lookback" value={form.lookback} onChange={handleChange} style={inputStyle} min="1" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Quantity</label>
            <input type="number" name="qty" value={form.qty} onChange={handleChange} style={inputStyle} min="1" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Config JSON</label>
            <textarea name="config_json" value={form.config_json} onChange={handleChange}
              style={{ ...inputStyle, height: "80px", resize: "vertical", fontFamily: "'SF Mono', Consolas, monospace" }}
              placeholder='{"rr": 2, "sl_atr": 2.5}' />
          </div>
          <div style={{ ...rowStyle, marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Active</label>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
              <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Enable this strategy immediately</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" style={{
              background: "#3b82f6", color: "#fff",
              border: "none", borderRadius: "8px",
              padding: "10px 24px", cursor: "pointer",
              fontFamily: "Segoe UI, system-ui, sans-serif",
              fontSize: "14px", fontWeight: "600",
            }}>
              Create Strategy
            </button>
            <button type="button" onClick={() => navigate("/strategies")} style={{
              background: "transparent", color: "#cbd5e1",
              border: "1px solid #1e3a5f", borderRadius: "8px",
              padding: "10px 24px", cursor: "pointer",
              fontFamily: "Segoe UI, system-ui, sans-serif", fontSize: "14px",
            }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}