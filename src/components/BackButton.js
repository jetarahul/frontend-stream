import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "6px",
        padding: "6px 14px",
        cursor: "pointer",
        fontFamily: "Segoe UI, system-ui, sans-serif",
        fontSize: "13px",
        color: "#94a3b8",
        marginBottom: "1.5rem",
        fontWeight: "500",
      }}
    >
      ← Back
    </button>
  );
}