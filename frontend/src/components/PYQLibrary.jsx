import React, { useState, useMemo, useEffect } from "react";
import { Search, CheckCircle2, Library } from "lucide-react";
import { QUESTIONS } from "../data/questions";

export default function PYQLibrary() {

  const [searchTerm, setSearchTerm] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [page, setPage] = useState(1);

  const itemsPerPage = 15;

  const [selectedAns, setSelectedAns] = useState({});
  const [submitted, setSubmitted] = useState(new Set());

  // select answer
  const handleSelect = (qNo, key) => {
    if (submitted.has(qNo)) return;

    setSelectedAns((prev) => ({
      ...prev,
      [qNo]: key,
    }));
  };

  // submit
  const handleSubmit = (qNo) => {
    if (!selectedAns[qNo]) return;

    setSubmitted((prev) => new Set(prev).add(qNo));
  };

  // reset on filter change
  useEffect(() => {
    setSelectedAns({});
    setSubmitted(new Set());
    setPage(1);
  }, [searchTerm, diffFilter, yearFilter]);

  // filtering
  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter((q) => {
      const text = (
        q.q +
        " " +
        q.subj +
        " " +
        q.sub +
        " " +
        q.a +
        " " +
        q.b +
        " " +
        q.c +
        " " +
        q.d +
        " " +
        q.year +
        " " +
        q.diff
      ).toLowerCase();

      const matchSearch = text.includes(searchTerm.toLowerCase());

      const matchDiff =
        diffFilter === "All" || q.diff === diffFilter;

      const matchYear =
        yearFilter === "All" || String(q.year) === yearFilter;

      return matchSearch && matchDiff && matchYear;
    });
  }, [searchTerm, diffFilter, yearFilter]);

  // pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentItems = filteredQuestions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // years
  const years = [
    "All",
    ...Array.from(new Set(QUESTIONS.map((q) => String(q.year || ""))))
      .filter(Boolean)
      .sort(),
  ];

  const changeFilter = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  return (
    <div>

      {/* HEADER */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="orbitron" style={{ display: "flex", gap: 10 }}>
          <Library color="var(--accent-amber)" />
          PYQ Library
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Browse {QUESTIONS.length} ISRO Questions
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="filters glass-panel">

        {/* SEARCH */}
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions, subject, topic..."
            className="search-input"
          />

          {searchTerm && (
            <button
              className="clear-btn"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* YEAR */}
        <select
          className="filter-select"
          value={yearFilter}
          onChange={(e) => changeFilter(setYearFilter)(e.target.value)}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y === "All" ? "All Years" : y}
            </option>
          ))}
        </select>

        {/* DIFFICULTY */}
        <div className="diff-buttons">
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              className={`diff-btn ${diffFilter === d ? "active" : ""}`}
              onClick={() => changeFilter(setDiffFilter)(d)}
            >
              {d}
            </button>
          ))}
        </div>

      </div>

      {/* RESULT COUNT */}
      <div style={{ marginBottom: "1rem", opacity: 0.7 }}>
        Showing {filteredQuestions.length} results
      </div>

      {/* QUESTIONS */}
      <div className="pyq-grid">

        {currentItems.map((q) => {

          const correctKey = String(q.ans).toLowerCase();
          const isSubmitted = submitted.has(q.no);
          const selected = selectedAns[q.no];

          return (
            <div key={q.no} className="glass-panel pyq-card">

              {/* HEADER */}
              <div className="pyq-header">
                <span className="q-no">Q{q.no}</span>

                <div className="tags">
                  <span className="tag subject">{q.subj}</span>
                  <span className="tag sub">{q.sub}</span>
                </div>

                <span className={`tag diff ${q.diff.toLowerCase()}`}>
                  {q.diff}
                </span>
              </div>

              {/* QUESTION */}
              <p className="question">{q.q}</p>

              {/* OPTIONS */}
              <div className="pyq-options">
                {["a", "b", "c", "d"].map((key) => {
                  if (!q[key]) return null;

                  const isSelected = selected === key;
                  const isCorrect = key === correctKey;

                  let className = "pyq-option";

                  if (isSubmitted) {
                    if (isCorrect) className += " correct";
                    else if (isSelected) className += " wrong";
                  } else if (isSelected) {
                    className += " selected";
                  }

                  return (
                    <div
                      key={key}
                      className={className}
                      onClick={() => handleSelect(q.no, key)}
                    >
                      <b>{key.toUpperCase()}.</b> {q[key]}

                      {isSubmitted && isCorrect && (
                        <CheckCircle2 size={16} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* SUBMIT */}
              {!isSubmitted && (
                <button
                  className="submit-btn"
                  onClick={() => handleSubmit(q.no)}
                >
                  Submit Answer
                </button>
              )}

              {/* RESULT */}
              {isSubmitted && (
                <div className="answer">
                  ✅ Correct: {correctKey.toUpperCase()}. {q[correctKey]}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}