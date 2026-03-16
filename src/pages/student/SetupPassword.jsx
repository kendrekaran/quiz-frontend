import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import {
  getStudentSession,
  setStudentSession,
  clearStudentSession,
  studentSetupPassword,
} from "../../lib/api.js";

function PasswordStrengthBar({ password }) {
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= strength ? colors[strength] : "var(--border)",
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: strength > 0 ? colors[strength] : "var(--muted-foreground)" }}>
        {labels[strength]}
      </p>
    </div>
  );
}

export default function SetupPassword() {
  const navigate = useNavigate();
  const session = getStudentSession();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // If no student session, redirect to login
  if (!session?.token) {
    navigate("/login?role=student", { replace: true });
    return null;
  }

  // If already set up, redirect to dashboard
  if (session.password_set) {
    navigate("/student/dashboard", { replace: true });
    return null;
  }

  const studentName = session.student?.name ?? "Student";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { token, error: setupError } = await studentSetupPassword(session.token, password, confirm);

    if (setupError) {
      setLoading(false);
      setError(setupError);
      toast.error(setupError);
      return;
    }

    // Update session with new token and mark password_set = true
    setStudentSession({ ...session, token, password_set: true });
    setLoading(false);
    toast.success("Password set! Welcome to QuizLab.");
    navigate("/student/dashboard", { replace: true });
  }

  function handleLogout() {
    clearStudentSession();
    navigate("/login?role=student", { replace: true });
  }

  if (loading) {
    return <LoadingScreen variant="fullscreen" message="Setting up your password…" />;
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
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            ← Sign out
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <div className="reveal reveal-1 w-full max-w-md">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-lg backdrop-blur">
              {/* Icon / badge */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                One-time setup
              </p>
              <h1 className="display-font mt-2 text-3xl text-foreground sm:text-4xl">
                Set your password
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Hi <span className="font-medium text-foreground">{studentName}</span>! You're signed in
                for the first time. Create a secure password to protect your account. You won't be able
                to access QuizLab until this is done.
              </p>

              {/* Warning banner */}
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <p className="text-xs leading-relaxed text-amber-300">
                  This password replaces your mobile number as the login credential. Make sure to
                  remember it.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    {error}
                  </div>
                )}

                {/* New password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirm"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm"
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirm && (
                    <p
                      className="mt-1.5 text-xs"
                      style={{ color: password === confirm ? "#22c55e" : "#ef4444" }}
                    >
                      {password === confirm ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                >
                  {loading ? "Setting up…" : "Set password & continue"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
