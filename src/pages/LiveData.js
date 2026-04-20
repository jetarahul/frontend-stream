import { useEffect, useState } from "react";

const card = {
  background: "#11243a",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
};

export default function LiveData() {
  const [btc, setBtc] = useState(null);
  const [eth, setEth] = useState(null);
  const [prevBtc, setPrevBtc] = useState(null);
  const [prevEth, setPrevEth] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource("https://tick-ingestion-820892686232.us-central1.run.app/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.symbol === "BTCUSD") {
          setBtc((prev) => { setPrevBtc(prev); return data.mark_price; });
        } else if (data.symbol === "ETHUSD") {
          setEth((prev) => { setPrevEth(prev); return data.mark_price; });
        }
      } catch (err) {
        console.error("Error parsing tick:", err);
      }
    };

    return () => eventSource.close();
  }, []);

  const priceColor = (c, p) => !c || !p ? "#f1f5f9" : c > p ? "#34d399" : c < p ? "#f87171" : "#f1f5f9";
  const arrow = (c, p) => !c || !p ? "" : c > p ? " ▲" : c < p ? " ▼" : "";

  const tickerCard = (sym, curr, prev) => (
    <div style={{ ...card, minWidth: "220px", flex: 1, padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.08em" }}>{sym}</span>
        <span style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: curr ? "#10b981" : "#64748b",
          boxShadow: curr ? "0 0 8px #10b981" : "none",
          display: "inline-block",
        }} />
      </div>
      <div style={{
        fontSize: "30px", fontWeight: "700",
        fontFamily: "'SF Mono', Consolas, monospace",
        color: priceColor(curr, prev), letterSpacing: "-0.02em",
      }}>
        {curr ? `$${parseFloat(curr).toFixed(2)}${arrow(curr, prev)}` : "Connecting..."}
      </div>
      {prev && (
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
          prev: ${parseFloat(prev).toFixed(2)}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      {tickerCard("BTCUSD", btc, prevBtc)}
      {tickerCard("ETHUSD", eth, prevEth)}
    </div>
  );
}