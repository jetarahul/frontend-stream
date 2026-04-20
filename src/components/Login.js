import React, { useState } from "react";
import { loginWithGoogle, logout } from "../services/auth";

export default function Login({ onLoginSuccess }) {
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const loggedInUser = await loginWithGoogle();
      setUser(loggedInUser);

      const name = loggedInUser.displayName || loggedInUser.email || "Trader";
      localStorage.setItem("userName", name);

      if (onLoginSuccess) onLoginSuccess(name);
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    window.location.reload();
  };

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.displayName || user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "12px 24px",
            fontSize: "1rem",
            fontWeight: "500",
            borderRadius: "8px",
            border: "1px solid #dadce0",
            backgroundColor: "#fff",
            color: "#3c4043",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            margin: "0 auto",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#f8f9fa")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#fff")
          }
        >
          {/* Google logo inline SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20px"
            height="20px"
          >
            <path
              fill="#4285F4"
              d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.4-6.4C35.6 2.9 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.5 5.8C12.1 13.1 17.6 9.5 24 9.5z"
            />
            <path
              fill="#34A853"
              d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.4 5.6-5.1 7.3l7.5 5.8c4.4-4.1 7.4-10.1 7.4-17.6z"
            />
            <path
              fill="#FBBC05"
              d="M10 28.9c-1.2-3.5-1.2-7.3 0-10.8l-7.5-5.8C.9 16.1 0 20 0 24s.9 7.9 2.5 11.6l7.5-6.7z"
            />
            <path
              fill="#EA4335"
              d="M24 48c6.1 0 11.2-2 14.9-5.4l-7.5-5.8c-2.1 1.4-4.7 2.2-7.4 2.2-6.4 0-11.9-4.3-13.9-10.2l-7.5 6.7C6.4 42.6 14.6 48 24 48z"
            />
          </svg>
          Sign in with Google
        </button>
      )}
    </div>
  );
}
