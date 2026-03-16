import { Navigate, useLocation } from "react-router-dom";
import { getStudentSession } from "../lib/api.js";

/**
 * Guards routes that require a valid, fully-set-up student session.
 *
 * - No session → redirect to /login?role=student
 * - Session exists but password not yet set → redirect to /student/setup-password
 * - Session valid + password set → render children
 */
export default function StudentProtectedRoute({ children }) {
  const location = useLocation();
  const session = getStudentSession();

  if (!session?.token) {
    return (
      <Navigate
        to="/login?role=student"
        state={{ from: location }}
        replace
      />
    );
  }

  if (!session.password_set) {
    return <Navigate to="/student/setup-password" replace />;
  }

  return children;
}
