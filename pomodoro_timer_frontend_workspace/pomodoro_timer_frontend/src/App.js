import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext";
import TasksPane from "./TasksPane";
import { useSessions } from "./supabaseExamples";

/**
 * Simple generic modal
 */
function Modal({ open, onClose, title, children, actions }) {
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div>{children}</div>
        <div className="modal-actions">
          {actions && actions.length > 0
            ? actions.map((a, i) => (
                <button
                  key={i}
                  className={a.className || "primary-btn"}
                  onClick={a.onClick}
                  type={a.type || "button"}
                  autoFocus={a.autoFocus || false}
                  style={a.style}
                >
                  {a.label}
                </button>
              ))
            : (
                <button className="primary-btn" onClick={onClose} autoFocus>
                  OK
                </button>
              )}
        </div>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Pomodoro App with Supabase Auth integration.
 */
function PomodoroApp() {
  // Pomodoro state
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("sign-in"); // or "sign-up"
  const timerRef = useRef(null);

  // Track timer session start
  const [timerStartedAt, setTimerStartedAt] = useState(null);

  // Auth
  const { user, signIn, signUp, signOut, loading: authLoading, error: authError } = useAuth();
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authLocalError, setAuthLocalError] = useState("");

  // Supabase: Logging and fetching sessions history for current user
  const { sessions, loading: sessionsLoading, error: sessionsError, logSession, refreshSessions } = useSessions(user?.id || null);

  // Pomodoro logic
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
    // eslint-disable-next-line
  }, [timerActive]);

  // Helper: When timer starts, capture the "started_at" timestamp
  useEffect(() => {
    if (timerActive && timerStartedAt === null) {
      setTimerStartedAt(new Date());
    }
    if (!timerActive && timeLeft === durations[mode] * 60) {
      setTimerStartedAt(null);
    }
    // eslint-disable-next-line
  }, [timerActive, mode, durations, timeLeft]);

  useEffect(() => { setTimeLeft(durations[mode] * 60); }, [mode, durations]);

  function handleStart() {
    if (timeLeft <= 0) setTimeLeft(durations[mode] * 60);
    setTimerActive(true);
    if (!timerStartedAt) setTimerStartedAt(new Date());
  }
  function handlePause() { setTimerActive(false); }
  function handleReset() {
    setTimerActive(false);
    setTimeLeft(durations[mode] * 60);
    setTimerStartedAt(null);
  }

  // Log work session completion (only if logged in and it's a pomodoro)
  async function handleSessionEnd() {
    let endingTime = new Date();
    if (mode === "pomodoro" && user) {
      // Insert session row
      try {
        await logSession({
          // Optionally, you can tie it to a task by adding a UI for task selection
          mode: "pomodoro",
          duration: durations["pomodoro"],    // in minutes
          started_at: timerStartedAt ? timerStartedAt.toISOString() : null,
          ended_at: endingTime.toISOString()
        });
      } catch (err) {
        // Show a modal error if needed (optional)
        setModalInfo({ open: true, title: "Session Logging Error", message: "Failed to log session: " + err.message });
      }
      refreshSessions && refreshSessions();
    }
    if (mode === "pomodoro") setSessionNum((n) => n + 1);
    setMode(
      mode === "pomodoro"
        ? ((sessionNum + 1) % 4 === 0 ? "long_break" : "short_break")
        : "pomodoro"
    );
    setTimerStartedAt(null);
  }
  function switchMode(newMode) { setMode(newMode); setTimerActive(false); }
  function formatTime(sec) {
    const m = String(Math.floor(Math.abs(sec) / 60)).padStart(2, "0");
    const s = String(Math.abs(sec) % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  // "Demo" tasks
  const TASKS = [
    { text: "Finish UI Overhaul" },
    { text: "Write summary report" },
    { text: "Review PRs" },
  ];

  // Modal helpers
  function showComingSoonModal(feature) {
    setModalInfo({
      open: true,
      title: `${feature} Coming Soon!`,
      message: `This feature is not yet available. Please check back in a future update.`,
    });
  }

  // ---- AUTH UI ----
  // Open sign-in or sign-up modal
  function openAuth(mode = "sign-in") {
    setAuthMode(mode);
    setAuthForm({ email: "", password: "" });
    setAuthLocalError("");
    setShowAuthModal(true);
  }

  // Handle sign-in/up form submit
  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLocalError("");
    if (!authForm.email || !authForm.password) {
      setAuthLocalError("Enter email and password.");
      return;
    }
    if (authMode === "sign-in") {
      const { error } = await signIn(authForm.email, authForm.password);
      if (!error) setShowAuthModal(false);
    } else if (authMode === "sign-up") {
      const { error } = await signUp(authForm.email, authForm.password);
      if (!error) setShowAuthModal(false);
    }
  }

  // UI for Sign-In/Sign-Up modal
  function AuthModal() {
    return (
      <Modal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authMode === "sign-in" ? "Sign In" : "Sign Up"}
        actions={[
          {
            label: authMode === "sign-in" ? "Sign In" : "Sign Up",
            onClick: handleAuthSubmit,
            type: "submit",
            className: "primary-btn",
            autoFocus: true
          },
          {
            label: "Cancel",
            onClick: () => setShowAuthModal(false),
            className: "secondary-btn"
          }
        ]}
      >
        <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
            autoComplete="username"
            required
            style={{ fontSize: 16, padding: "0.46em", borderRadius: 6, marginBottom: 7 }}
            disabled={authLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
            autoComplete={authMode === "sign-in" ? "current-password" : "new-password"}
            required
            style={{ fontSize: 16, padding: "0.46em", borderRadius: 6, marginBottom: 7 }}
            disabled={authLoading}
          />
          {(authLocalError || authError) && (
            <div style={{ color: "#d95550", fontWeight: 500, marginBottom: 2 }}>
              {authLocalError || authError?.message}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 7 }}>
            {authMode === "sign-in" ? (
              <span style={{ color: "#999", fontSize: 14 }}>
                Don't have an account?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#d95550", cursor: "pointer" }}
                  onClick={() => setAuthMode("sign-up")}
                  disabled={authLoading}
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span style={{ color: "#999", fontSize: 14 }}>
                Already have an account?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#d95550", cursor: "pointer" }}
                  onClick={() => setAuthMode("sign-in")}
                  disabled={authLoading}
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </form>
      </Modal>
    );
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
      <AuthModal />

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
          {/* Auth buttons */}
          {user ? (
            <>
              <span style={{ color: "#eee", fontWeight: 500, padding: "0 6px" }}>
                {user.email}
              </span>
              <button
                className="icon-btn"
                aria-label="Sign Out"
                onClick={signOut}
                disabled={authLoading}
              >
                <span role="img" aria-label="person">👤</span> Sign Out
              </button>
            </>
          ) : (
            <button
              className="icon-btn"
              aria-label="Sign In"
              onClick={() => openAuth("sign-in")}
            >
              <span role="img" aria-label="person">👤</span> Sign In
            </button>
          )}
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

          {/* New: Pomodoro Session History */}
          {user && (
            <div style={{ marginTop: "34px", width: "100%" }}>
              <div style={{fontWeight: 600, color: "#fff", textAlign: "left", marginBottom: "6px"}}>Recent Pomodoro Sessions</div>
              {sessionsLoading ? (
                <div style={{color: "#ffd"}}>Loading history…</div>
              ) : sessionsError ? (
                <div style={{color: "#ffc9c9", fontSize: 14}}>Failed to load: {sessionsError.message}</div>
              ) : (sessions && sessions.length > 0 ? (
                <ul className="history-list">
                  {sessions
                    .filter((s) => s.mode === "pomodoro")
                    .slice(0, 7) // Show only most recent 7 pomodoros
                    .map((s, idx) => {
                      const start = new Date(s.started_at);
                      const end = new Date(s.ended_at);
                      const mins = Math.round(((end - start) || (s.duration*60000)) / 60000);
                      return (
                        <li key={s.id} className="history-pomodoro">
                          <span style={{fontWeight:700, color:"#d95550"}}>#{sessions.length - idx}</span>
                          <span>
                            {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}{" "}
                            <span style={{ color: "#9d7f7f", fontSize: 13 }}>
                              {start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </span>
                          <span style={{ color: "#753D20" }}>
                            {mins} min
                          </span>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <div className="empty-history">No Pomodoro sessions yet!</div>
              ))}
            </div>
          )}

        </section>
        {/* Tasks Section: Live CRUD from Supabase */}
        <TasksPane />
      </main>
      {/* Floating Action Buttons */}
      <a
        className="fab fab-left"
        aria-label="Visit site"
        href="https://pomofocus.io"
        target="_blank"
        rel="noopener noreferrer"
        style={{ transition: "background 0.15s, outline 0.15s", display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}
      >
        <span role="img" aria-label="external">↗️</span> Visit site
      </a>
      <button className="fab fab-right" aria-label="Reset timer" onClick={handleReset}>
        <span role="img" aria-label="refresh">↻</span>
      </button>
    </div>
  );
}

/**
 * Root App wraps with AuthProvider to make auth state available globally.
 */
function App() {
  return (
    <AuthProvider>
      <PomodoroApp />
    </AuthProvider>
  );
}

export default App;
