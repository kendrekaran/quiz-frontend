import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { getQuizzes } from "../../lib/api";

export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getQuizzes().then(({ quizzes: list, error: err }) => {
      if (cancelled) return;
      setQuizzes(list ?? []);
      setError(err ?? null);
      if (err) toast.error(err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <h1 className="display-font text-2xl text-foreground md:text-3xl">
        My Quizzes
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage, edit, and view your saved quizzes.
      </p>

      {loading && (
        <LoadingScreen variant="block" message="Loading quizzes…" />
      )}

      {error && !loading && (
        <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-red-400">{error}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Make sure you are logged in and the backend is running.
          </p>
        </div>
      )}

      {!loading && !error && quizzes.length === 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-8">
          <p className="text-muted-foreground">
            No quizzes yet. Create your first quiz to see it here.
          </p>
          <Link
            to="/dashboard/create-quiz"
            className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Create Quiz
          </Link>
        </div>
      )}

      {!loading && !error && quizzes.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link
                to={`/dashboard/my-quizzes/${quiz.id}`}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-card/80"
              >
                <h2 className="display-font text-lg text-foreground">
                  {quiz.name || "Untitled Quiz"}
                </h2>
                {quiz.topic && (
                  <span className="mt-2 inline-block rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {quiz.topic}
                  </span>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  {quiz.questions?.length ?? 0} questions
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
