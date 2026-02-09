import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { getSession } from "./lib/api.js";
import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import Analytics from "./pages/dashboard/Analytics.jsx";
import CreateQuiz from "./pages/dashboard/CreateQuiz.jsx";
import MyQuizzes from "./pages/dashboard/MyQuizzes.jsx";
import QuizDetail from "./pages/dashboard/QuizDetail.jsx";
import QuestionBank from "./pages/dashboard/QuestionBank.jsx";
import CreateStudent from "./pages/dashboard/CreateStudent.jsx";
import StudentTable from "./pages/dashboard/StudentTable.jsx";
import Settings from "./pages/dashboard/Settings.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <Toaster
        position="top-center"
        closeButton
        unstyled
        toastOptions={{
          classNames: {
            toast: "quizlab-toast",
            title: "quizlab-toast-title",
            description: "quizlab-toast-description",
            closeButton: "quizlab-toast-close",
            error: "quizlab-toast-error",
            success: "quizlab-toast-success",
          },
        }}
      />
    <BrowserRouter>
      <Routes>
      <Route path="/" element={getSession()?.access_token ? <Navigate to="/dashboard" replace /> : <App />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="create-quiz" element={<CreateQuiz />} />
        <Route path="my-quizzes" element={<Outlet />}>
          <Route index element={<MyQuizzes />} />
          <Route path=":quizId" element={<QuizDetail />} />
        </Route>
        <Route path="question-bank" element={<QuestionBank />} />
        <Route path="create-student" element={<CreateStudent />} />
        <Route path="students" element={<StudentTable />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);
