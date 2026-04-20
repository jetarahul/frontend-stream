import { Link, useLocation } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const location = useLocation();

  const linkStyle = (path) => {
    const active = location.pathname === path;
    return {
      marginRight: "1.75rem",
      color: active ? "#f1f5f9" : "#94a3b8",
      textDecoration: "none",
      fontWeight: active ? "700" : "500",
      fontSize: "14px",
      borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
      paddingBottom: "4px",
      letterSpacing: "0.01em",
      transition: "color 0.15s",
    };
  };

  return (
    <nav style={{
      padding: "0 2rem",
      paddingRight: "3rem",
      height: "56px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "fixed",
      top: 0, left: 0,
      width: "100%",
      boxSizing: "border-box",
      // Solid navy with slight transparency + blur for depth — reads clean on the new #0d1b2a shell
      backgroundColor: "rgba(13,27,42,0.85)",
      borderBottom: "1px solid #1e3a5f",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "2rem" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "6px",
          background: "linear-gradient(135deg, #3b82f6, #10b981)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px",
        }}>⚡</div>
        <span style={{ fontWeight: "700", fontSize: "14px", color: "#f1f5f9", letterSpacing: "-0.01em" }}>
          AlgoTrader <span style={{ color: "#3b82f6" }}>Pro</span>
        </span>
      </div>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        <Link to="/about"      style={linkStyle("/about")}>About Me</Link>
        <Link to="/"           style={linkStyle("/")}>Dashboard</Link>
        <Link to="/portfolio"  style={linkStyle("/portfolio")}>Portfolio</Link>
        <Link to="/orders"     style={linkStyle("/orders")}>Orders</Link>
        <Link to="/signals"    style={linkStyle("/signals")}>Signals</Link>
        <Link to="/strategies" style={linkStyle("/strategies")}>Strategies</Link>
      </div>

      {/* Logout */}
      <button onClick={onLogout} style={{
        background: "rgba(59,130,246,0.12)",
        color: "#93c5fd",
        border: "1px solid rgba(59,130,246,0.3)",
        borderRadius: "6px",
        padding: "7px 16px",
        cursor: "pointer",
        fontFamily: "Segoe UI, system-ui, sans-serif",
        fontSize: "13px",
        fontWeight: "600",
        transition: "background 0.15s",
      }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.12)"}
      >
        Logout
      </button>
    </nav>
  );
}