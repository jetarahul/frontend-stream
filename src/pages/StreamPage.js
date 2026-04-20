import React from "react";
import LiveData from "./LiveData";
import PlacedOrders from "./PlacedOrders";

const sectionLabel = {
  fontSize: "11px", fontWeight: "700", color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px",
};

export default function StreamPage() {
  return (
    <div style={{ width: "100%", textAlign: "left", maxWidth: "1400px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>
          Live Stream
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
          Real-time market data and placed orders
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <p style={sectionLabel}>Live Prices</p>
        <LiveData />
      </div>

      <div>
        <p style={sectionLabel}>Placed Orders</p>
        <PlacedOrders />
      </div>
    </div>
  );
}