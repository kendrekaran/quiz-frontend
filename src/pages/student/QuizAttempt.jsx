import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getStudentQuizById, submitQuizAttempt } from "../../lib/api.js";
import AlertDialog from "../../components/AlertDialog.jsx";

function getOptionLetter(index) {
  return String.fromCharCode(65 + (index % 26));
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
  const startedAtRef = useRef(new Date().toISOString());

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
            </p>
          </div>

          <div className="flex items-center gap-3">
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
    </div>
  );
}
