import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function EditStrategyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/strategy/${id}`)
      .then((res) => {
        if (res.data.strategy) setForm(res.data.strategy);
        else alert("Strategy not found");
      })
      .catch(() => alert("Failed to load strategy."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: "#94a3b8", padding: "20px" }}>Loading strategy...</p>;
  if (!form) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/strategy/edit/${id}`, form);
      alert("Strategy updated successfully!");
      navigate("/strategies");
    } catch (err) {
      console.error("Error updating strategy:", err);
      alert("Failed to update strategy");
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "640px", textAlign: "left" }}>
      <BackButton />

      <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", marginBottom: "6px", letterSpacing: "-0.01em" }}>
        Edit Strategy
      </h1>
      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "2rem" }}>
        Editing: <span style={{ color: "#60a5fa", fontWeight: "600" }}>{form.name}</span>
      </p>

      <div style={{
        background: "#11243a",
        border: "1px solid #1e3a5f",
        borderRadius: "10px", padding: "2rem",
      }}>
        <form onSubmit={handleSubmit}>
          <div style={rowStyle}>
            <label style={labelStyle}>Strategy Name</label>
            <input name="name" value={form.name} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Pattern Type</label>
            <select name="pattern_type" value={form.pattern_type} onChange={handleChange} style={inputStyle}>
              <option value="W_PATTERN">W Pattern</option>
              <option value="EMA_CROSS">EMA Cross</option>
              <option value="S_R_BREAK">S/R Breakout</option>
            </select>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Symbol</label>
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
          <div style={{ ...rowStyle, marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Active</label>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
              <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Strategy is active</span>
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
              Save Changes
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