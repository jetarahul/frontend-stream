import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";

const TICK_URL = "https://tick-ingestion-820892686232.us-central1.run.app/stream";

const card = {
  background: "#11243a",
  border: "1px solid #1e3a5f",
  borderRadius: "10px",
};

const sectionLabel = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: "14px",
};

// Map order symbols (e.g. BTCUSDT) to live tick-stream symbols (e.g. BTCUSD).
const toTickSymbol = (sym) => {
  if (!sym) return sym;
  const map = { BTCUSDT: "BTCUSD", ETHUSDT: "ETHUSD" };
  return map[sym] || sym;
};

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
};

/**
 * FIFO P&L calculation for a single symbol.
 * Walks all fills chronologically. BUY adds a lot; SELL closes oldest lots first
 * and realizes (sell_price - buy_price) * matched_qty.
 * Leftover lots = current open position, with weighted-avg cost basis.
 */
const computeFifoPnl = (fillsForSymbol) => {
  const sorted = [...fillsForSymbol].sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return ta - tb;
  });

  const openLots = [];
  let realizedPnl = 0;
  let fillCount = 0;

  sorted.forEach((f) => {
    const side = f.side?.toUpperCase();
    const qty = f.fill_qty;
    const price = f.fill_price;
    fillCount += 1;

    if (side === "BUY") {
      openLots.push({ qty, price });
    } else if (side === "SELL") {
      let remaining = qty;
      while (remaining > 0 && openLots.length > 0) {
        const lot = openLots[0];
        const matched = Math.min(remaining, lot.qty);
        realizedPnl += (price - lot.price) * matched;
        lot.qty -= matched;
        remaining -= matched;
        if (lot.qty === 0) openLots.shift();
      }
    }
  });

  const openQty = openLots.reduce((s, l) => s + l.qty, 0);
  const openCost = openLots.reduce((s, l) => s + l.qty * l.price, 0);
  const avgPrice = openQty > 0 ? openCost / openQty : null;

  return { realizedPnl, openQty, avgPrice, fillCount };
};

export default function PortfolioPage() {
  const [positions, setPositions] = useState([]);
  const [lifetimeRealized, setLifetimeRealized] = useState(0);
  const [totalTradesExecuted, setTotalTradesExecuted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live prices from SSE — keyed by tick-stream symbol
  const [livePrices, setLivePrices] = useState({});
  const esRef = useRef(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const [ordersRes, fillsRes] = await Promise.all([
          api.get("/orders"),
          api.get("/fills"),
        ]);

        const orders = extractArray(ordersRes.data);
        const fills = extractArray(fillsRes.data);

        // Index orders so we can look up side/symbol by order_id
        const orderById = {};
        orders.forEach((o) => {
          orderById[o.order_id] = o;
        });

        // Group fills by symbol
        const fillsBySymbol = {};
        fills.forEach((f) => {
          const order = orderById[f.order_id];
          if (!order) return;
          const sym = order.symbol;
          if (!fillsBySymbol[sym]) fillsBySymbol[sym] = [];
          fillsBySymbol[sym].push({ ...f, side: order.side, symbol: sym });
        });

        let lifetimeTotal = 0;
        let totalFillCount = 0;
        const result = [];

        Object.entries(fillsBySymbol).forEach(([sym, symFills]) => {
          const { realizedPnl, openQty, avgPrice, fillCount } = computeFifoPnl(symFills);
          lifetimeTotal += realizedPnl;
          totalFillCount += fillCount;

          // Only keep symbols with an open position for the table.
          // Closed symbols still count in lifetimeRealized and totalTradesExecuted.
          if (openQty > 0) {
            result.push({
              symbol: sym,
              quantity: openQty,
              avg_price: avgPrice,
              realizedPnl,
              fillCount,
            });
          }
        });

        setPositions(result);
        setLifetimeRealized(lifetimeTotal);
        setTotalTradesExecuted(totalFillCount);
        setError(null);
      } catch (err) {
        setError("Failed to load portfolio data.");
        console.error("PORTFOLIO ERROR:", err.message, err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // SSE tick stream for live prices
  useEffect(() => {
    esRef.current = new EventSource(TICK_URL);
    esRef.current.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (!d.symbol || d.mark_price == null) return;
        setLivePrices((prev) => {
          if (prev[d.symbol] === d.mark_price) return prev;
          return { ...prev, [d.symbol]: parseFloat(d.mark_price) };
        });
      } catch {}
    };
    return () => esRef.current?.close();
  }, []);

  // Enrich open positions with current price + unrealized P&L
  const enriched = positions.map((p) => {
    const tickSym = toTickSymbol(p.symbol);
    const currentPrice = livePrices[tickSym] ?? null;
    const unrealizedPnl =
      currentPrice !== null && p.avg_price !== null
        ? (currentPrice - p.avg_price) * p.quantity
        : null;

    return { ...p, currentPrice, unrealizedPnl };
  });

  // Summary Total P&L = lifetime realized + live unrealized from current open positions
  const totalUnrealized = enriched.reduce((s, p) => s + (p.unrealizedPnl || 0), 0);
  const totalPnl = lifetimeRealized + totalUnrealized;

  const fmtUsd = (n) =>
    n === null || n === undefined || Number.isNaN(n)
      ? "—"
      : `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  const fmtSigned = (n) => {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    const sign = n >= 0 ? "+" : "-";
    return `${sign}$${Math.abs(n).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const pnlBadge = (value) => {
    if (value === null || value === undefined) {
      return {
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700",
        fontFamily: "'SF Mono', Consolas, monospace",
        background: "rgba(148,163,184,0.08)",
        color: "#94a3b8",
        border: "1px solid rgba(148,163,184,0.2)",
      };
    }

    const positive = value >= 0;
    return {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "700",
      fontFamily: "'SF Mono', Consolas, monospace",
      background: positive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
      color: positive ? "#34d399" : "#f87171",
      border: `1px solid ${
        positive ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"
      }`,
    };
  };

  return (
    <div style={{ width: "100%", textAlign: "left", maxWidth: "1400px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#f1f5f9",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Portfolio
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
          Positions and P&L computed from your executed trades
        </p>
      </div>

      {loading && <p style={{ color: "#94a3b8" }}>Loading portfolio...</p>}

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "#fca5a5",
            fontSize: "13px",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <p style={sectionLabel}>Summary</p>
          <div style={{ display: "flex", gap: "12px", marginBottom: "2rem", flexWrap: "wrap" }}>
            {[
              { label: "Total Trades Executed", value: totalTradesExecuted, color: "#f1f5f9" },
              { label: "Open Positions", value: enriched.length, color: "#60a5fa" },
              {
                label: "Total P&L",
                value: fmtSigned(totalPnl),
                color: totalPnl >= 0 ? "#34d399" : "#f87171",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  ...card,
                  textAlign: "center",
                  minWidth: "160px",
                  flex: 1,
                  padding: "18px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: "600",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: s.color,
                    fontFamily: "'SF Mono', Consolas, monospace",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && enriched.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#f1f5f9",
              marginBottom: "8px",
            }}
          >
            Portfolio is empty
          </div>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
            Positions will appear here once the broker executes your orders.
          </div>
        </div>
      )}

      {enriched.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <p style={{ ...sectionLabel, marginBottom: 0 }}>Open Positions</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: Object.keys(livePrices).length > 0 ? "#10b981" : "#64748b",
                  boxShadow:
                    Object.keys(livePrices).length > 0 ? "0 0 6px #10b981" : "none",
                }}
              />
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                {Object.keys(livePrices).length > 0
                  ? "Live prices streaming"
                  : "Connecting to price feed..."}
              </span>
            </div>
          </div>

          <div style={{ ...card, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f2035", borderBottom: "1px solid #1e3a5f" }}>
                  {[
                    { label: "Symbol" },
                    { label: "Quantity" },
                    { label: "Avg Price" },
                    { label: "Current Price" },
                    { label: "Executions" },
                    {
                      label: "Unrealized P&L",
                      tooltip: "(Current Price − Avg Price) × Quantity",
                    },
                    {
                      label: "Realized P&L",
                      tooltip: "FIFO-matched P&L from closed portions of this position",
                    },
                  ].map((h) => (
                    <th
                      key={h.label}
                      title={h.tooltip || ""}
                      style={{
                        padding: "12px 18px",
                        textAlign: "left",
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        cursor: h.tooltip ? "help" : "default",
                        borderBottom: h.tooltip ? "1px dotted #475569" : "none",
                      }}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.map((p, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < enriched.length - 1 ? "1px solid #1e3a5f" : "none",
                    }}
                  >
                    <td style={{ padding: "14px 18px", fontWeight: "700", color: "#f1f5f9" }}>
                      {p.symbol}
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        color: "#cbd5e1",
                        fontFamily: "'SF Mono', Consolas, monospace",
                      }}
                    >
                      {p.quantity}
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        color: "#cbd5e1",
                        fontFamily: "'SF Mono', Consolas, monospace",
                      }}
                    >
                      {p.avg_price !== null ? fmtUsd(p.avg_price) : "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        color: p.currentPrice !== null ? "#f1f5f9" : "#64748b",
                        fontFamily: "'SF Mono', Consolas, monospace",
                        fontWeight: p.currentPrice !== null ? "600" : "400",
                      }}
                    >
                      {p.currentPrice !== null ? fmtUsd(p.currentPrice) : "—"}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#cbd5e1" }}>{p.fillCount}</td>
                    <td
                      style={{ padding: "14px 18px" }}
                      title={
                        p.unrealizedPnl !== null &&
                        p.avg_price !== null &&
                        p.currentPrice !== null
                          ? `(${fmtUsd(p.currentPrice)} − ${fmtUsd(p.avg_price)}) × ${p.quantity} = ${fmtSigned(p.unrealizedPnl)}`
                          : "Waiting for live price..."
                      }
                    >
                      <span style={pnlBadge(p.unrealizedPnl)}>
                        {p.unrealizedPnl === null ? "—" : fmtSigned(p.unrealizedPnl)}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={pnlBadge(p.realizedPnl)}>{fmtSigned(p.realizedPnl)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            style={{
              color: "#64748b",
              fontSize: "12px",
              marginTop: "10px",
              fontStyle: "italic",
            }}
          >
            Hover any <span style={{ borderBottom: "1px dotted #64748b" }}>dotted</span> column
            header for the formula. Unrealized P&L updates live with market ticks.
          </p>
        </>
      )}
    </div>
  );
}