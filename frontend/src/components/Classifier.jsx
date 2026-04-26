import React, { useState } from "react";
import { Brain, BarChart2, AlertCircle } from "lucide-react";

export default function Classifier() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClassify = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server error");
      }

      setResult(data);
    } catch (err) {
      setError("Backend not reachable. Please start FastAPI backend.");
    }

    setLoading(false);
  };

  return (
    <div>
      {/* Heading */}
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
          <Brain color="var(--accent-blue)" />
          Question Classifier
        </h2>

        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          Enter any ISRO SC aerospace question and predict its difficulty.
        </p>
      </div>

      {/* Input Box */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          style={{
            width: "100%",
            minHeight: "150px",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid var(--border-color)",
            background: "rgba(0,0,0,0.35)",
            color: "white",
            outline: "none",
            resize: "vertical",
          }}
        />

        <button
          className="btn-primary"
          onClick={handleClassify}
          disabled={loading}
          style={{ marginTop: "1rem" }}
        >
          {loading ? "Classifying..." : "Classify Difficulty"}
        </button>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "10px",
              borderRadius: "10px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div
          className="glass-panel"
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
          }}
        >
          <h3
            className="orbitron"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "1.4rem",
              marginBottom: "1rem",
            }}
          >
            <BarChart2 color="var(--accent-green)" />
            Result
          </h3>

          <p style={{ fontSize: "1.1rem" }}>
            <strong>Difficulty:</strong>{" "}
            <span style={{ color: "var(--accent-amber)" }}>
              {result.difficulty}
            </span>
          </p>



          {result.model_used && (
            <p style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
              <strong>Model:</strong> {result.model_used}
            </p>
          )}

          {result.reason && (
            <p style={{ marginTop: "1rem", lineHeight: "1.6" }}>
              <strong>Reason:</strong> {result.reason}
            </p>
          )}

          {result.similar_questions && result.similar_questions.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <strong style={{ color: "var(--accent-blue)" }}>Similar Questions Found:</strong>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem", color: "var(--text-secondary)" }}>
                {result.similar_questions.map((q, idx) => (
                  <li key={idx} style={{ marginBottom: "0.5rem" }}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}