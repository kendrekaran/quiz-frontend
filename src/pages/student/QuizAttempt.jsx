import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getStudentQuizById, submitQuizAttempt } from "../../lib/api.js";
import AlertDialog from "../../components/AlertDialog.jsx";

function getOptionLetter(index) {
  return String.fromCharCode(65 + (index % 26));
}

/**
 * Format seconds into MM:SS or HH:MM:SS.
 */
function formatTime(totalSeconds) {
  if (totalSeconds <= 0) return "00:00";
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null); // null = no timer
  const startedAtRef = useRef(new Date().toISOString());
  const autoSubmitTriggeredRef = useRef(false);

  // Request fullscreen on mount
  useEffect(() => {
    async function enterFullscreen() {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        }
      } catch (_) {
        // Fullscreen may be blocked by browser — not critical
      }
    }
    enterFullscreen();

    return () => {
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (document.webkitFullscreenElement) {
          document.webkitExitFullscreen?.();
        }
      } catch (_) {}
    };
  }, []);

  // Warn before leaving the page
  useEffect(() => {
    function handleBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Load quiz
  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      const { quiz: fetchedQuiz, error: fetchError } = await getStudentQuizById(quizId);
      setLoading(false);

      if (fetchError) {
        // If already attempted, redirect to result
        if (fetchError.includes("already attempted") || fetchError.includes("Already attempted")) {
          toast.error("You have already attempted this quiz.");
          navigate(`/student/quiz/${quizId}/result`, { replace: true });
          return;
        }
        setError(fetchError);
        return;
      }

      setQuiz(fetchedQuiz);
    }
    loadQuiz();
  }, [quizId, navigate]);

  // Initialize and run the countdown timer when quiz has a time_limit
  useEffect(() => {
    if (!quiz?.time_limit) {
      setRemainingSeconds(null);
      return;
    }

    const timeLimitMs = quiz.time_limit * 60 * 1000;
    const startTime = new Date(startedAtRef.current).getTime();

    function tick() {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((timeLimitMs - elapsed) / 1000));
      setRemainingSeconds(remaining);
      return remaining;
    }

    // Set initial value
    tick();

    const intervalId = setInterval(() => {
      const remaining = tick();
      if (remaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [quiz?.time_limit]);

  // Auto-submit when timer reaches zero
  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmitTriggeredRef.current || submitting) return;
    autoSubmitTriggeredRef.current = true;

    setShowSubmitConfirm(false);
    setShowExitConfirm(false);
    setShowTimeUpDialog(true);

    // Small delay so the student sees the "time's up" message
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitting(true);
    const formattedAnswers = (Array.isArray(quiz?.questions) ? quiz.questions : []).map((q) => ({
      question_id: q.id,
      selected_option_id: answers[q.id] ?? null,
    }));

    const { result, error: submitError, already_attempted } = await submitQuizAttempt(quizId, {
      answers: formattedAnswers,
      started_at: startedAtRef.current,
    });

    setSubmitting(false);
    setShowTimeUpDialog(false);

    if (already_attempted) {
      toast.error("You have already submitted this quiz.");
      navigate(`/student/quiz/${quizId}/result`, { replace: true });
      return;
    }

    if (submitError) {
      toast.error(submitError);
      return;
    }

    toast.info("Time is up! Your quiz has been auto-submitted.");
    navigate(`/student/quiz/${quizId}/result`, {
      replace: true,
      state: { result },
    });
  }, [quiz, answers, quizId, navigate, submitting]);

  useEffect(() => {
    if (remainingSeconds === 0 && quiz?.time_limit && !autoSubmitTriggeredRef.current) {
      handleAutoSubmit();
    }
  }, [remainingSeconds, quiz?.time_limit, handleAutoSubmit]);

  const questions = useMemo(() => {
    return Array.isArray(quiz?.questions) ? quiz.questions : [];
  }, [quiz]);

  const totalMarks = useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
  }, [questions]);

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  function selectOption(questionId, optionId) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    setShowSubmitConfirm(false);
    setSubmitting(true);

    const formattedAnswers = questions.map((q) => ({
      question_id: q.id,
      selected_option_id: answers[q.id] ?? null,
    }));

    const { result, error: submitError, already_attempted } = await submitQuizAttempt(quizId, {
      answers: formattedAnswers,
      started_at: startedAtRef.current,
    });

    setSubmitting(false);

    if (already_attempted) {
      toast.error("You have already submitted this quiz.");
      navigate(`/student/quiz/${quizId}/result`, { replace: true });
      return;
    }

    if (submitError) {
      toast.error(submitError);
      return;
    }

    // Navigate to result page with the result data
    navigate(`/student/quiz/${quizId}/result`, {
      replace: true,
      state: { result },
    });
  }

  function handleExit() {
    setShowExitConfirm(true);
  }

  function confirmExit() {
    setShowExitConfirm(false);
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (_) {}
    navigate("/student/dashboard", { replace: true });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="mx-auto max-w-md text-center">
          <p className="text-lg font-semibold text-foreground">Could not load quiz</p>
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="min-w-0">
            <h1 className="display-font truncate text-lg font-semibold text-foreground sm:text-xl">
              {quiz?.name || "Quiz"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {quiz?.topic || "General"} &middot; {questions.length} questions &middot; {totalMarks} marks
              {quiz?.time_limit ? ` \u00b7 ${quiz.time_limit} min` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown timer */}
            {remainingSeconds != null && (
              <div
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold tabular-nums transition-colors ${
                  remainingSeconds <= 60
                    ? "animate-pulse border-destructive/50 bg-destructive/10 text-destructive"
                    : remainingSeconds <= 300
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                      : "border-primary/50 bg-primary/10 text-primary"
                }`}
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(remainingSeconds)}
              </div>
            )}

            <div className="hidden text-right text-xs text-muted-foreground sm:block">
              <p>
                <span className="font-semibold text-primary">{answeredCount}</span> / {questions.length} answered
              </p>
              {unansweredCount > 0 && (
                <p className="text-amber-500">{unansweredCount} unanswered</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleExit}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
            >
              Exit
            </button>

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              disabled={submitting}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit quiz"}
            </button>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
        />
      </div>

      {/* Questions */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm font-medium text-foreground">This quiz has no questions</p>
          </div>
        ) : (
          <ol className="space-y-6">
            {questions.map((question, qIndex) => {
              const options = Array.isArray(question.options) ? question.options : [];
              const marks = Number(question.marks) || 1;
              const selectedOptionId = answers[question.id] ?? null;

              return (
                <li
                  key={question.id ?? `q-${qIndex}`}
                  className="rounded-2xl border border-border bg-card/85 p-5 shadow-sm md:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Question {qIndex + 1}
                      </span>
                      <p className="mt-2 text-base font-medium leading-relaxed text-foreground md:text-lg">
                        {question.text || `Question ${qIndex + 1}`}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                      {marks} {marks === 1 ? "mark" : "marks"}
                    </span>
                  </div>

                  <ul className="mt-5 grid gap-3">
                    {options.map((option, oIndex) => {
                      const isSelected = selectedOptionId === option.id;
                      return (
                        <li key={option.id ?? `opt-${qIndex}-${oIndex}`}>
                          <button
                            type="button"
                            onClick={() => selectOption(question.id, option.id)}
                            className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                : "border-border bg-background/70 hover:border-primary/40 hover:bg-primary/5"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {getOptionLetter(oIndex)}
                            </span>
                            <span className="text-sm leading-relaxed text-foreground md:text-[15px]">
                              {option.text || `Option ${oIndex + 1}`}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ol>
        )}

        {/* Bottom submit area */}
        {questions.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-card/85 p-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{answeredCount}</span> of{" "}
                <span className="font-semibold">{questions.length}</span> questions answered
                {unansweredCount > 0 && (
                  <span className="ml-2 text-amber-500">({unansweredCount} unanswered)</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={submitting}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit quiz"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Submit confirmation dialog */}
      <AlertDialog
        open={showSubmitConfirm}
        title="Submit quiz?"
        message={
          unansweredCount > 0
            ? `You have ${unansweredCount} unanswered question${unansweredCount === 1 ? "" : "s"}. Once submitted, you cannot retake this quiz. Are you sure you want to submit?`
            : "Once submitted, you cannot retake this quiz. Are you sure you want to submit your answers?"
        }
        confirmText="Submit"
        cancelText="Keep working"
        variant={unansweredCount > 0 ? "destructive" : "default"}
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />

      {/* Exit confirmation dialog */}
      <AlertDialog
        open={showExitConfirm}
        title="Exit quiz?"
        message="Your progress will be lost if you exit now. The quiz has not been submitted. Are you sure you want to leave?"
        confirmText="Exit"
        cancelText="Stay"
        variant="destructive"
        onConfirm={confirmExit}
        onCancel={() => setShowExitConfirm(false)}
      />

      {/* Time's up auto-submit dialog */}
      <AlertDialog
        open={showTimeUpDialog}
        title="Time's up!"
        message="The time limit has expired. Your answers are being submitted automatically..."
        confirmText=""
        cancelText=""
        variant="destructive"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    </div>
  );
}
