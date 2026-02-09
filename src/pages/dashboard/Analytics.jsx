import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { getQuizzes, getStudents } from "../../lib/api.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { DefaultBarChart } from "../../components/ui/default-bar-chart";
import { StudentsLineChart } from "../../components/ui/students-line-chart";

export default function Analytics() {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizChartView, setQuizChartView] = useState("days");
  const [studentChartView, setStudentChartView] = useState("days");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const [quizRes, studentRes] = await Promise.all([
        getQuizzes(),
        getStudents(),
      ]);
      if (cancelled) return;
      if (quizRes.error) {
        setError(quizRes.error);
        toast.error(quizRes.error);
        setQuizzes([]);
      } else {
        setQuizzes(quizRes.quizzes ?? []);
      }
      if (studentRes.error) {
        if (!cancelled && !quizRes.error) setError(studentRes.error);
        toast.error(studentRes.error);
        setStudents([]);
      } else {
        setStudents(studentRes.students ?? []);
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const totalQuestions = quizzes.reduce(
      (sum, q) => sum + (Array.isArray(q.questions) ? q.questions.length : 0),
      0
    );
    return {
      totalStudents: students.length,
      totalQuizzes: quizzes.length,
      totalQuestions,
    };
  }, [quizzes, students]);

  const quizzesByDay = useMemo(() => {
    const now = new Date();
    const days = 7;
    const byDay = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, {
        label: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        quizzes: 0,
      });
    }
    quizzes.forEach((q) => {
      const created = q.created_at;
      if (!created) return;
      const d = new Date(created);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      if (byDay.has(key)) {
        byDay.get(key).quizzes += 1;
      }
    });
    return Array.from(byDay.values());
  }, [quizzes]);

  const quizzesOverTime = useMemo(() => {
    const now = new Date();
    const byMonth = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth.set(key, {
        label: d.toLocaleDateString("en-US", { month: "short" }),
        quizzes: 0,
      });
    }
    quizzes.forEach((q) => {
      const created = q.created_at;
      if (!created) return;
      const d = new Date(created);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (byMonth.has(key)) {
        byMonth.get(key).quizzes += 1;
      }
    });
    return Array.from(byMonth.values());
  }, [quizzes]);

  const studentsByDay = useMemo(() => {
    const now = new Date();
    const days = 7;
    const byDay = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, {
        label: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        students: 0,
      });
    }
    students.forEach((s) => {
      const created = s.created_at;
      if (!created) return;
      const d = new Date(created);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      if (byDay.has(key)) {
        byDay.get(key).students += 1;
      }
    });
    return Array.from(byDay.values());
  }, [students]);

  const studentsOverTime = useMemo(() => {
    const now = new Date();
    const byMonth = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth.set(key, {
        label: d.toLocaleDateString("en-US", { month: "short" }),
        students: 0,
      });
    }
    students.forEach((s) => {
      const created = s.created_at;
      if (!created) return;
      const d = new Date(created);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (byMonth.has(key)) {
        byMonth.get(key).students += 1;
      }
    });
    return Array.from(byMonth.values());
  }, [students]);

  if (loading) {
    return <LoadingScreen variant="block" message="Loading analytics…" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-font text-2xl text-foreground md:text-3xl">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Performance insights, class distribution, and quiz activity.
        </p>
      </div>

      {error && (
        <div
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total students
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {stats.totalStudents}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total quizzes
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {stats.totalQuizzes}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total questions
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {stats.totalQuestions}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <DefaultBarChart
          data={quizChartView === "days" ? quizzesByDay : quizzesOverTime}
          totalQuizzes={stats.totalQuizzes}
          title="Quizzes created"
          description={quizChartView === "days" ? "Last 7 days" : "Last 6 months"}
          viewMode={quizChartView}
          onViewModeChange={setQuizChartView}
        />
        <StudentsLineChart
          data={studentChartView === "days" ? studentsByDay : studentsOverTime}
          totalStudents={stats.totalStudents}
          title="Students added"
          description={studentChartView === "days" ? "Last 7 days" : "Last 6 months"}
          viewMode={studentChartView}
          onViewModeChange={setStudentChartView}
        />
      </div>
    </div>
  );
}
