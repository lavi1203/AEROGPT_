import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";

import Home from "./components/Home";
import Classifier from "./components/Classifier";
import PYQLibrary from "./components/PYQLibrary";
import AeroBot from "./components/AeroBot";
import MissionExplorer from "./components/MissionExplorer";
import CareersPortal from "./components/CareersPortal";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  // ✅ Load user from localStorage on first load
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showAuth, setShowAuth] = useState(false);

  // ✅ Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home setActiveTab={setActiveTab} />;
      case "classifier":
        return <Classifier />;
      case "pyq":
        return <PYQLibrary />;
      case "chat":
        return <AeroBot />;
      case "missions":
        return <MissionExplorer />;
      case "careers":
        return <CareersPortal />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div
          className="brand"
          onClick={() => setActiveTab("home")}
          style={{ cursor: "pointer" }}
        >
          Aero<span>GPT</span>
        </div>

        <div className="nav-links">
          <div
            className={`nav-link ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Home
          </div>

          <div
            className={`nav-link ${activeTab === "classifier" ? "active" : ""}`}
            onClick={() => setActiveTab("classifier")}
          >
            Classifier
          </div>

          <div
            className={`nav-link ${activeTab === "pyq" ? "active" : ""}`}
            onClick={() => setActiveTab("pyq")}
          >
            PYQ Library
          </div>

          <div
            className={`nav-link ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            AeroBot
          </div>

          <div
            className={`nav-link ${activeTab === "missions" ? "active" : ""}`}
            onClick={() => setActiveTab("missions")}
          >
            Missions
          </div>

          <div
            className={`nav-link ${activeTab === "careers" ? "active" : ""}`}
            onClick={() => setActiveTab("careers")}
          >
            Careers
          </div>
        </div>

        {/* AUTH SECTION */}
        <div className="auth-section">
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--accent-amber)",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {user.name.charAt(0)}
                </div>
                <span>{user.name}</span>
              </div>

              <button
                className="glass-button"
                onClick={() => setUser(null)}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="glass-button" onClick={() => setShowAuth(true)}>
              <User
                size={16}
                style={{ marginRight: "6px", verticalAlign: "middle" }}
              />
              Login
            </button>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">{renderContent()}</main>

      {/* AUTH MODAL */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(data) => setUser(data)}
        />
      )}
    </div>
  );
}