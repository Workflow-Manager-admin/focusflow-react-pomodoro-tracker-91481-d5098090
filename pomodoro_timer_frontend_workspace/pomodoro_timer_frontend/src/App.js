import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext";
import TasksPane from "./TasksPane";
import { useSessions } from "./supabaseExamples";
import ReportDashboard from "./ReportDashboard";
import { AUTH_MODAL_CONSTANT_STYLES } from "./AuthModal.constants";

/**
 * Simple generic modal
 * Always mounted, no conditional rendering, toggled via prop/class only.
 */
const MODAL_BG_CENTER_STYLE = Object.freeze({
  alignItems: "center",
  justifyContent: "center"
});

/**
 * Modal backdrop click handler - stable by useCallback
 */
const useModalBackdropHandler = (onClose) =>
  React.useCallback(
    (e) => {
      if (e.target === e.currentTarget && typeof onClose === "function") onClose();
    },
    [onClose]
  );

/**
 * PUBLIC_INTERFACE
 * Generic Modal with stable styles and handlers.
 */
function Modal({ open, onClose, title, children, actions }) {
  // Memoized style (avoid recreating object)
  const displayStyle = React.useMemo(
    () => ({
      display: open ? "flex" : "none",
      ...MODAL_BG_CENTER_STYLE
    }),
    [open]
  );
  const handleBackdropClick = useModalBackdropHandler(onClose);

  // Memo so actions array/btns have stable references, preventing unnecessary re-renders
  const resolvedActions =
    React.useMemo(
      () =>
        actions && actions.length > 0
          ? actions
          : [
              {
                label: "OK",
                onClick: onClose,
                className: "primary-btn",
                autoFocus: true
              }
            ],
      [actions, onClose]
    );

  return (
    <div
      className={`modal-bg${open ? " modal-bg--active" : ""}`}
      style={displayStyle}
      onClick={handleBackdropClick}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div>{children}</div>
        <div className="modal-actions">
          {resolvedActions.map((a) => (
            <button
              key={a.label + (a.type || "")}
              className={a.className || "primary-btn"}
              onClick={typeof a.onClick === "function" ? a.onClick : undefined}
              type={a.type || "button"}
              autoFocus={a.autoFocus || false}
              style={a.style}
            >
              {a.label}
            </button>
          ))}
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

  // PAGE NAVIGATION
  // page: "timer" | "report"
  const [page, setPage] = useState("timer");

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

  // Always render AuthModal in tree (never conditional). All handler/style refs hoisted for stable identity.
  const authModalRef = useRef(null); // focus target

  // --- Hoisted stable styles/objects for Auth modal fields/buttons (Object.freeze outside component for referential equality) ---
  const AUTH_FORM_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_FORM_STYLE;
  const AUTH_INPUT_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_INPUT_STYLE;
  const AUTH_FLEX_ROW_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_FLEX_ROW_STYLE;
  const AUTH_LINK_BTN_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_LINK_BTN_STYLE;
  const AUTH_ERR_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_ERR_STYLE;
  const AUTH_LABEL_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_LABEL_STYLE;

  // --- Stable handlers/refs ---
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

  // --- Hoisted AuthModal implementation ---
  function AuthModal() {
    useEffect(() => {
      if (showAuthModal && authModalRef.current) {
        authModalRef.current.focus();
      }
    }, [showAuthModal]);
    return (
      <Modal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authMode === "sign-in" ? "Sign In" : "Sign Up"}
        actions={authModalActions}
      >
        <form
          onSubmit={handleAuthSubmit}
          style={AUTH_FORM_STYLE}
          autoComplete="on"
        >
          <input
            ref={authModalRef}
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={handleEmailChange}
            autoComplete="username"
            required
            style={AUTH_INPUT_STYLE}
            disabled={authLoading}
            tabIndex={1}
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={handlePasswordChange}
            autoComplete={authMode === "sign-in" ? "current-password" : "new-password"}
            required
            style={AUTH_INPUT_STYLE}
            disabled={authLoading}
            tabIndex={2}
          />
          {(authLocalError || authError) && (
            <div style={AUTH_ERR_STYLE}>
              {authLocalError || authError?.message}
            </div>
          )}
          <div style={AUTH_FLEX_ROW_STYLE}>
            {authMode === "sign-in" ? (
              <span style={AUTH_LABEL_STYLE}>
                Don't have an account?{" "}
                <button
                  type="button"
                  style={AUTH_LINK_BTN_STYLE}
                  onClick={signUpSwitch}
                  disabled={authLoading}
                  tabIndex={3}
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span style={AUTH_LABEL_STYLE}>
                Already have an account?{" "}
                <button
                  type="button"
                  style={AUTH_LINK_BTN_STYLE}
                  onClick={signInSwitch}
                  disabled={authLoading}
                  tabIndex={3}
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

  // Floating action button styles (unconditional for React Hooks)
  const FAB_LEFT_LINK_STYLE = React.useMemo(
    () => ({
      transition: "background 0.15s, outline 0.15s",
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      color: "inherit"
    }),
    []
  );

  return (
    <div className="app-root">
      {/* Always mounted modals */}
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
          {user && (
            <button
              className={`icon-btn${page === "report" ? " tab-pill active" : ""}`}
              aria-label="Reports"
              onClick={() => setPage(page === "report" ? "timer" : "report")}
              style={page === "report"
                ? {
                  backgroundColor: "#FFD67C", color: "#c85f5f", fontWeight: 700
                }
                : {}
              }
            >
              <span role="img" aria-label="bar-chart">📊</span>{" "}
              {page === "report" ? "Back" : "Report"}
            </button>
          )}
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
        {/* PAGE SWITCHING: Report Dashboard vs. Timer/tasks */}
        {page === "report" ? (
          <ReportDashboard />
        ) : (
          <>
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
                        .slice(0, 7)
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
          </>
        )}
      </main>
      {/* Floating Action Buttons (shown only if not dashboard/report page) */}
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
