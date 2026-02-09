import { useState, useCallback } from "react";

/**
 * Hook for managing alert dialog state.
 * 
 * @returns {Object} { alert, showAlert, hideAlert }
 *   - alert: { open, title, message, confirmText, cancelText, variant, onConfirm, onCancel }
 *   - showAlert: Function to show the alert
 *   - hideAlert: Function to hide the alert
 * 
 * @example
 * const { alert, showAlert } = useAlert();
 * 
 * const handleDelete = () => {
 *   showAlert({
 *     title: "Delete Student?",
 *     message: "This action cannot be undone.",
 *     variant: "destructive",
 *     confirmText: "Delete",
 *     onConfirm: async () => {
 *       await deleteStudent(id);
 *       hideAlert();
 *     },
 *   });
 * };
 */
export function useAlert() {
  const [alert, setAlert] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = useCallback((options) => {
    setAlert({
      open: true,
      title: options.title || "",
      message: options.message || "",
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel",
      variant: options.variant || "default",
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    hideAlert();
  }, [alert.onConfirm, hideAlert]);

  const handleCancel = useCallback(() => {
    if (alert.onCancel) {
      alert.onCancel();
    }
    hideAlert();
  }, [alert.onCancel, hideAlert]);

  return {
    alert: {
      ...alert,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    showAlert,
    hideAlert,
  };
}
