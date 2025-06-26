import React, { useEffect, useRef } from "react";
import Modal from "./Modal";
import { AUTH_MODAL_CONSTANT_STYLES } from "./AuthModal.constants";

/**
 * PUBLIC_INTERFACE
 * AuthModal component.
 * Props:
 * - open: boolean, controls modal visibility
 * - onClose: function to call to close modal
 * - authMode: "sign-in" | "sign-up"
 * - authForm: {email, password} object
 * - authLoading: boolean, disables form if true
 * - authError: error message from auth context
 * - authLocalError: local form validation error (string)
 * - actions: array of actions for modal footer
 * - onEmailChange, onPasswordChange: input handlers
 * - onSwitchMode: { toSignUp: fn, toSignIn: fn }
 * - onSubmit: submit handler
 */
export function AuthModal({
  open,
  onClose,
  authMode,
  authForm,
  authLoading,
  authError,
  authLocalError,
  actions,
  onEmailChange,
  onPasswordChange,
  onSwitchMode,
  onSubmit
}) {
  const authModalRef = useRef(null);

  useEffect(() => {
    if (open && authModalRef.current) {
      authModalRef.current.focus();
    }
  }, [open]);

  // Static constant styles
  const AUTH_FORM_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_FORM_STYLE;
  const AUTH_INPUT_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_INPUT_STYLE;
  const AUTH_FLEX_ROW_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_FLEX_ROW_STYLE;
  const AUTH_LINK_BTN_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_LINK_BTN_STYLE;
  const AUTH_ERR_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_ERR_STYLE;
  const AUTH_LABEL_STYLE = AUTH_MODAL_CONSTANT_STYLES.AUTH_LABEL_STYLE;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={authMode === "sign-in" ? "Sign In" : "Sign Up"}
      actions={actions}
    >
      <form
        onSubmit={onSubmit}
        style={AUTH_FORM_STYLE}
        autoComplete="on"
      >
        <div>
          {/* Email input */}
          <input
            ref={authModalRef}
            type="email"
            name="auth-email"
            placeholder="Email"
            value={authForm.email}
            onChange={onEmailChange}
            autoComplete="username"
            required
            style={AUTH_INPUT_STYLE}
            disabled={authLoading}
            tabIndex={1}
          />
        </div>
        <div>
          {/* Password input */}
          <input
            type="password"
            name="auth-password"
            placeholder="Password"
            value={authForm.password}
            onChange={onPasswordChange}
            autoComplete={authMode === "sign-in" ? "current-password" : "new-password"}
            required
            style={AUTH_INPUT_STYLE}
            disabled={authLoading}
            tabIndex={2}
          />
        </div>
        {(authLocalError || authError) && (
          <div style={AUTH_ERR_STYLE}>
            {authLocalError || authError}
          </div>
        )}
        <div style={AUTH_FLEX_ROW_STYLE}>
          {authMode === "sign-in" ? (
            <span style={AUTH_LABEL_STYLE}>
              Don't have an account?{" "}
              <button
                type="button"
                style={AUTH_LINK_BTN_STYLE}
                onClick={onSwitchMode.toSignUp}
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
                onClick={onSwitchMode.toSignIn}
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
