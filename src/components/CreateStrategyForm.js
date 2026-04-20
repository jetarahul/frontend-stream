import { useState } from "react";
import api from "../services/api";

export default function CreateStrategyPage() {
  const [form, setForm] = useState({
    name: "",
    pattern_type: "",
    symbol: "BTCUSDT",
    lookback: 5,
    qty: 1,
    config_json: "{}",
    is_active: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Parse config_json string into object
      const payload = {
        ...form,
        config_json: JSON.parse(form.config_json)
      };
      await api.post("/strategy/create", payload);
      alert("Strategy created successfully!");
      setForm({
        name: "",
        pattern_type: "",
        symbol: "BTCUSDT",
        lookback: 5,
        qty: 1,
        config_json: "{}",
        is_active: true
      });
    } catch (err) {
      console.error("Error creating strategy:", err);
      alert("Failed to create strategy");
    }
  };

  return (
    <div>
      <h2>Create Strategy</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Pattern Type:</label>
          <input name="pattern_type" value={form.pattern_type} onChange={handleChange} required />
        </div>
        <div>
          <label>Symbol:</label>
          <input name="symbol" value={form.symbol} onChange={handleChange} />
        </div>
        <div>
          <label>Lookback:</label>
          <input type="number" name="lookback" value={form.lookback} onChange={handleChange} />
        </div>
        <div>
          <label>Quantity:</label>
          <input type="number" name="qty" value={form.qty} onChange={handleChange} />
        </div>
        <div>
          <label>Config JSON:</label>
          <textarea name="config_json" value={form.config_json} onChange={handleChange} />
        </div>
        <div>
          <label>Active:</label>
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
        </div>
        <button type="submit">Create Strategy</button>
      </form>
    </div>
  );
}
