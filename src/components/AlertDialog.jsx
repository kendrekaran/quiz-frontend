import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * AlertDialog component for confirmations and alerts.
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message/description
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {string} variant - "default" | "destructive" (default: "default")
 * @param {Function} onConfirm - Callback when confirm is clicked
 * @param {Function} onCancel - Callback when cancel is clicked or overlay is clicked
 */
export default function AlertDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (open) {
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const isDestructive = variant === "destructive";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel?.();
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {/* Content */}
        <div className="pr-8">
          <h2 className="display-font text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${
              isDestructive
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
