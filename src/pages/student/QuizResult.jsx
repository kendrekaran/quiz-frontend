import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuizResult } from "../../lib/api.js";

function getOptionLetter(index) {
  return String.fromCharCode(65 + (index % 26));
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getGradeColor(percentage) {
  if (percentage >= 80) return "text-green-400";
  if (percentage >= 60) return "text-primary";
  if (percentage >= 40) return "text-amber-400";
  return "text-destructive";
}

function getGradeLabel(percentage) {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 80) return "Very Good";
  if (percentage >= 70) return "Good";
  if (percentage >= 60) return "Above Average";
  if (percentage >= 50) return "Average";
  if (percentage >= 40) return "Below Average";
  return "Needs Improvement";
}

export default function QuizResult() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Result can come from navigation state (just submitted) or be fetched from API
  const [result, setResult] = useState(location.state?.result ?? null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result) return;

    async function fetchResult() {
      setLoading(true);
      const { result: fetchedResult, error: fetchError } = await getQuizResult(quizId);
      setLoading(false);

      if (fetchError) {
        setError(fetchError);
        return;
      }

      setResult(fetchedResult);
    }

    fetchResult();
  }, [quizId, result]);

  // Exit fullscreen if still active
  useEffect(() => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (_) {}
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="mx-auto max-w-md text-center">
          <p className="text-lg font-semibold text-foreground">Could not load results</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/student/dashboard", { replace: true })}
            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const score = Number(result.score) || 0;
  const totalMarks = Number(result.total_marks) || 0;
  const percentage = Number(result.percentage) || 0;
  const gradedAnswers = Array.isArray(result.graded_answers) ? result.graded_answers : [];
  const questions = Array.isArray(result.questions) ? result.questions : [];

  // Build a map of questions by id for option lookup
  const questionsMap = new Map();
  for (const q of questions) {
    questionsMap.set(q.id, q);
  }

  const correctCount = gradedAnswers.filter((a) => a.is_correct).length;
  const incorrectCount = gradedAnswers.filter((a) => !a.is_correct && a.selected_option_id).length;
  const skippedCount = gradedAnswers.filter((a) => !a.selected_option_id).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="grain-layer" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="mesh-orb -left-24 top-24" />
        <div className="mesh-orb mesh-orb--teal right-[-100px] top-[28rem]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-10">
        {/* Score card */}
        <div className="rounded-3xl border border-border bg-card/90 p-6 text-center shadow-lg md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Quiz completed
          </p>
          <h1 className="display-font mt-2 text-3xl text-foreground sm:text-4xl">
            {result.quiz_name || "Quiz"}
          </h1>
          {result.quiz_topic && (
            <p className="mt-1 text-sm text-muted-foreground">{result.quiz_topic}</p>
          )}

          <div className="mt-8 flex flex-col items-center gap-2">
            <p className={`display-font text-6xl font-bold sm:text-7xl ${getGradeColor(percentage)}`}>
              {percentage}%
            </p>
            <p className={`text-lg font-semibold ${getGradeColor(percentage)}`}>
              {getGradeLabel(percentage)}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Score
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {score} / {totalMarks}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Correct
              </p>
              <p className="mt-2 text-xl font-bold text-green-400">{correctCount}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Incorrect
              </p>
              <p className="mt-2 text-xl font-bold text-destructive">{incorrectCount}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Skipped
              </p>
              <p className="mt-2 text-xl font-bold text-amber-400">{skippedCount}</p>
            </div>
          </div>

          {result.submitted_at && (
            <p className="mt-6 text-xs text-muted-foreground">
              Submitted on {formatDate(result.submitted_at)}
            </p>
          )}
        </div>

        {/* Detailed answer review */}
        <div className="mt-8 space-y-5">
          <h2 className="display-font text-2xl text-foreground">Answer review</h2>

          {gradedAnswers.map((ga, index) => {
            const question = questionsMap.get(ga.question_id);
            const options = Array.isArray(question?.options) ? question.options : [];
            const marks = Number(ga.marks) || 1;

            return (
              <div
                key={ga.question_id ?? `ga-${index}`}
                className={`rounded-2xl border p-5 shadow-sm md:p-6 ${
                  ga.is_correct
                    ? "border-green-500/30 bg-green-500/5"
                    : ga.selected_option_id
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Question {index + 1}
                      </span>
                      {ga.is_correct ? (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-400">
                          Correct
                        </span>
                      ) : ga.selected_option_id ? (
                        <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive">
                          Incorrect
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400">
                          Skipped
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-base font-medium leading-relaxed text-foreground">
                      {ga.question_text || `Question ${index + 1}`}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                    {ga.is_correct ? `+${marks}` : "0"} / {marks}
                  </span>
                </div>

                <ul className="mt-4 grid gap-2">
                  {options.map((opt, oIndex) => {
                    const isSelected = ga.selected_option_id === opt.id;
                    const isCorrectOption = ga.correct_option_id === opt.id;

                    let borderClass = "border-border bg-background/70";
                    if (isCorrectOption) {
                      borderClass = "border-green-500/50 bg-green-500/10";
                    } else if (isSelected && !ga.is_correct) {
                      borderClass = "border-destructive/50 bg-destructive/10";
                    }

                    return (
                      <li
                        key={opt.id ?? `opt-${index}-${oIndex}`}
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${borderClass}`}
                      >
                        <span
                          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                            isCorrectOption
                              ? "border-green-500 bg-green-500 text-white"
                              : isSelected
                                ? "border-destructive bg-destructive text-white"
                                : "border-border text-muted-foreground"
                          }`}
                        >
                          {getOptionLetter(oIndex)}
                        </span>
                        <span className="flex-1 text-sm leading-relaxed text-foreground">
                          {opt.text || `Option ${oIndex + 1}`}
                        </span>
                        {isCorrectOption && (
                          <span className="shrink-0 text-xs font-semibold text-green-400">
                            Correct answer
                          </span>
                        )}
                        {isSelected && !isCorrectOption && (
                          <span className="shrink-0 text-xs font-semibold text-destructive">
                            Your answer
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Back button */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => navigate("/student/dashboard", { replace: true })}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
