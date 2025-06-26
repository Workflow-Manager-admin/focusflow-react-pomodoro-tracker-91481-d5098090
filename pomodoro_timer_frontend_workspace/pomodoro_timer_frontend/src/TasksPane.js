import React, { useState } from "react";
import { useTasks } from "./supabaseExamples";
import { useAuth } from "./AuthContext";

/**
 * PUBLIC_INTERFACE
 * TasksPane - UI section for tasks; handles fetching, adding, toggling tasks, and provides live-updating for logged-in user.
 * Renders Add Task button and list; disables UI if user not logged in.
 */
function TasksPane() {
  const { user } = useAuth();
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks,
  } = useTasks(user ? user.id : null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [localError, setLocalError] = useState("");

  // Add a task and reset the input UI
  async function handleAddTask(e) {
    e.preventDefault();
    setLocalError("");
    const title = newTaskTitle.trim();
    if (title.length < 2) {
      setLocalError("Task too short");
      return;
    }
    await addTask(title);
    setNewTaskTitle("");
    setShowInput(false);
  }

  // Toggle complete/incomplete for a task
  async function handleToggleTask(id, done) {
    await toggleTask(id, done);
  }

  // Show the add task input
  function openAddInput() {
    setShowInput(true);
    setTimeout(() => {
      const field = document.getElementById("add-task-input");
      if (field) field.focus();
    }, 40);
  }

  // If no user, show placeholder and disable actions
  if (!user) {
    return (
      <section className="tasks-section">
        <div className="tasks-header">
          <span>Tasks</span>
          <button className="icon-btn" aria-label="task menu" disabled>
            <span role="img" aria-label="menu">≡</span>
          </button>
        </div>
        <div className="tasks-divider" />
        <button className="add-task-btn" aria-label="Add Task" disabled>
          <span style={{ fontSize: 20, fontWeight: 700 }}>+</span> Add Task
        </button>
        <div style={{ opacity: 0.85, color: "#ffe7", fontSize: 15, padding: "12px 0" }}>
          Sign in to track your Pomodoro tasks!
        </div>
      </section>
    );
  }

  return (
    <section className="tasks-section">
      <div className="tasks-header">
        <span>Tasks</span>
        <button className="icon-btn" aria-label="task menu" tabIndex={-1}>
          <span role="img" aria-label="menu">≡</span>
        </button>
      </div>
      <div className="tasks-divider" />

      {/* Add Task Button and Input */}
      {!showInput ? (
        <button
          className="add-task-btn"
          aria-label="Add Task"
          onClick={openAddInput}
          disabled={tasksLoading}
        >
          <span style={{ fontSize: 20, fontWeight: 700 }}>+</span> Add Task
        </button>
      ) : (
        <form
          style={{ display: "flex", gap: 8, marginBottom: 12 }}
          onSubmit={handleAddTask}
        >
          <input
            id="add-task-input"
            type="text"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            minLength={2}
            maxLength={80}
            style={{
              flex: 1,
              borderRadius: 999,
              fontSize: 16,
              padding: "9px 16px",
              outline: "none",
              border: "2px solid #ffe4",
            }}
            disabled={tasksLoading}
            autoFocus
          />
          <button
            type="submit"
            className="icon-btn"
            style={{ fontWeight: 700, padding: "7px 16px" }}
            disabled={tasksLoading}
          >
            Add
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => { setShowInput(false); setLocalError(""); }}
            style={{ fontWeight: 600, background: "#fcf3f3", color: "#b88b8b" }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Error Message */}
      {(tasksError || localError) && (
        <div style={{ color: "#fff2b7", background: "#be1818cc", borderRadius: 7, padding: "4px 10px", marginBottom: 8, fontWeight: 500 }}>
          {localError || tasksError?.message}
        </div>
      )}

      {/* Tasks List */}
      {tasksLoading ? (
        <div style={{ color: "#ffe", padding: "15px 0" }}>Loading tasks…</div>
      ) : tasks?.length === 0 ? (
        <div style={{ color: "#ffe", padding: "13px 0", opacity: 0.74, fontWeight: 500 }}>
          No tasks yet!
        </div>
      ) : (
        <div>
          {tasks.map((task, i) => (
            <div
              key={task.id}
              className="task-item"
              style={{
                color: "var(--primary-text)",
                padding: "12px 0",
                borderBottom: i !== tasks.length - 1 ? "1px dashed #fff4" : "none",
                display: "flex",
                alignItems: "center",
                gap: 11,
                opacity: task.done ? 0.59 : 1,
                textDecoration: task.done ? "line-through" : "none",
                transition: "opacity .23s",
                cursor: "pointer",
              }}
              tabIndex={0}
              aria-label={task.done ? "Mark as undone" : "Mark as done"}
              onClick={() => handleToggleTask(task.id, task.done)}
              onKeyDown={e => {
                if (e.key === " " || e.key === "Enter") {
                  handleToggleTask(task.id, task.done);
                }
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: "2px solid #f9d8d8",
                  background: task.done ? "#E87A41" : "#fff",
                  marginRight: 5,
                  marginLeft: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background .18s",
                  fontSize: 13,
                  color: task.done ? "#fff" : "#c85f5f",
                  cursor: "pointer",
                  flexShrink: 0
                }}
                aria-checked={task.done}
              >
                {task.done ? "✓" : ""}
              </span>
              <span style={{ flex: 1, fontWeight: 500, fontSize: 16, userSelect: "text" }}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TasksPane;
