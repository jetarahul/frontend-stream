import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AboutMe from "./pages/AboutMe";
import DashboardPage from "./pages/DashboardPage";
import PortfolioPage from "./pages/PortfolioPage";
import OrdersPage from "./pages/OrdersPage";
import SignalDashboard from "./pages/SignalDashboard";
import StrategiesPage from "./pages/StrategiesPage";
import CreateStrategyPage from "./pages/CreateStrategyPage";
import EditStrategyPage from "./pages/EditStrategyPage";
import StrategyViewPage from "./pages/StrategyViewPage";
import LandingPage from "./pages/LandingPage";
import NotificationProvider from "./components/NotificationProvider";
import Navbar from "./components/Navbar";
import { logout } from "./services/auth";

function Layout({ userName, onLogout, children }) {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#0d1b2a",              // solid navy — same family as LandingPage, no decoration
      fontFamily: "Segoe UI, system-ui, sans-serif",
      color: "#e2e8f0",                   // high-contrast primary text
      margin: 0,
    }}>
      <Navbar onLogout={onLogout} />
      <div style={{
        paddingTop: "5rem",
        paddingLeft: "2rem",
        paddingRight: "2rem",
        paddingBottom: "3rem",
      }}>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const name = localStorage.getItem("userName");
    if (token) {
      setIsLoggedIn(true);
      setUserName(name || "Trader");
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    localStorage.removeItem("jwt");
    localStorage.removeItem("userName");
  };

  const W = ({ children }) => (
    <Layout userName={userName} onLogout={handleLogout}>
      {children}
    </Layout>
  );

  return (
    <Router>
      <NotificationProvider />
      {!isLoggedIn ? (
        <LandingPage
          onLogin={(name) => {
            setIsLoggedIn(true);
            setUserName(name);
            localStorage.setItem("userName", name);
          }}
        />
      ) : (
        <Routes>
          <Route path="/"                    element={<W><DashboardPage userName={userName} /></W>} />
          <Route path="/about"               element={<W><AboutMe /></W>} />
          <Route path="/portfolio"           element={<W><PortfolioPage /></W>} />
          <Route path="/orders"              element={<W><OrdersPage /></W>} />
          <Route path="/signals"             element={<W><SignalDashboard /></W>} />
          <Route path="/strategies"          element={<W><StrategiesPage /></W>} />
          <Route path="/create-strategy"     element={<W><CreateStrategyPage /></W>} />
          <Route path="/strategies/:id"      element={<W><StrategyViewPage /></W>} />
          <Route path="/strategies/edit/:id" element={<W><EditStrategyPage /></W>} />
        </Routes>
      )}
    </Router>
  );
}

export default App;