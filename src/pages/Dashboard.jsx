import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import { getStoredSession } from "../components/ProtectedRoute";

const SESSION_KEY = "quizlab_teacher_session";

const navItems = [
  { to: "analytics", label: "Analytics", icon: "Chart" },
  { to: "create-quiz", label: "Create Quiz", icon: "Plus" },
  { to: "my-quizzes", label: "My Quizzes", icon: "List" },
  { to: "question-bank", label: "Question Bank", icon: "Database" },
  { to: "create-student", label: "Create Student", icon: "UserPlus" },
  { to: "students", label: "Student Table", icon: "Table" },
];

function SidebarIcon({ name }) {
  const icons = {
    Chart: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    Plus: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    List: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    Database: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    Settings: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    UserPlus: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    Table: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  };
  return icons[name] ?? null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const userEmail = session?.user?.email ?? "Teacher";

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    navigate("/login?role=teacher", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <span className="display-font text-lg tracking-wide text-foreground">QUIZLAB</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "analytics"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <SidebarIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-3 py-1 text-xs text-muted-foreground" title={userEmail}>
            {userEmail}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="grain-layer" aria-hidden="true" />
        <div className="relative min-h-full p-6 md:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
