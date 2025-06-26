import React, { useMemo } from "react";
import supabase from "./supabaseClient";
import { useSessions, useTasks } from "./supabaseExamples";
import { useAuth } from "./AuthContext";
import "./ReportDashboard.css";
/**
 * Utility: Calculate stats and series for metrics/cards/charts.
 */
function useDashboardMetrics(sessions, tasks) {
  // Only pomodoro sessions relevant for all primary metrics and charts.
  const pomodoros = useMemo(
    () =>
      (sessions || []).filter((s) => s.mode === "pomodoro" && s.started_at && s.ended_at),
    [sessions]
  );

  // Group sessions by date (yyyy-mm-dd) for daily series.
  const sessionsByDay = useMemo(() => {
    const map = {};
    if (!pomodoros) return map;
    pomodoros.forEach((s) => {
      const d = new Date(s.started_at);
      const day = d.toISOString().slice(0, 10);
      if (!map[day]) map[day] = [];
      map[day].push(s);
    });
    return map;
  }, [pomodoros]);

  // today/this week/total
  const todayStr = new Date().toISOString().slice(0, 10);
  // Week starts Monday
  function getStartOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  }
  const thisWeekStr = getStartOfWeek(new Date());

  const sessionsToday = sessionsByDay[todayStr] || [];
  const weekSessions = Object.entries(sessionsByDay).filter(
    ([date]) => date >= thisWeekStr
  );
  const pomosThisWeek = weekSessions.reduce((acc, [, list]) => acc + list.length, 0);
  const pomoTotal = pomodoros.length;

  // Streak logic: Longest sequence of consecutive days with at least 1 pomodoro.
  function calcStreak(datesArray) {
    if (datesArray.length === 0) return 0;
    const days = [...datesArray].sort();
    let maxStreak = 1;
    let currentStreak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      // diff in days
      const diff =
        (curr - prev) / 1000 / 3600 / 24;
      if (diff === 1) {
        currentStreak += 1;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else if (diff > 1) {
        currentStreak = 1;
      }
    }
    return maxStreak;
  }
  const activeDays = Object.keys(sessionsByDay);
  const longestStreak = calcStreak(activeDays);

  // Focus hours = sum durations of pomodoros (in minutes) across all time/periods
  const sumMinutes = (list) =>
    list.reduce((acc, s) => acc + (s.duration || 25), 0);

  // Chart: bar series (last 7 days, date, count)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const ds = d.toISOString().slice(0, 10);
    return {
      date: ds,
      dow: d.toLocaleDateString(undefined, { weekday: "short" }),
      pomos: (sessionsByDay[ds] || []).length,
    };
  });

  // Pie chart: Estimate breakdown by task
  const pomoByTask = useMemo(() => {
    const map = {};
    pomodoros.forEach((s) => {
      if (s.task_id) {
        map[s.task_id] = (map[s.task_id] || 0) + 1;
      }
    });
    // Map to (task, count)
    const taskTitles = {};
    (tasks || []).forEach((t) => (taskTitles[t.id] = t.title));
    const result = Object.entries(map).map(([tid, count]) => ({
      task: taskTitles[tid] || "Unassigned",
      count,
    }));
    // Fill any zero/leftover. Show top N only.
    return result
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [pomodoros, tasks]);

  return {
    metrics: [
      {
        label: "Today's Pomodoros",
        value: sessionsToday.length,
        desc: "Pomodoros completed today",
        motif: "☀️",
      },
      {
        label: "This Week",
        value: pomosThisWeek,
        desc: "Total pomodoros this week",
        motif: "📅",
      },
      {
        label: "Longest Streak",
        value: longestStreak,
        desc: "Consecutive active days (all-time)",
        motif: "🔥",
      },
      {
        label: "Total Focus",
        value: sumMinutes(pomodoros),
        desc: "Minutes focused (all-time)",
        motif: "⏰",
      },
      {
        label: "Total Pomodoros",
        value: pomoTotal,
        desc: "Pomodoros completed (all-time)",
        motif: "🍅",
      },
    ],
    last7Days,
    pomoByTask,
    weekSessions,
  };
}

/**
 * Mini "bar chart" (graph for pomodoro counts, last 7 days)
 */
function SparkBarChart({ data }) {
  // data: [{ date, dow, pomos }]
  const max = data.reduce((acc, d) => Math.max(acc, d.pomos), 1);
  return (
    <div className="dashboard-sparkbar-root">
      {data.map((d, i) => (
        <div key={d.date} title={`${d.dow}: ${d.pomos} pomodoros`} style={{
          display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <div
            style={{
              width: 22, minWidth: 18,
              height: `${(d.pomos / (max || 1)) * 55 + 5}px`,
              background: d.pomos === max ? "var(--dashboard-yellow)" : "#fff6eb",
              border: "2.7px dashed #E87A41",
              borderBottomLeftRadius: 7, borderBottomRightRadius: 7,
              boxShadow: d.pomos === max ? "0 4px 15px #FFD67C77" : "",
              marginBottom: 5,
              transition: "height .22s cubic-bezier(.82,-0.11,.39,1.17)",
            }}
          />
          <span style={{ fontSize: 11, color: "#ffe3", fontWeight: 700 }}>{d.dow[0]}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Pie chart: Show task breakdown (static SVG pie if browser-native)
 */
function PieChart({ data }) {
  // data: [{task, count}]
  const total = data.reduce((acc, d) => acc + d.count, 0);
  // Avoid zero div
  if (!total) return <div style={{ color: "#fff7", fontSize: 15, textAlign: "center" }}>No task breakdown yet!</div>;
  // Calc angles
  let accum = 0;
  const slices = data.map((d, i) => {
    const start = accum;
    const fraction = d.count / total;
    const angle = fraction * 360;
    accum += angle;
    return { ...d, start, end: start + angle };
  });

  // Pick pastel like motif color per index (theme)
  const colors = [
    "#FFD67C", "#FD7FA5", "#71AEFF", "#82E0A1", "#E87A41", "#F4E2D8"
  ];
  // SVG pie renderer
  function arcPath(startAngle, endAngle) {
    // From angle degrees to XY
    const r = 32, cx = 35, cy = 38;
    const a = (angle) => ((angle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a(startAngle));
    const y1 = cy + r * Math.sin(a(startAngle));
    const x2 = cx + r * Math.cos(a(endAngle));
    const y2 = cy + r * Math.sin(a(endAngle));
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M${cx},${cy}`,
      `L${x1},${y1}`,
      `A${r},${r},0,${largeArc},1,${x2},${y2}`,
      "Z",
    ].join(" ");
  }

  return (
    <div className="dashboard-pie-root">
      <svg width={80} height={80} aria-label="Task breakdown pie chart">
        {slices.map((sl, i) => (
          <path
            key={sl.task}
            d={arcPath(sl.start, sl.end)}
            fill={colors[i % colors.length]}
            stroke="#fff"
            strokeWidth={1.2}
          >
            <title>
              {sl.task}: {sl.count} pomodoros
            </title>
          </path>
        ))}
      </svg>
      {/* Legend */}
      <div className="dashboard-pie-legend">
        {slices.map((sl, i) => (
          <span className="dashboard-pie-legend-item" key={sl.task}>
            <span className="dashboard-pie-dot" style={{ background: colors[i % colors.length] }} />
            <span>
              {sl.task.length > 18 ? sl.task.slice(0, 16) + "…" : sl.task}
            </span>
            <span style={{ color: "#ffd67c", marginLeft: "auto", fontWeight: 700 }}>{sl.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * ReportDashboard - Pomodoro analytics & stats dashboard (Report section)
 * Matches extracted design notes and motif from design notes.
 * Only accessible by signed-in users (enforces auth).
 */
export default function ReportDashboard() {
  const { user } = useAuth();
  const {
    sessions, loading: sessionsLoading, error: sessionsError
  } = useSessions(user?.id ?? null);
  const {
    tasks, loading: tasksLoading
  } = useTasks(user?.id ?? null);

  // Memoized metrics/cards
  const {
    metrics, last7Days, pomoByTask
  } = useDashboardMetrics(sessions, tasks);

  // Auth wall
  if (!user) {
    return (
      <div className="dashboard-wrapper" style={{
        minHeight: "36vh", padding: "52px 0 40px 0", textAlign: "center"
      }}>
        <div style={{
          fontWeight: 700, fontSize: 24, color: "#ffe5ae", marginBottom: 8
        }}>
          Please sign in to view your Report Dashboard
        </div>
        <div style={{ color: "#ffead2", fontSize: 16 }}>
          Track your progress, streaks, and focus stats after signing in.
        </div>
      </div>
    );
  }

  // Loading/error state
  if (sessionsLoading || tasksLoading) {
    return (
      <div className="dashboard-wrapper" style={{
        minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ color: "#ffe", fontWeight: 600, fontSize: 19 }}>
          Loading dashboard…
        </div>
      </div>
    );
  }
  if (sessionsError) {
    return (
      <div className="dashboard-wrapper" style={{
        minHeight: "28vh", display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ color: "#ffc3bc", fontWeight: 600, fontSize: 18 }}>
          {sessionsError.message || "Failed to load sessions."}
        </div>
      </div>
    );
  }

  // Dashboard UI layout
  return (
    <div className="dashboard-wrapper">
      {/* Title and motif */}
      <div className="dashboard-title-row">
        <span role="img" aria-label="analytics" style={{filter: "drop-shadow(0 1.5px 9px #fd7fa566)"}}>📊</span>
        {" "}Report Dashboard
      </div>
      <div className="dashboard-description">
        All your Pomodoro stats, activity trends & streaks at a glance.<br />
        <span style={{ color: "var(--dashboard-yellow)", fontWeight: 600 }}>Stay motivated and mindful!</span>
      </div>
      {/* Motif line */}
      <svg className="dashboard-motif" width={104} height={39} aria-label="Motif line">
        <path
          d="M4 33 Q30 5 52 17 Q86 37 100 5"
          stroke="#FD7FA5"
          strokeWidth="5"
          fill="none"
          opacity={0.44}
          strokeLinecap="round"
        />
      </svg>
      {/* Metrics Cards Row */}
      <div className="dashboard-metrics-row">
        {metrics.slice(0, 4).map((m, i) => (
          <div key={m.label} className="dashboard-metric-card">
            <div className="dashboard-metric-value">
              <span style={{ fontSize: 22, filter: "drop-shadow(0 2px 7px #ffd67c62)" }}>{m.motif}</span>
              {m.value}
            </div>
            <div className="dashboard-metric-label">{m.label}</div>
            <div className="dashboard-metric-desc">{m.desc}</div>
          </div>
        ))}
      </div>
      {/* Bar chart section */}
      <div className="dashboard-charts-section">
        <div className="dashboard-section-title">
          Last 7 Days Activity
        </div>
        <div className="dashboard-section-desc">Pomodoros per day</div>
        <SparkBarChart data={last7Days} />
      </div>
      {/* Pie chart: Task breakdown (if any tasks use) */}
      <div className="dashboard-pie-section">
        <div className="dashboard-section-title">
          Top Tasks (Pomodoros)
        </div>
        <PieChart data={pomoByTask} />
      </div>
      {/* All-time cta/stat */}
      <div className="dashboard-alltime-stat">
        <span role="img" aria-label="trophy" style={{ fontSize: 19 }}>
          🏆
        </span>{" "}
        {metrics[4].value} total Pomodoros logged!
      </div>
    </div>
  );
}
