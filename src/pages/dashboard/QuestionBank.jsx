import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getQuizzes } from "../../lib/api.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

/**
 * Flatten all questions from all quizzes with quiz context.
 * Each item: { ...question, quizId, quizName, topic }.
 */
function flattenQuestions(quizzes) {
  if (!Array.isArray(quizzes)) return [];
  const out = [];
  for (const quiz of quizzes) {
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    const quizName = quiz.name || "Untitled quiz";
    const topic = quiz.topic || "";
    for (const q of questions) {
      out.push({
        ...q,
        quizId: quiz.id,
        quizName,
        topic,
      });
    }
  }
  return out;
}

export default function QuestionBank() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicFilter, setTopicFilter] = useState("__all__");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const res = await getQuizzes();
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
        setQuizzes([]);
      } else {
        setQuizzes(res.quizzes ?? []);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const allQuestions = useMemo(() => flattenQuestions(quizzes), [quizzes]);

  const topics = useMemo(() => {
    const set = new Set();
    allQuestions.forEach((q) => {
      if (q.topic && String(q.topic).trim()) set.add(String(q.topic).trim());
    });
    return Array.from(set).sort();
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    let list = allQuestions;
    if (topicFilter && topicFilter !== "__all__") {
      list = list.filter((q) => String(q.topic || "").trim() === topicFilter);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (q) =>
          (q.text && q.text.toLowerCase().includes(term)) ||
          (q.quizName && q.quizName.toLowerCase().includes(term))
      );
    }
    return list;
  }, [allQuestions, topicFilter, search]);

  function handleUseInNewQuiz(question) {
    const { quizId, quizName, ...q } = question;
    navigate("/dashboard/create-quiz", {
      state: { addQuestion: { ...q, id: undefined } },
    });
  }

  if (loading) {
    return <LoadingScreen variant="block" message="Loading question bank…" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-font text-2xl text-foreground md:text-3xl">
          Question Bank
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse questions from your quizzes. Use one in a new quiz to copy it over.
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

      <div className="flex w-fit items-center gap-3">
        <input
          type="text"
          placeholder="Search by question or quiz name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[250px] flex-1 max-w-sm rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger
            className="h-9 w-fit border-border bg-input text-foreground"
            aria-label="Filter by topic"
          >
            <SelectValue placeholder="All topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All topics</SelectItem>
            {topics.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {allQuestions.length === 0
              ? "No questions yet. Create a quiz to add questions."
              : "No questions match your filters."}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredQuestions.map((q) => (
              <li
                key={`${q.quizId}-${q.id}`}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{q.text || "—"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {q.quizName}
                    {q.topic ? ` · ${q.topic}` : ""} · {q.marks ?? 1} mark{q.marks !== 1 ? "s" : ""}
                  </p>
                  {Array.isArray(q.options) && q.options.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {q.options.map((opt) => (
                        <li key={opt.id}>
                          {opt.isCorrect ? (
                            <span className="text-chart-2">✓ {opt.text}</span>
                          ) : (
                            <span>· {opt.text}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUseInNewQuiz(q)}
                    className="rounded-lg border border-chart-2/50 bg-chart-2/10 px-3 py-1.5 text-xs font-semibold text-chart-2 transition-colors hover:bg-chart-2/20"
                  >
                    Use in new quiz
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
