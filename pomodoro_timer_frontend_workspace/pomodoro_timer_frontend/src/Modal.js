import React from "react";

/**
 * PUBLIC_INTERFACE
 * Generic Modal with stable styles and handlers.
 * Props:
 *  - open: boolean (modal visible)
 *  - onClose: function (called when backdrop or OK button clicked)
 *  - title: string (modal title/header)
 *  - children: content
 *  - actions: array of { label, onClick, className, type, autoFocus, style }
 */
const MODAL_BG_CENTER_STYLE = Object.freeze({
  alignItems: "center",
  justifyContent: "center"
});

const useModalBackdropHandler = (onClose) =>
  React.useCallback(
    (e) => {
      if (e.target === e.currentTarget && typeof onClose === "function") onClose();
    },
    [onClose]
  );

// PUBLIC_INTERFACE
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
export default Modal;
