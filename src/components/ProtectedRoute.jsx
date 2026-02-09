import { Navigate, useLocation } from "react-router-dom";

const SESSION_KEY = "quizlab_teacher_session";

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const session = getStoredSession();

  if (!session?.access_token) {
    return <Navigate to="/login?role=teacher" state={{ from: location }} replace />;
  }

  return children;
}
