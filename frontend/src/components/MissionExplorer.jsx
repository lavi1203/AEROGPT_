import React, { useState, useMemo } from "react";
import { Rocket, X, Search, Filter } from "lucide-react";
import { MISSIONS } from "../data/missions";

export default function MissionExplorer() {
  const [selectedMission, setSelectedMission] = useState(null);
  const [search, setSearch] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("All");

  // 🔍 FILTER + SEARCH LOGIC
  const filteredMissions = useMemo(() => {
    return MISSIONS.filter((mission) => {
      const matchSearch =
        mission.name.toLowerCase().includes(search.toLowerCase()) ||
        mission.agency.toLowerCase().includes(search.toLowerCase()) ||
        (mission.summary || "").toLowerCase().includes(search.toLowerCase());

      const matchAgency =
        agencyFilter === "All" || mission.agency === agencyFilter;

      return matchSearch && matchAgency;
    });
  }, [search, agencyFilter]);

  return (
    <div>
      {/* 🔥 HEADER */}
      <div style={{ marginBottom: "2rem" }}>
        <h2
          className="orbitron"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "2rem",
          }}
        >
          <Rocket color="var(--accent-red)" />
          Mission Explorer
        </h2>

        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          Explore key facts about top ISRO and NASA missions.
        </p>

        {/* 🔍 SEARCH + FILTER BAR */}
        <div
          className="glass-panel"
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            padding: "1rem",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div
            style={{
              flex: 1,
              minWidth: "250px",
              position: "relative",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                top: "11px",
                left: "12px",
                color: "var(--text-secondary)",
              }}
            />

            <input
              type="text"
              placeholder="Search missions (e.g., Chandrayaan, Apollo...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                borderRadius: "10px",
                background: "rgba(0,0,0,0.35)",
                border: "1px solid var(--border-color)",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          {/* Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              padding: "6px",
            }}
          >
            <Filter size={16} style={{ opacity: 0.7 }} />

            {["All", "ISRO", "NASA"].map((agency) => (
              <button
                key={agency}
                onClick={() => setAgencyFilter(agency)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  background:
                    agencyFilter === agency
                      ? "rgba(255,255,255,0.12)"
                      : "transparent",
                  color:
                    agencyFilter === agency
                      ? "white"
                      : "var(--text-secondary)",
                }}
              >
                {agency}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 RESULTS COUNT */}
      <div style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
        Showing {filteredMissions.length} missions
      </div>

      {/* 🚀 MISSION GRID */}
      <div className="mission-grid">
        {filteredMissions.map((mission, idx) => {
          const colors = [
            "var(--accent-amber)",
            "var(--accent-blue)",
            "var(--accent-green)",
            "var(--accent-red)",
          ];

          const accentColor = colors[idx % colors.length];

          return (
            <div
              key={mission.id}
              className="glass-panel feature-card"
              style={{
                padding: "1.5rem",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              onClick={() => setSelectedMission(mission)}
            >
              {/* Top Accent Bar */}
              <div
                style={{
                  height: "4px",
                  background: accentColor,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <Rocket size={24} color={accentColor} />

                <span
                  className="badge"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                  }}
                >
                  {mission.agency}
                </span>
              </div>

              <h3 className="orbitron" style={{ marginBottom: "0.5rem" }}>
                {mission.name}
              </h3>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {mission.summary}
              </p>
            </div>
          );
        })}
      </div>

      {/* ❌ NO RESULTS */}
      {filteredMissions.length === 0 && (
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginTop: "2rem",
          }}
        >
          No missions found 😔
        </p>
      )}

      {/* 🧊 MODAL */}
      {selectedMission && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMission(null)}
        >
          <div
            className="glass-panel modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "650px",
              width: "90%",
              padding: "2rem",
              borderRadius: "18px",
              position: "relative",
            }}
          >
            {/* Close Button */}
            <button
              className="modal-close glass-button"
              onClick={() => setSelectedMission(null)}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                padding: "8px",
                borderRadius: "12px",
              }}
            >
              <X size={20} />
            </button>

            {/* Title */}
            <h2 className="orbitron" style={{ fontSize: "1.8rem" }}>
              {selectedMission.name}
            </h2>

            <p style={{ color: "var(--text-secondary)", marginTop: "0.8rem" }}>
              {selectedMission.summary}
            </p>

            {/* Info Grid */}
            <div
              style={{
                display: "grid",
                gap: "1rem",
                marginTop: "1.5rem",
                padding: "1rem",
                borderRadius: "12px",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div>
                <strong>Agency:</strong>{" "}
                {selectedMission.agency || "Not Available"}
              </div>

              <div>
                <strong>Launch Date:</strong>{" "}
                {selectedMission.launchDate || "Not Available"}
              </div>

              <div>
                <strong>Vehicle:</strong>{" "}
                {selectedMission.vehicle || "Not Available"}
              </div>

              <div>
                <strong>Objective:</strong>{" "}
                {selectedMission.objective || "Not Available"}
              </div>
            </div>

            {/* Details */}
            <p
              style={{
                color: "var(--text-secondary)",
                marginTop: "1.5rem",
                lineHeight: "1.7",
              }}
            >
              {selectedMission.details || "No detailed information available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}