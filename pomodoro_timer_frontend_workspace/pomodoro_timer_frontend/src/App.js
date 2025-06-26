import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext";
import TasksPane from "./TasksPane";
import { useSessions } from "./supabaseExamples";
import ReportDashboard from "./ReportDashboard";
import Modal from "./Modal";
import { AuthModal } from "./AuthModal";
import { AUTH_MODAL_CONSTANT_STYLES } from "./AuthModal.constants";

/**
 * PUBLIC_INTERFACE
 * PomodoroApp - Main App Layout and UI matching extracted design.
 * Matches layout, navigation bar, timer, tabs, and task field according to assets/pomodoro_main_design_notes.md.
 */
function PomodoroApp() {
  // Modes as in the design
  const MODES = [
    { key: "pomodoro", label: "Pomodoro" },
    { key: "short_break", label: "Short Break" },
    { key: "long_break", label: "Long Break" }
  ];
  const [page, setPage] = useState("timer"); // timer | report

  // Timer state
  const DEFAULT_DURATIONS = { pomodoro: 25, short_break: 5, long_break: 15 };
  const [mode, setMode] = useState("pomodoro");
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS[mode] * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionNum, setSessionNum] = useState(1);
  const [modalInfo, setModalInfo] = useState({ open: false, title: "", message: "" });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("sign-in");
  const timerRef = useRef(null);

  // Track timer session start/stop
  const [timerStartedAt, setTimerStartedAt] = useState(null);

  // Auth
  const { user, signIn, signUp, signOut, loading: authLoading, error: authError } = useAuth();
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authLocalError, setAuthLocalError] = useState("");

  // Sessions (analytics/history)
  const { sessions, loading: sessionsLoading, error: sessionsError, logSession, refreshSessions } = useSessions(user?.id || null);

  // --- Timer logic
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

  useEffect(() => {
    if (timerActive && timerStartedAt === null) {
      setTimerStartedAt(new Date());
    }
    if (!timerActive && timeLeft === durations[mode] * 60) {
      setTimerStartedAt(null);
    }
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

  // Handle automatic session switch (auto break/long break logic per Pomodoro)
  async function handleSessionEnd() {
    let endingTime = new Date();
    if (mode === "pomodoro" && user) {
      try {
        await logSession({
          mode: "pomodoro",
          duration: durations["pomodoro"],
          started_at: timerStartedAt ? timerStartedAt.toISOString() : null,
          ended_at: endingTime.toISOString()
        });
      } catch (err) {
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

  // Modal helpers
  function showComingSoonModal(feature) {
    setModalInfo({
      open: true,
      title: `${feature} Coming Soon!`,
      message: `This feature is not yet available. Please check back in a future update.`,
    });
  }

  // ---- AUTH UI ----
  const openAuth = React.useCallback((mode = "sign-in") => {
    setAuthMode(mode);
    setAuthForm({ email: "", password: "" });
    setAuthLocalError("");
    setShowAuthModal(true);
  }, []);

  const handleAuthSubmit = React.useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
  }, [authForm, authMode, signIn, signUp, setShowAuthModal]);

  // Stable actions for AuthModal
  const authModalActions = React.useMemo(() => ([
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
  ]), [authMode, handleAuthSubmit]);

  // Stable styles/objects for Auth modal fields/buttons (see constants file)
  const AUTH_FORM_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_FORM_STYLE;
  const AUTH_INPUT_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_INPUT_STYLE;
  const AUTH_FLEX_ROW_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_FLEX_ROW_STYLE;
  const AUTH_LINK_BTN_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_LINK_BTN_STYLE;
  const AUTH_ERR_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_ERR_STYLE;
  const AUTH_LABEL_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_LABEL_STYLE;

  const signUpSwitch = React.useCallback(() => setAuthMode("sign-up"), [setAuthMode]);
  const signInSwitch = React.useCallback(() => setAuthMode("sign-in"), [setAuthMode]);
  const handleEmailChange = React.useCallback(
    (e) => {
      const val = e.target.value;
      setAuthForm(f => ({ ...f, email: val }));
    },
    [setAuthForm]
  );
  const handlePasswordChange = React.useCallback(
    (e) => {
      const val = e.target.value;
      setAuthForm(f => ({ ...f, password: val }));
    },
    [setAuthForm]
  );

  // Floating action button styles (Theme-matching)
  const FAB_LEFT_LINK_STYLE = React.useMemo(
    () => ({
      transition: "background 0.15s, outline 0.15s",
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      color: "inherit"
    }), []);

  // Render main UI matching the extracted design
  return (
    <div className="app-root" data-testid="pomofocus-main">
      {/* Modal dialogs (generic and auth) */}
      <Modal
        open={modalInfo.open}
        onClose={() => setModalInfo({ ...modalInfo, open: false })}
        title={modalInfo.title}
      >
        <div>{modalInfo.message}</div>
      </Modal>
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        authMode={authMode}
        authForm={authForm}
        authLoading={authLoading}
        authError={authError ? authError.message : ""}
        authLocalError={authLocalError}
        actions={authModalActions}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onSwitchMode={{
          toSignUp: signUpSwitch,
          toSignIn: signInSwitch,
        }}
        onSubmit={handleAuthSubmit}
      />

      {/* NAVIGATION - extracted design */}
      <nav className="design-navbar">
        <div className="navbar-left">
          <span className="logo design-logo">🍅 Pomofocus</span>
        </div>
        <div className="navbar-right">
          <button
            className={`nav-btn${page === "report" ? " nav-btn-active" : ""}`}
            aria-label="Reports"
            onClick={() => setPage(page === "report" ? "timer" : "report")}
            style={page === "report"
              ? { background: "var(--motif-orange)", color: "#fff", fontWeight: 700 }
              : {}}
          >
            <span role="img" aria-label="bar-chart">📊</span>
            {page === "report" ? " Main" : " Report"}
          </button>
          <button
            className="nav-btn"
            aria-label="Settings"
            onClick={() => showComingSoonModal("Settings")}
            style={{ marginLeft: 8 }}
          >
            <span role="img" aria-label="gear">⚙️</span>
          </button>
          {/* Auth */}
          {user ? (
            <>
              <span className="nav-user-email">{user.email}</span>
              <button
                className="nav-btn"
                aria-label="Sign Out"
                onClick={signOut}
                disabled={authLoading}
                style={{ marginLeft: 8 }}
              >
                <span role="img" aria-label="person">👤</span> Sign Out
              </button>
            </>
          ) : (
            <button
              className="nav-btn"
              aria-label="Sign In"
              onClick={() => openAuth("sign-in")}
              style={{ marginLeft: 8 }}
            >
              <span role="img" aria-label="person">👤</span> Sign In
            </button>
          )}
        </div>
      </nav>
      {/* Main content */}
      <main className="design-main-content">
        {page === "report" ? (
          <ReportDashboard />
        ) : (
          <div className="design-main-grid">
            <section className="timer-section">
              {/* TABS */}
              <div className="mode-tabs design-mode-tabs">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    className={`tab-btn${mode === m.key ? " active" : ""}`}
                    onClick={() => switchMode(m.key)}
                    aria-label={m.label}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {/* TIMER DISPLAY */}
              <div className="timer-display design-timer-display" tabIndex={0}>
                <span className="timer-digits">{formatTime(timeLeft)}</span>
              </div>
              {/* TIMER CONTROLS */}
              <div className="timer-controls">
                {!timerActive ? (
                  <button className="main-btn start" onClick={handleStart}>
                    {timeLeft < durations[mode] * 60 && timeLeft > 0 ? "RESUME" : "START"}
                  </button>
                ) : (
                  <button
                    className="main-btn pause"
                    onClick={handlePause}
                  >
                    PAUSE
                  </button>
                )}
                <button className="main-btn reset" onClick={handleReset}>
                  RESET
                </button>
              </div>
              {/* Session label and counter (per extracted design) */}
              <div className="session-label design-session-label">
                {mode === "pomodoro"
                  ? `#${sessionNum} Time to focus!`
                  : mode === "short_break"
                    ? "Short Break"
                    : "Long Break"}
              </div>
              {/* Pomodoro history (below timer) only if logged in */}
              {user && (
                <div style={{ marginTop: "1em", width: "100%" }}>
                  <div className="pomodoro-history-label">Recent Pomodoros</div>
                  {sessionsLoading ? (
                    <div className="design-loading-text">Loading…</div>
                  ) : sessionsError ? (
                    <div className="design-session-error">Failed: {sessionsError.message}</div>
                  ) : (sessions && sessions.length > 0 ? (
                    <ul className="history-list">
                      {sessions
                        .filter((s) => s.mode === "pomodoro")
                        .slice(0, 7)
                        .map((s, idx) => {
                          const start = new Date(s.started_at);
                          const end = new Date(s.ended_at);
                          const mins = Math.round(((end - start) || (s.duration*60000)) / 60000);
                          return (
                            <li key={s.id} className="history-pomodoro">
                              <span style={{fontWeight:700, color:"var(--motif-orange)"}}>#{sessions.length - idx}</span>
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
            <TasksPane />
          </div>
        )}
      </main>
      {/* Floating action buttons in extracted style */}
      {page !== "report" && (
        <>
          <a
            className="fab fab-left"
            aria-label="Visit site"
            href="https://pomofocus.io"
            target="_blank"
            rel="noopener noreferrer"
            style={FAB_LEFT_LINK_STYLE}
          >
            <span role="img" aria-label="external">↗️</span> Visit site
          </a>
          <button className="fab fab-right" aria-label="Reset timer" onClick={handleReset}>
            <span role="img" aria-label="refresh">↻</span>
          </button>
        </>
      )}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
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
