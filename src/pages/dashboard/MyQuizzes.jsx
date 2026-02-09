import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import AlertDialog from "../../components/AlertDialog.jsx";
import { useAlert } from "../../hooks/useAlert.js";
import { getQuizzes, deleteQuiz } from "../../lib/api";
import { Trash2 } from "lucide-react";

export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { alert, showAlert } = useAlert();

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

  const handleDelete = (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();

    showAlert({
      title: "Delete Quiz?",
      message: `Are you sure you want to delete "${name || "this quiz"}"? This action cannot be undone.`,
      variant: "destructive",
      confirmText: "Delete",
      onConfirm: async () => {
        setDeletingId(id);
        const { error: err } = await deleteQuiz(id);
        setDeletingId(null);

        if (err) {
          toast.error(err);
          return;
        }

        toast.success("Quiz deleted successfully");
        setQuizzes((prev) => prev.filter((q) => q.id !== id));
      },
    });
  };

  return (
    <div>
      <AlertDialog {...alert} />
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
            <li key={quiz.id} className="relative">
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
              <button
                onClick={(e) => handleDelete(quiz.id, quiz.name, e)}
                disabled={deletingId === quiz.id}
                className="absolute cursor-pointer right-3 top-3 rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Delete ${quiz.name || "quiz"}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
