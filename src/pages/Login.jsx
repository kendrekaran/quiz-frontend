import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { getFriendlyErrorMessage } from "../lib/friendlyErrors.js";
import { studentLogin, setStudentSession } from "../lib/api.js";

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "teacher";
  const isTeacher = role === "teacher";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg === "session_expired") {
      toast.error("Your session has expired. Please sign in again.");
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("message");
        return next;
      }, { replace: true });
    } else if (msg === "setup_required") {
      toast.error("Please set up your password before continuing.");
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("message");
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    if (isTeacher) {
      await handleTeacherLogin(email, password);
    } else {
      await handleStudentLogin(email, password);
    }
  }

  async function handleTeacherLogin(email, password) {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    let res;
    try {
      res = await fetch(`${apiUrl}/api/auth/teacher/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      setLoading(false);
      const msg = getFriendlyErrorMessage(err?.message ?? "Cannot reach server.");
      setError(msg);
      toast.error(msg);
      return;
    }

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      const backendError = body.message || body.error;
      const msg = backendError || "Sign in failed. Check your email and password.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (body.access_token && body.refresh_token) {
      const session = {
        access_token: body.access_token,
        refresh_token: body.refresh_token,
        expires_at: body.expires_at,
        user: body.user,
      };
      try {
        localStorage.setItem("quizlab_teacher_session", JSON.stringify(session));
      } catch (_) {}
      setLoading(false);
      navigate("/dashboard", { replace: true });
      return;
    }

    setLoading(false);
    const msg = getFriendlyErrorMessage("Invalid response from server.");
    setError(msg);
    toast.error(msg);
  }

  async function handleStudentLogin(email, password) {
    const { session, error: loginError } = await studentLogin(email, password);

    if (loginError) {
      setLoading(false);
      setError(loginError);
      toast.error(loginError);
      return;
    }

    // Persist the student session (token + student info + password_set flag)
    setStudentSession(session);
    setLoading(false);

    if (!session.password_set) {
      // First-time login: force password setup
      navigate("/student/setup-password", { replace: true });
    } else {
      navigate("/student/dashboard", { replace: true });
    }
  }

  if (loading) {
    return <LoadingScreen variant="fullscreen" message="Signing in…" />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="grain-layer" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="mesh-orb -left-24 top-24" />
        <div className="mesh-orb mesh-orb--teal right-[-100px] top-[28rem]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pt-8 md:px-10">
        <header className="flex items-center justify-between">
          <a
            href="/"
            className="display-font text-2xl tracking-wide text-foreground transition-colors hover:text-primary"
          >
            QUIZLAB
          </a>
          <a
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            ← Back to home
          </a>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <div className="reveal reveal-1 w-full max-w-md">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-lg backdrop-blur">
              {/* Role toggle */}
              <div className="mb-6 flex rounded-xl border border-border bg-input p-1">
                <button
                  type="button"
                  onClick={() => navigate("/login?role=teacher", { replace: true })}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                    isTeacher
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login?role=student", { replace: true })}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                    !isTeacher
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Student
                </button>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {isTeacher ? "Teacher access" : "Student access"}
              </p>
              <h1 className="display-font mt-2 text-3xl text-foreground sm:text-4xl">
                {isTeacher ? "Sign in as teacher" : "Sign in as student"}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {isTeacher
                  ? "Use your teacher account to create quizzes, manage classes, and view analytics."
                  : "Enter your registered email and mobile number to sign in."}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    {error}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@school.edu"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {isTeacher ? "Password" : "Password"}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  {!isTeacher && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      First time? Use your mobile number as the password.
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                >
                  {loading ? "Signing in…" : isTeacher ? "Sign in as teacher" : "Sign in as student"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
