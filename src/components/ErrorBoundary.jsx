import { Component } from "react";

/**
 * React Error Boundary: catches JavaScript errors in the child tree
 * and renders a fallback UI. Use around app root or specific sections.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof this.props.onError === "function") {
      this.props.onError(error, errorInfo);
    }
    if (import.meta.env?.DEV) {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback({ error: this.state.error, retry: this.handleRetry })
          : this.props.fallback;
      }
      return (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-card p-8 text-center">
          <div className="rounded-full bg-red-500/20 p-3">
            <svg
              className="size-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="display-font text-xl text-foreground">
            Something went wrong
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {import.meta.env?.DEV && this.state.error?.message
              ? this.state.error.message
              : "An unexpected error occurred. Try refreshing the page."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Go home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
