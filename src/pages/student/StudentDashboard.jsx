import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  clearStudentSession,
  getStudentAttempts,
  getStudentQuizzes,
  getStudentSession,
} from "../../lib/api.js";
import AlertDialog from "../../components/AlertDialog.jsx";
import { useAlert } from "../../hooks/useAlert.js";

function formatDate(value) {
  if (!value) return "Recently added";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeQuestionCount(quiz) {
  if (Number.isFinite(Number(quiz?.question_count)) && Number(quiz.question_count) >= 0) {
    return Number(quiz.question_count);
  }

  return Array.isArray(quiz?.questions) ? quiz.questions.length : 0;
}

function normalizeTotalMarks(quiz) {
  if (Number.isFinite(Number(quiz?.total_marks)) && Number(quiz.total_marks) >= 0) {
    return Number(quiz.total_marks);
  }

  if (!Array.isArray(quiz?.questions)) return 0;
  return quiz.questions.reduce((sum, question) => {
    const marks = Number(question?.marks);
    return sum + (Number.isFinite(marks) && marks > 0 ? marks : 1);
  }, 0);
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const session = getStudentSession();
  const student = session?.student;
  const { alert, showAlert } = useAlert();

  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  async function loadData(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    // Load quizzes and attempts in parallel
    const [quizzesResult, attemptsResult] = await Promise.all([
      getStudentQuizzes(),
      getStudentAttempts(),
    ]);

    const safeQuizzes = Array.isArray(quizzesResult.quizzes) ? quizzesResult.quizzes : [];
    const safeAttempts = Array.isArray(attemptsResult.attempts) ? attemptsResult.attempts : [];

    setQuizzes(safeQuizzes);
    setAttempts(safeAttempts);
    setError(quizzesResult.error ?? null);

    if (quizzesResult.error && isRefresh) {
      toast.error(quizzesResult.error);
    }

    setLoading(false);
    setRefreshing(false);

    return { error: quizzesResult.error ?? null };
  }

  useEffect(() => {
    loadData(false);
  }, []);

  // Build a map of quiz_id -> attempt for fast lookup
  const attemptsMap = useMemo(() => {
    const map = new Map();
    for (const attempt of attempts) {
      map.set(attempt.quiz_id, attempt);
    }
    return map;
  }, [attempts]);

  const totalQuestions = useMemo(
    () => quizzes.reduce((sum, quiz) => sum + normalizeQuestionCount(quiz), 0),
    [quizzes]
  );

  const totalMarks = useMemo(
    () => quizzes.reduce((sum, quiz) => sum + normalizeTotalMarks(quiz), 0),
    [quizzes]
  );

  const completedCount = attempts.length;

  function handleLogout() {
    clearStudentSession();
    navigate("/login?role=student", { replace: true });
  }

  async function handleRefresh() {
    const result = await loadData(true);
    if (result?.error) return;
    toast.success("Quiz list updated");
  }

  function handleStartQuiz(quiz) {
    const attempt = attemptsMap.get(quiz.id);

    if (attempt) {
      // Already attempted — view result
      navigate(`/student/quiz/${quiz.id}/result`);
      return;
    }

    // Show confirmation dialog before starting
    const timeLimitMsg = quiz.time_limit
      ? ` You will have ${quiz.time_limit} minute${quiz.time_limit === 1 ? "" : "s"} to complete it, and the quiz will be auto-submitted when time runs out.`
      : "";
    showAlert({
      title: "Start quiz?",
      message: `You are about to start "${quiz.name || "this quiz"}". Once you start, the quiz will open in full screen mode. You can only attempt this quiz once.${timeLimitMsg} Are you sure you want to begin?`,
      confirmText: "Start quiz",
      cancelText: "Cancel",
      variant: "default",
      onConfirm: () => {
        navigate(`/student/quiz/${quiz.id}/attempt`);
      },
    });
  }

  function handleViewResult(quizId) {
    navigate(`/student/quiz/${quizId}/result`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="grain-layer" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="mesh-orb -left-24 top-24" />
        <div className="mesh-orb mesh-orb--teal right-[-100px] top-[28rem]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pt-8 md:px-10">
        <header className="flex flex-col gap-6 border-b border-border/70 pb-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Student portal
            </p>
            <h1 className="display-font mt-2 text-4xl text-foreground sm:text-5xl">
              Welcome, {student?.name ?? "Student"}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Browse your assigned quizzes. Each quiz can only be attempted once. Choose wisely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Student name
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">{student?.name ?? "-"}</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Class
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              {student?.class ? `${student.class}${student?.div ? ` - ${student.div}` : ""}` : "General"}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Available quizzes
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">{quizzes.length}</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Completed
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              {completedCount} / {quizzes.length}
            </p>
          </article>
        </section>

        <section className="pb-10">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-56 animate-pulse rounded-3xl border border-border bg-card/75"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/30 p-8 text-center">
              <p className="text-lg font-semibold text-foreground">Could not load quizzes</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {error}
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Try again
              </button>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/30 p-8 text-center">
              <p className="text-sm font-medium text-foreground">No quizzes available yet</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your teacher has not published any quizzes for your class yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="display-font text-2xl text-foreground">Your quizzes</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Each quiz can only be attempted once. Review the details before starting.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {quizzes.map((quiz, index) => {
                  const attempt = attemptsMap.get(quiz.id);
                  const isAttempted = !!attempt;
                  const questionCount = normalizeQuestionCount(quiz);
                  const quizMarks = normalizeTotalMarks(quiz);

                  return (
                    <article
                      key={quiz.id ?? `quiz-${index}`}
                      className={`rounded-3xl border p-5 shadow-sm ${
                        isAttempted
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-border bg-card/85"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            {quiz.topic?.trim() || "General topic"}
                          </p>
                          <h3 className="mt-2 truncate text-xl font-semibold text-foreground">
                            {quiz.name || "Untitled quiz"}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {questionCount} {questionCount === 1 ? "Q" : "Qs"}
                          </span>
                          {isAttempted && (
                            <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-green-400">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {quiz.description?.trim() || "No description provided for this quiz."}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-border bg-background/60 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Total marks
                          </p>
                          <p className="mt-2 text-lg font-semibold text-foreground">{quizMarks}</p>
                        </div>
                        {isAttempted ? (
                          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Your score
                            </p>
                            <p className="mt-2 text-lg font-semibold text-green-400">
                              {attempt.score} / {attempt.total_marks}
                              <span className="ml-1.5 text-sm">({attempt.percentage}%)</span>
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-border bg-background/60 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Published
                            </p>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                              {formatDate(quiz.created_at)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>{quiz.class?.trim() || "All classes"}</span>
                        <div className="flex items-center gap-2">
                          {quiz.time_limit && (
                            <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                              <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {quiz.time_limit} min
                            </span>
                          )}
                          <span>{questionCount} questions</span>
                        </div>
                      </div>

                      {isAttempted ? (
                        <button
                          type="button"
                          onClick={() => handleViewResult(quiz.id)}
                          className="mt-6 w-full rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20"
                        >
                          View result
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartQuiz(quiz)}
                          className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                          Start quiz
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-4 text-sm text-muted-foreground">
                {totalQuestions} total questions across all available quizzes &middot; {completedCount} of {quizzes.length} completed
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Alert dialog for start quiz confirmation */}
      <AlertDialog {...alert} />
    </main>
  );
}
