/**
 * Minimal loading screen. Use for page-level or section-level loading states.
 * @param {Object} props
 * @param {"fullscreen" | "block"} [props.variant="fullscreen"] - fullscreen fills viewport; block fits container
 * @param {string} [props.message] - optional short label below spinner
 */
export default function LoadingScreen({ variant = "fullscreen", message }) {
  const isFullscreen = variant === "fullscreen";

  return (
    <div className="flex flex-col items-center justify-center  min-h-screen">
    <div
      className={`flex flex-col items-center justify-center gap-4 text-muted-foreground ${
        isFullscreen ? "fixed inset-0 z-20 bg-background" : "min-h-[200px] py-12"
      }`}
      role="status"
      aria-live="polite"
      aria-label={message ?? "Loading"}
    >
      <div
        className="size-8 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden
      />
      {message && (
        <p className="text-sm">{message}</p>
      )}
    </div>
    </div>
  );
}
