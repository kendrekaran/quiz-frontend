import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getReportQuizzes, getQuizReport } from "../../lib/api.js";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getGradeBadge(percentage) {
  if (percentage >= 80) return { label: "Excellent", className: "bg-green-500/20 text-green-400" };
  if (percentage >= 60) return { label: "Good", className: "bg-primary/20 text-primary" };
  if (percentage >= 40) return { label: "Average", className: "bg-amber-500/20 text-amber-400" };
  return { label: "Low", className: "bg-destructive/20 text-destructive" };
}

export default function Reports() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  useEffect(() => {
    async function loadQuizzes() {
      setLoading(true);
      const { quizzes: data, error: err } = await getReportQuizzes();
      setQuizzes(Array.isArray(data) ? data : []);
      setError(err);
      setLoading(false);
    }
    loadQuizzes();
  }, []);

  async function handleSelectQuiz(quizId) {
    if (selectedQuizId === quizId && report) {
      // Toggle off
      setSelectedQuizId(null);
      setReport(null);
      return;
    }

    setSelectedQuizId(quizId);
    setReport(null);
    setReportLoading(true);
    setReportError(null);

    const { report: data, error: err } = await getQuizReport(quizId);

    setReportLoading(false);

    if (err) {
      setReportError(err);
      toast.error(err);
      return;
    }

    setReport(data);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-card" />
        <div className="h-64 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Reports
        </p>
        <h1 className="display-font mt-2 text-3xl text-foreground sm:text-4xl">
          Quiz reports
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          View student performance across all your quizzes. Select a quiz to see detailed results with individual student scores.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {quizzes.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-border bg-background/30 p-8 text-center">
          <p className="text-sm font-medium text-foreground">No quizzes found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create some quizzes first, and student attempts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quiz list */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz) => {
              const isSelected = selectedQuizId === quiz.id;
              return (
                <button
                  key={quiz.id}
                  type="button"
                  onClick={() => handleSelectQuiz(quiz.id)}
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-card/85 hover:border-primary/40"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    {quiz.topic || "General"}
                  </p>
                  <h3 className="mt-1.5 truncate text-lg font-semibold text-foreground">
                    {quiz.name || "Untitled quiz"}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2.5 py-1">
                      {quiz.question_count} questions
                    </span>
                    <span className="rounded-full border border-border px-2.5 py-1">
                      {quiz.total_marks} marks
                    </span>
                    <span className="rounded-full border border-border px-2.5 py-1">
                      {quiz.attempt_count} {quiz.attempt_count === 1 ? "attempt" : "attempts"}
                    </span>
                  </div>
                  {quiz.class && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Class: {quiz.class}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected quiz report */}
          {selectedQuizId && (
            <div className="rounded-2xl border border-border bg-card/85 p-5 shadow-sm md:p-6">
              {reportLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading report...</p>
                  </div>
                </div>
              ) : reportError ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-destructive">{reportError}</p>
                </div>
              ) : !report ? null : (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="display-font text-xl font-semibold text-foreground">
                        {report.quiz?.name || "Quiz"} — Student results
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {report.quiz?.topic || "General"} &middot; {report.quiz?.question_count} questions &middot; {report.quiz?.total_marks} marks
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground">
                      {report.attempts?.length ?? 0} {(report.attempts?.length ?? 0) === 1 ? "student" : "students"}
                    </div>
                  </div>

                  {(!report.attempts || report.attempts.length === 0) ? (
                    <div className="rounded-xl border border-dashed border-border bg-background/30 p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No students have attempted this quiz yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              #
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Student
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Email
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Class
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Roll No.
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Score
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Percentage
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Grade
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              Submitted
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.attempts.map((attempt, index) => {
                            const grade = getGradeBadge(Number(attempt.percentage) || 0);
                            return (
                              <tr
                                key={attempt.attempt_id ?? `row-${index}`}
                                className="border-b border-border/50 transition-colors hover:bg-accent/50"
                              >
                                <td className="px-4 py-3 text-muted-foreground">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3 font-medium text-foreground">
                                  {attempt.student_name}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {attempt.student_email}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {attempt.student_class}
                                  {attempt.student_div ? ` - ${attempt.student_div}` : ""}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {attempt.student_roll_number || "-"}
                                </td>
                                <td className="px-4 py-3 font-semibold text-foreground">
                                  {attempt.score} / {attempt.total_marks}
                                </td>
                                <td className="px-4 py-3 font-semibold text-foreground">
                                  {attempt.percentage}%
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${grade.className}`}>
                                    {grade.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                  {formatDate(attempt.submitted_at)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Summary stats */}
                  {report.attempts && report.attempts.length > 0 && (
                    <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-4">
                      <div className="rounded-xl border border-border bg-background/60 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Average score
                        </p>
                        <p className="mt-2 text-lg font-bold text-foreground">
                          {(report.attempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / report.attempts.length).toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-background/60 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Highest score
                        </p>
                        <p className="mt-2 text-lg font-bold text-green-400">
                          {Math.max(...report.attempts.map((a) => Number(a.percentage || 0))).toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-background/60 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Lowest score
                        </p>
                        <p className="mt-2 text-lg font-bold text-destructive">
                          {Math.min(...report.attempts.map((a) => Number(a.percentage || 0))).toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-background/60 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Total students
                        </p>
                        <p className="mt-2 text-lg font-bold text-foreground">
                          {report.attempts.length}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
