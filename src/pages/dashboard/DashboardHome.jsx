import { Link } from "react-router-dom";
import { getStoredSession } from "../../components/ProtectedRoute";

export default function DashboardHome() {
  const session = getStoredSession();
  const email = session?.user?.email ?? "Teacher";

  return (
    <div>
      <h1 className="display-font text-2xl text-foreground md:text-3xl">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {email}. Use the sidebar to create quizzes, view analytics, or manage classes.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/dashboard/create-quiz"
          className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-muted"
        >
          <span className="text-lg font-semibold text-foreground">Create Quiz</span>
          <p className="mt-1 text-sm text-muted-foreground">
            Build a new quiz with AI-generated questions
          </p>
        </Link>
        <Link
          to="/dashboard/analytics"
          className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-muted"
        >
          <span className="text-lg font-semibold text-foreground">Analytics</span>
          <p className="mt-1 text-sm text-muted-foreground">
            View performance and insights
          </p>
        </Link>
      </div>
    </div>
  );
}
