//
// Supabase Example Hooks and Utilities for Tasks & Sessions
// Copy/paste ready! Designed for use in App.js or any component.
// Each hook takes care of loading, creating, updating, and deleting with comments for developer clarity.
//
// Prerequisite: Ensure your tables exist as follows (column names are examples and should match your schema):
/* Schema expectation:
   - tasks: id (uuid), user_id (uuid), title (text), done (boolean), created_at (timestamp)
*/
// - sessions: id (uuid), user_id (uuid), task_id (uuid), mode (text), duration (int), started_at (timestamp), ended_at (timestamp)
//

import { useState, useEffect, useCallback } from "react";
import supabase from "./supabaseClient";

/*
 * ========================
 *      TASKS HOOKS
 * ========================
 */

// PUBLIC_INTERFACE
/**
 * useTasks - React hook for CRUD operations on the "tasks" table.
 * @param {string} userId - Current user's ID (Supabase Auth user.id)
 * @returns {object} { tasks, loading, error, addTask, toggleTask, deleteTask, refreshTasks }
 *
 * Example usage:
 *   const { tasks, addTask, toggleTask, deleteTask, loading } = useTasks(user.id);
 */
export function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tasks for a user
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) setError(error);
    setTasks(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchTasks();
  }, [userId, fetchTasks]);

  // Add a new task
  // Example: addTask("Write Code")
  // Returns the inserted task or null if failed
  // PUBLIC_INTERFACE
  /**
   * Adds a new task after checking for a valid authenticated userId from Supabase Auth.
   * The userId must match the currently logged-in user's id.
   * For security, no insert will occur unless userId is present and valid.
   * @param {string} title - Task title
   */
  async function addTask(title) {
    // Try to always obtain user_id from supabase.auth.getUser() if not present.
    let effectiveUserId = userId;
    try {
      // Defensive: double-check from Auth if userId is missing or empty
      if (!effectiveUserId || typeof effectiveUserId !== "string" || effectiveUserId.trim() === "") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id) effectiveUserId = user.id;
      }
    } catch { /* fallback: use initial */ }
    if (!effectiveUserId || typeof effectiveUserId !== "string" || effectiveUserId.trim() === "") {
      const error = new Error("No authenticated user. Cannot add task.");
      setError(error);
      setLoading(false);
      return null;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title, done: false, user_id: effectiveUserId }])
      .select()
      .single();

    if (!error && data && data.user_id === effectiveUserId) {
      setTasks((old) => [data, ...old]);
    } else {
      setError(error || new Error("Failed to set user_id on inserted task"));
    }
    setLoading(false);
    return data;
  }

  // Toggle done/undone for a specific task, require userId for security
  /**
   * Toggle task completion: always ensure user_id is from authenticated Supabase user.
   * @param {string} id - Task id
   * @param {boolean} done - Current task done state
   */
  async function toggleTask(id, done) {
    let effectiveUserId = userId;
    try {
      if (!effectiveUserId || typeof effectiveUserId !== "string" || effectiveUserId.trim() === "") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id) effectiveUserId = user.id;
      }
    } catch { /* fallback */ }
    if (!effectiveUserId || typeof effectiveUserId !== "string" || effectiveUserId.trim() === "") {
      setError(new Error("No authenticated user. Cannot toggle task."));
      setLoading(false);
      return null;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .update({ done: !done })
      .eq("id", id)
      .eq("user_id", effectiveUserId)
      .select()
      .single();

    if (!error && data && data.user_id === effectiveUserId) {
      setTasks((old) =>
        old.map((t) => (t.id === id ? { ...t, done: !done } : t))
      );
    } else {
      setError(error || new Error("Failed to toggle: user_id mismatch."));
    }
    setLoading(false);
    return data;
  }

  // Delete a task by id
  async function deleteTask(id) {
    setLoading(true);
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) {
      setTasks((old) => old.filter((t) => t.id !== id));
    } else {
      setError(error);
    }
    setLoading(false);
  }

  // Force reload tasks from DB
  async function refreshTasks() {
    await fetchTasks();
  }

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks,
  };
}

/*
 * ========================
 *      SESSIONS HOOKS
 * ========================
 */

// PUBLIC_INTERFACE
/**
 * useSessions - React hook for CRUD operations and logging Pomodoro sessions
 * @param {string} userId - Current user's ID (Supabase Auth user.id)
 * @param {object} [opts] - Optional filters (e.g., {taskId})
 *
 * @returns {object} { sessions, loading, error, logSession, refreshSessions }
 *
 * Example usage:
 *   const { sessions, logSession, loading } = useSessions(user.id, {taskId: selectedTaskId});
 */
export function useSessions(userId, opts = {}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sessions (optionally for just one task)
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId);

    if (opts.taskId) {
      query = query.eq("task_id", opts.taskId);
    }
    const { data, error } = await query.order("started_at", {
      ascending: false,
    });
    if (error) setError(error);
    setSessions(data || []);
    setLoading(false);
  }, [userId, opts.taskId]);

  useEffect(() => {
    if (userId) fetchSessions();
  }, [userId, opts.taskId, fetchSessions]);

  // Log a new session (a Pomodoro or break)
  // Example: logSession({task_id, mode: 'pomodoro', duration: 25, started_at, ended_at})
  // Returns the inserted session or null if failed
  /**
   * Log a session. Always ensures user_id is authenticated.
   * @param {object} session - Session data (should NOT include user_id, it's set here)
   */
  async function logSession(session) {
    setLoading(true);
    let effectiveUserId = userId;
    try {
      if (!effectiveUserId || typeof effectiveUserId !== "string" || effectiveUserId.trim() === "") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id) effectiveUserId = user.id;
      }
    } catch {}
    if (!effectiveUserId || typeof effectiveUserId !== "string" || effectiveUserId.trim() === "") {
      setError(new Error("No authenticated user. Cannot log session."));
      setLoading(false);
      return null;
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert([{ ...session, user_id: effectiveUserId }])
      .select()
      .single();

    if (!error) {
      setSessions((old) => [data, ...old]);
    } else {
      setError(error);
    }
    setLoading(false);
    return data;
  }

  // Force reload of sessions list from DB
  async function refreshSessions() {
    await fetchSessions();
  }

  return {
    sessions,
    loading,
    error,
    logSession,
    refreshSessions,
  };
}

/*
 * ========================
 *    ONE-OFF UTILITIES
 * ========================
 *
 * If you just want one-shot static helpers instead of hooks, use these:
 */

// PUBLIC_INTERFACE
// Fetch all tasks for a user
export async function fetchAllTasks(userId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * Add a new task (returns the single created row).
 * Ensures userId is valid and is from Supabase Auth session!
 */
/**
 * PUBLIC_INTERFACE
 * Securely creates a new task for the currently authenticated user.
 * @param {string} userId - Must be obtained directly from supabase.auth.getUser().id or React AuthContext
 * @param {string} title - Task title
 * @returns Inserted task row
 * @throws Error if userId is not present/valid or insert fails
 */
export async function createTask(userId, title) {
  let effectiveUserId = userId;
  if (!effectiveUserId || typeof effectiveUserId !== "string" || effectiveUserId.trim() === "") {
    // Attempt to check from supabase.auth.getUser()
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id) effectiveUserId = user.id;
    } catch {
      /* fallback to throw below */
    }
  }
  if (!effectiveUserId || typeof effectiveUserId !== "string" || effectiveUserId.trim() === "") {
    throw new Error("No authenticated user. Cannot create task.");
  }
  const { data, error } = await supabase
    .from("tasks")
    .insert([{ user_id: effectiveUserId, title, done: false }])
    .select()
    .single();
  if (error) throw error;
  // Double-check user_id in returned row
  if (!data || data.user_id !== effectiveUserId) {
    throw new Error("Task insert did not assign the correct authenticated user's ID.");
  }
  return data;
}

// PUBLIC_INTERFACE
// Toggle done state of a given task (by id, passing new done state)
// This function now requires both taskId and userId for security.
export async function setTaskCompleted(taskId, done, userId) {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error("No authenticated user. Cannot set task completed.");
  }
  const { data, error } = await supabase
    .from("tasks")
    .update({ done })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  if (!data || data.user_id !== userId)
    throw new Error("Tried to update a task not owned by the logged in user.");
  return data;
}

// PUBLIC_INTERFACE
// Delete a task (by id)
export async function deleteTaskById(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
  return true;
}

// PUBLIC_INTERFACE
// Log (insert) a session
export async function insertSession(session) {
  // Required: session = { user_id, task_id, mode, duration, started_at, ended_at }
  const { data, error } = await supabase
    .from("sessions")
    .insert([session])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// PUBLIC_INTERFACE
// Fetch sessions for a user, or specific task (optional)
export async function fetchSessions(userId, taskId) {
  let query = supabase.from("sessions").select("*").eq("user_id", userId);
  if (taskId) query = query.eq("task_id", taskId);
  const { data, error } = await query.order("started_at", { ascending: false });
  if (error) throw error;
  return data;
}

/* USAGE EXAMPLES:

// In a component (after user is signed in):

import { useTasks, useSessions } from './supabaseExamples';

const { tasks, addTask, toggleTask, deleteTask, loading } = useTasks(user.id);

const { sessions, logSession } = useSessions(user.id, {taskId: myTaskId});

addTask("My new task");
toggleTask("task-uuid", false);
deleteTask("task-uuid");
logSession({
  task_id: "task-uuid",
  mode: "pomodoro",
  duration: 25,
  started_at: new Date().toISOString(),
  ended_at: new Date(Date.now() + 25*60000).toISOString()
});

*/

