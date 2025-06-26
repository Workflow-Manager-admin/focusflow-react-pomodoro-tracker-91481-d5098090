import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Simple Modal Component
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div>{children}</div>
        <div className="modal-actions">
          <button className="primary-btn" onClick={onClose} autoFocus>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Pomodoro state machine, timers, and durations (same logic as before)
  const MODES = [
    { key: "pomodoro", label: "Pomodoro" },
    { key: "short_break", label: "Short Break" },
    { key: "long_break", label: "Long Break" },
  ];
  const DEFAULT_DURATIONS = { pomodoro: 25, short_break: 5, long_break: 15 };
  const [mode, setMode] = useState("pomodoro");
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS[mode] * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionNum, setSessionNum] = useState(1);
  const [modalInfo, setModalInfo] = useState({ open: false, title: "", message: "" });
  const timerRef = useRef(null);

  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          handleSessionEnd();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => { setTimeLeft(durations[mode] * 60); }, [mode, durations]);

  function handleStart() { if (timeLeft <= 0) setTimeLeft(durations[mode] * 60); setTimerActive(true); }
  function handlePause() { setTimerActive(false); }
  function handleReset() { setTimerActive(false); setTimeLeft(durations[mode] * 60); }
  function handleSessionEnd() {
    if (mode === "pomodoro") setSessionNum((n) => n + 1);
    setMode(
      mode === "pomodoro"
        ? ((sessionNum + 1) % 4 === 0 ? "long_break" : "short_break")
        : "pomodoro"
    );
  }
  function switchMode(newMode) { setMode(newMode); setTimerActive(false); }
  function formatTime(sec) {
    const m = String(Math.floor(Math.abs(sec) / 60)).padStart(2, "0");
    const s = String(Math.abs(sec) % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  // ---- Demo static tasks ----
  const TASKS = [
    { text: "Finish UI Overhaul" },
    { text: "Write summary report" },
    { text: "Review PRs" },
  ];

  // Modal open helpers
  function showComingSoonModal(feature) {
    setModalInfo({
      open: true,
      title: `${feature} Coming Soon!`,
      message: `This feature is not yet available. Please check back in a future update.`,
    });
  }

  // "Visit site" action
  function handleVisitSite(e) {
    e.preventDefault();
    window.open("https://placeholder-website.com", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="app-root">
      {/* Modals */}
      <Modal
        open={modalInfo.open}
        onClose={() => setModalInfo({ ...modalInfo, open: false })}
        title={modalInfo.title}
      >
        <div>{modalInfo.message}</div>
      </Modal>

      {/* Header */}
      <header className="main-navbar">
        <span className="logo">Pomofocus</span>
        <div className="icon-btn-group">
          <button
            className="icon-btn"
            aria-label="Reports"
            onClick={() => showComingSoonModal("Reports")}
          >
            <span role="img" aria-label="bar-chart">📊</span> Report
          </button>
          <button
            className="icon-btn"
            aria-label="Settings"
            onClick={() => showComingSoonModal("Settings")}
          >
            <span role="img" aria-label="gear">⚙️</span> Setting
          </button>
          <button
            className="icon-btn"
            aria-label="Sign In"
            onClick={() => showComingSoonModal("Sign In")}
          >
            <span role="img" aria-label="person">👤</span> Sign In
          </button>
        </div>
      </header>
      <main className="main-content">
        <section className="timer-card">
          {/* Tabs */}
          <div className="mode-tabs">
            {MODES.map((m) => (
              <button
                key={m.key}
                className={`tab-pill${mode === m.key ? " active" : ""}`}
                onClick={() => switchMode(m.key)}
                aria-label={m.label}
                tabIndex="0"
              >
                {m.label}
              </button>
            ))}
          </div>
          {/* Timer */}
          <div className="timer-display">{formatTime(timeLeft)}</div>
          {/* Start/pause Button */}
          {!timerActive ? (
            <button className="start-btn" onClick={handleStart}>
              {timeLeft < durations[mode] * 60 && timeLeft > 0 ? "RESUME" : "START"}
            </button>
          ) : (
            <button className="start-btn" style={{ backgroundColor: "#fff8f7", color: "#c85f5f" }} onClick={handlePause}>
              PAUSE
            </button>
          )}
          <div className="session-label">
            {mode === "pomodoro"
              ? `#${sessionNum} Time to focus!`
              : mode === "short_break"
                ? "Short Break"
                : "Long Break"}
          </div>
        </section>
        {/* Tasks Section */}
        <section className="tasks-section">
          <div className="tasks-header">
            <span>Tasks</span>
            <button className="icon-btn" aria-label="task menu">
              <span role="img" aria-label="menu">≡</span>
            </button>
          </div>
          <div className="tasks-divider" />
          <button className="add-task-btn"><span style={{ fontSize: 20, fontWeight: 700 }}>+</span> Add Task</button>
          {/* Tasks List: For demo, static */}
          {TASKS.map((task, i) => (
            <div key={i} className="task-item" style={{
              color: "var(--primary-text)", padding: "12px 0", borderBottom: i !== TASKS.length - 1 ? "1px dashed #fff4" : "none"
            }}>
              {task.text}
            </div>
          ))}
        </section>
      </main>
      {/* Floating Action Buttons */}
      <button
        className="fab fab-left"
        aria-label="Visit site"
        onClick={handleVisitSite}
        style={{ transition: "background 0.15s, outline 0.15s" }}
      >
        <span role="img" aria-label="external">↗️</span> Visit site
      </button>
      <button className="fab fab-right" aria-label="Reset timer" onClick={handleReset}>
        <span role="img" aria-label="refresh">↻</span>
      </button>
    </div>
  );
}

export default App;
