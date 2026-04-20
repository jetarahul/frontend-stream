import React from "react";

export default function SignalCard({ signal }) {
  const getColor = (type) => {
    switch (type) {
      case "BUY":
        return "green";
      case "SELL":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "#f9f9f9"
      }}
    >
      <h3 style={{ color: getColor(signal.type) }}>
        {signal.type} — {signal.symbol}
      </h3>
      <p>Strategy: {signal.strategy_id}</p>
      <p>Timestamp: {new Date(signal.timestamp).toLocaleString()}</p>
      <p>Confidence: {signal.confidence}%</p>
    </div>
  );
}
