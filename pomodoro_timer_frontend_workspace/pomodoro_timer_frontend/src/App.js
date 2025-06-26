import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/**
 * Modern Pomodoro Timer React App
 * Implements Pomodoro, Short/Long Break mode, automatic switching, history, settings, and persistent state.
 * UI theme matches minimal light style, mobile responsive, with custom colors as specified.
 */

// Constants for session types
const MODES = [
  {
    key: "pomodoro",
    label: "Pomodoro",
    color: "var(--primary-color)",
  },
  {
    key: "short_break",
    label: "Short Break",
    color: "var(--secondary-color)",
  },
  {
    key: "long_break",
    label: "Long Break",
    color: "var(--accent-color)",
  },
];

// Default durations, in minutes
const DEFAULT_DURATIONS = {
  pomodoro: 25,
  short_break: 5,
  long_break: 15,
};

const LOCALSTORAGE_KEY = "focusflow-pomodoro-state-v1";

// PUBLIC_INTERFACE
function App() {
  // Persistent customization states
  const [durations, setDurations] = useState(() => {
    // Try to load settings from localStorage
    let saved = localStorage.getItem(LOCALSTORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.durations || DEFAULT_DURATIONS;
      } catch {
        //
      }
    }
    return DEFAULT_DURATIONS;
  });

  const [mode, setMode] = useState("pomodoro"); // current session mode
  const [timeLeft, setTimeLeft] = useState(durations[mode] * 60); // seconds
  const [timerActive, setTimerActive] = useState(false);

  // Used to prevent double interval start
  const intervalRef = useRef(null);

  // Session counters and persistent day tracking
  const [pomodorosCompletedToday, setPomodorosCompletedToday] = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Persist and rehydrate from localStorage on mount
  useEffect(() => {
    let saved = localStorage.getItem(LOCALSTORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMode(parsed.mode || "pomodoro");
        setTimeLeft(
          typeof parsed.timeLeft === "number"
            ? parsed.timeLeft
            : durations[parsed.mode || "pomodoro"] * 60
        );
        setPomodorosCompletedToday(parsed.pomodorosCompletedToday ?? 0);

        // Only keep today history, detect if day changed
        if (parsed.sessionHistory && parsed.lastActiveDay) {
          if (parsed.lastActiveDay === getTodayStr()) {
            setSessionHistory(parsed.sessionHistory);
          }
        }
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line
  }, []);

  // Listen to mode or durations change and update timeLeft accordingly when not running
  useEffect(() => {
    if (!timerActive) {
      setTimeLeft(durations[mode] * 60);
    }
  }, [mode, durations, timerActive]);

  // Persist state to localStorage on every relevant change
  useEffect(() => {
    const save = {
      durations,
      mode,
      pomodorosCompletedToday,
      sessionHistory,
      timeLeft,
      lastActiveDay: getTodayStr(),
    };
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(save));
  }, [durations, mode, pomodorosCompletedToday, sessionHistory, timeLeft]);

  // Automatically reset daily counters/history if date changes
  useEffect(() => {
    const checkDay = setInterval(() => {
      let saved = localStorage.getItem(LOCALSTORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.lastActiveDay && parsed.lastActiveDay !== getTodayStr()) {
            setPomodorosCompletedToday(0);
            setSessionHistory([]);
          }
        } catch {
          //
        }
      }
    }, 60 * 1000);
    return () => clearInterval(checkDay);
  }, []);

  // Timer interval effect
  useEffect(() => {
    if (timerActive && intervalRef.current === null) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    if (!timerActive && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerActive]);

  // Auto-switch session on time up
  useEffect(() => {
    if (timerActive && timeLeft < 0) {
      handleSessionEnd();
    }
    // eslint-disable-next-line
  }, [timeLeft, timerActive]);

  // PUBLIC_INTERFACE
  function handleStart() {
    setTimerActive(true);
  }
  // PUBLIC_INTERFACE
  function handlePause() {
    setTimerActive(false);
  }
  // PUBLIC_INTERFACE
  function handleReset() {
    setTimerActive(false);
    setTimeLeft(durations[mode] * 60);
  }

  // PUBLIC_INTERFACE
  function handleSwitchMode(newMode) {
    setTimerActive(false);
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
  }

  // PUBLIC_INTERFACE
  function openSettings() {
    setSettingsOpen(true);
  }
  // PUBLIC_INTERFACE
  function closeSettings() {
    setSettingsOpen(false);
  }
  // PUBLIC_INTERFACE
  function openHistory() {
    setHistoryOpen(true);
  }
  // PUBLIC_INTERFACE
  function closeHistory() {
    setHistoryOpen(false);
  }

  // PUBLIC_INTERFACE
  function handleUpdateDurations(newDurations) {
    setDurations(newDurations);
  }

  // PUBLIC_INTERFACE
  function handleSessionEnd() {
    // Log last session
    const now = new Date();
    setSessionHistory((prev) => [
      ...prev,
      {
        mode,
        duration: durations[mode],
        completedAt: now.toISOString(),
      },
    ]);

    if (mode === "pomodoro") {
      setPomodorosCompletedToday((p) => p + 1);
      // Auto-switch to break
      handleSwitchMode(
        (sessionHistory.filter((s) => s.mode === "pomodoro").length + 1) %
          4 ===
          0
          ? "long_break"
          : "short_break"
      );
    } else {
      handleSwitchMode("pomodoro");
    }
  }

  // PUBLIC_INTERFACE
  function formatTime(sec) {
    // Always show two digits for mm:ss
    const m = String(Math.floor(Math.abs(sec) / 60)).padStart(2, "0");
    const s = String(Math.abs(sec) % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  // MAIN RENDER
  return (
    <div className="app-root" style={{ background: "var(--bg-primary)" }}>
      <header className="main-navbar">
        <h1 className="title">Pomodoro FocusFlow</h1>
        <nav>
          <button className="nav-btn history" onClick={openHistory} title="Session History">
            <span role="img" aria-label="history">📊</span>
          </button>
          <button className="nav-btn settings" onClick={openSettings} title="Settings">
            <span role="img" aria-label="settings">⚙️</span>
          </button>
        </nav>
      </header>
      <main className="main-content">
        <div className="timer-section">
          <nav className="mode-tabs">
            {MODES.map((m) => (
              <button
                key={m.key}
                className={`tab-btn${mode === m.key ? " active" : ""}`}
                style={{
                  borderColor: mode === m.key ? m.color : "transparent",
                  color: mode === m.key ? m.color : "var(--text-primary)",
                }}
                onClick={() => handleSwitchMode(m.key)}
                aria-label={m.label}
              >
                {m.label}
              </button>
            ))}
          </nav>
          <div className="timer-display" style={{
            background: "var(--accent-color, #f4e2d8)",
            color: "var(--primary-color, #d95550)",
            borderColor: "var(--primary-color, #d95550)"
          }}>
            <span className="timer-digits">{formatTime(timeLeft)}</span>
          </div>
          <div className="timer-controls">
            {!timerActive ? (
              <button
                className="main-btn start"
                style={{ background: "var(--primary-color)" }}
                onClick={handleStart}
              >Start</button>
            ) : (
              <button
                className="main-btn pause"
                style={{ background: "var(--secondary-color)" }}
                onClick={handlePause}
              >Pause</button>
            )}
            <button
              className="main-btn reset"
              style={{
                background: "var(--accent-color)",
                color: "var(--primary-color)",
                marginLeft: 8,
              }}
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
          <div className="session-stats">
            <div className="pomodoro-counter">
              <span role="img" aria-label="fire" style={{marginRight: 6}}>🔥</span>
              <span>Completed Today: <strong>{pomodorosCompletedToday}</strong></span>
            </div>
          </div>
        </div>
      </main>
      <footer className="main-footer">
        <span className="footer-appname">Pomodoro FocusFlow</span>
        <button className="footer-btn settings" onClick={openSettings}>
          <span role="img" aria-label="settings">⚙️</span> Settings
        </button>
      </footer>
      {settingsOpen && (
        <SettingsModal
          durations={durations}
          onClose={closeSettings}
          onUpdate={handleUpdateDurations}
        />
      )}
      {historyOpen && (
        <HistoryModal
          history={sessionHistory}
          onClose={closeHistory}
        />
      )}
    </div>
  );
}

/**
 * Settings modal for customizing session durations.
 */
function SettingsModal({ durations, onClose, onUpdate }) {
  const [inputs, setInputs] = useState({ ...durations });
  // PUBLIC_INTERFACE
  function handleInput(e) {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: Math.max(1, parseInt(value) || 1),
    }));
  }
  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    onUpdate(inputs);
    onClose();
  }
  return (
    <div className="modal-bg" onMouseDown={onClose}>
      <div
        className="modal settings-modal"
        onMouseDown={e => e.stopPropagation()}
        role="dialog" aria-modal="true"
      >
        <h2>Settings</h2>
        <form className="settings-form" onSubmit={handleSubmit}>
          <label>
            Pomodoro Duration (minutes)
            <input
              type="number"
              min="1"
              name="pomodoro"
              value={inputs.pomodoro}
              onChange={handleInput}
              required
            />
          </label>
          <label>
            Short Break Duration (minutes)
            <input
              type="number"
              min="1"
              name="short_break"
              value={inputs.short_break}
              onChange={handleInput}
              required
            />
          </label>
          <label>
            Long Break Duration (minutes)
            <input
              type="number"
              min="1"
              name="long_break"
              value={inputs.long_break}
              onChange={handleInput}
              required
            />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="secondary-btn">
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Session history modal.
 */
function HistoryModal({ history, onClose }) {
  return (
    <div className="modal-bg" onMouseDown={onClose}>
      <div
        className="modal history-modal"
        onMouseDown={e => e.stopPropagation()}
        role="dialog" aria-modal="true"
      >
        <h2>Session History (Today)</h2>
        {history.length === 0 ? (
          <div className="empty-history">No sessions completed yet today.</div>
        ) : (
          <ul className="history-list">
            {history.slice().reverse().map((s, i) => (
              <li key={i} className={`history-${s.mode}`}>
                <span>{displayMode(s.mode)}</span>{" "}
                <span>{s.duration} min</span>{" "}
                <span>
                  {new Date(s.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="modal-actions">
          <button onClick={onClose} className="primary-btn">Close</button>
        </div>
      </div>
    </div>
  );
}

// Helpers
function getTodayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}
function displayMode(mode) {
  switch (mode) {
    case "pomodoro":
      return "Pomodoro";
    case "short_break":
      return "Short Break";
    case "long_break":
      return "Long Break";
    default:
      return "";
  }
}

export default App;
