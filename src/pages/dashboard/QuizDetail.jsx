import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { getQuizById } from "../../lib/api";

export default function QuizDetail() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quizId) {
      setQuiz(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getQuizById(quizId).then(({ quiz: data, error: err, status }) => {
      if (cancelled) return;
      setQuiz(data ?? null);
      const message = status === 401 ? "Your session has expired. Please sign in again." : (err ?? null);
      setError(message);
      if (message) toast.error(message);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [quizId]);

  if (loading) {
    return <LoadingScreen variant="block" message="Loading quiz…" />;
  }

  if (error || !quiz) {
    return (
      <div>
        <p className="text-muted-foreground">{error || "Quiz not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-quizzes")}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Back to My Quizzes
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/dashboard/my-quizzes")}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Quizzes
      </button>

      {/* Quiz details at top */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <h1 className="display-font text-2xl text-foreground md:text-3xl">
          {quiz.name || "Untitled Quiz"}
        </h1>
        {quiz.description && (
          <p className="mt-2 text-sm text-muted-foreground">{quiz.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4">
          {quiz.class && (
            <span className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Class: {quiz.class}
            </span>
          )}
          {quiz.topic && (
            <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              Topic: {quiz.topic}
            </span>
          )}
        </div>
      </div>

      {/* Questions and options below */}
      <div className="mt-8">
        <h2 className="display-font mb-4 text-xl text-foreground">Questions</h2>
        <ul className="space-y-6">
          {quiz.questions?.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              No questions in this quiz.
            </li>
          )}
          {quiz.questions?.map((q, index) => (
            <li
              key={q.id}
              className="rounded-2xl border border-border bg-card p-5 md:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-foreground">
                  Q{index + 1}. {q.text || "Untitled question"}
                </p>
                <span className="flex-shrink-0 rounded-lg bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">
                  {q.marks} {q.marks === 1 ? "mark" : "marks"}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {q.options?.map((opt) => (
                  <li
                    key={opt.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${
                      opt.isCorrect
                        ? "border-chart-2/50 bg-chart-2/10 text-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {opt.isCorrect && (
                      <span className="flex-shrink-0 rounded-full bg-chart-2 px-2 py-0.5 text-xs font-bold text-primary-foreground">
                        Correct
                      </span>
                    )}
                    <span>{opt.text || "(Empty option)"}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
