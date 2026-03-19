import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { createQuiz as createQuizApi } from "../../lib/api";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { createNewQuestion, createNewOption } from "../../lib/quizStorage";

const DEFAULT_QUIZ = {
  name: "",
  description: "",
  class: "",
  topic: "",
  time_limit: "",
};

function cloneQuestionFromBank(question) {
  const id = crypto.randomUUID?.() ?? `q-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const options = (question.options || []).map((o) => ({
    id: `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: o.text ?? "",
    isCorrect: Boolean(o.isCorrect),
  }));
  return {
    id,
    text: question.text ?? "",
    marks: question.marks ?? 1,
    options: options.length >= 2 ? options : [
      { id: `opt-${Date.now()}-1`, text: "", isCorrect: false },
      { id: `opt-${Date.now()}-2`, text: "", isCorrect: false },
    ],
  };
}

export default function CreateQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [quizMeta, setQuizMeta] = useState(DEFAULT_QUIZ);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    const addQuestion = location.state?.addQuestion;
    if (addQuestion && typeof addQuestion === "object") {
      const cloned = cloneQuestionFromBank(addQuestion);
      setQuestions((prev) => [...prev, cloned]);
      setSelectedQuestionId(cloned.id);
      setStep(2);
      navigate("/dashboard/create-quiz", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) ?? questions[0];

  function handleMetaChange(field, value) {
    setQuizMeta((prev) => ({ ...prev, [field]: value }));
  }

  function goNext() {
    if (step === 1) setStep(2);
  }

  function addQuestion() {
    const newQ = createNewQuestion();
    setQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionId(newQ.id);
  }

  function removeQuestion(id) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setSelectedQuestionId((prev) => (prev === id ? questions.find((q) => q.id !== id)?.id ?? null : prev));
  }

  function updateQuestion(id, updates) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }

  function updateOption(questionId, optionId, updates) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) =>
            o.id === optionId ? { ...o, ...updates } : o
          ),
        };
      })
    );
  }

  function setCorrectOption(questionId, optionId) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) => ({
            ...o,
            isCorrect: o.id === optionId,
          })),
        };
      })
    );
  }

  function addOption(questionId) {
    const newOpt = createNewOption();
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, newOpt] } : q
      )
    );
  }

  function removeOption(questionId, optionId) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const next = q.options.filter((o) => o.id !== optionId);
        const hadCorrect = q.options.find((o) => o.id === optionId)?.isCorrect;
        if (hadCorrect && next.length) next[0].isCorrect = true;
        return { ...q, options: next };
      })
    );
  }

  async function handleCreate() {
    setCreateError(null);
    setCreating(true);
    const parsedTimeLimit = parseInt(quizMeta.time_limit, 10);
    const { quiz, error } = await createQuizApi({
      name: quizMeta.name.trim(),
      description: quizMeta.description.trim() || undefined,
      class: quizMeta.class.trim() || undefined,
      topic: quizMeta.topic.trim() || undefined,
      time_limit: Number.isFinite(parsedTimeLimit) && parsedTimeLimit > 0 ? parsedTimeLimit : null,
      questions,
    });
    setCreating(false);
    if (error) {
      setCreateError(error);
      toast.error(error);
      return;
    }
    navigate("/dashboard/my-quizzes", { replace: true });
  }

  const canNext = quizMeta.name.trim() && quizMeta.topic.trim();
  const hasQuestions = questions.length > 0;

  // —— Step 1: Full-screen form ——
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-10 flex flex-col bg-background text-foreground">
        <div className="grain-layer" aria-hidden="true" />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-auto p-6 md:p-10">
          <div className="mx-auto w-full max-w-2xl">
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
            <h1 className="display-font text-3xl text-foreground md:text-4xl">
              Create Quiz
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the basic details for your quiz.
            </p>

            <div className="mt-10 space-y-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quiz name
                </label>
                <input
                  type="text"
                  value={quizMeta.name}
                  onChange={(e) => handleMetaChange("name", e.target.value)}
                  placeholder="e.g. Science Chapter 5"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={quizMeta.description}
                  onChange={(e) => handleMetaChange("description", e.target.value)}
                  placeholder="Brief description of the quiz"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Class
                </label>
                <input
                  type="text"
                  value={quizMeta.class}
                  onChange={(e) => handleMetaChange("class", e.target.value)}
                  placeholder="e.g. Grade 10 A"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Topic
                </label>
                <input
                  type="text"
                  value={quizMeta.topic}
                  onChange={(e) => handleMetaChange("topic", e.target.value)}
                  placeholder="e.g. Physics, Algebra"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Time limit (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={quizMeta.time_limit}
                  onChange={(e) => handleMetaChange("time_limit", e.target.value)}
                  placeholder="No time limit"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Leave empty for no time limit. Students will see a countdown timer during the quiz.
                </p>
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button
                type="button"
                onClick={goNext}
                disabled={!canNext}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity disabled:opacity-50 hover:opacity-90"
              >
                Next: Add questions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // —— Step 2: Sidebar + question editor ——
  if (creating) {
    return <LoadingScreen variant="fullscreen" message="Creating quiz…" />;
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-background text-foreground">
      <div className="grain-layer" aria-hidden="true" />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Left sidebar: question list */}
        <aside className="flex w-64 flex-shrink-0 flex-col border-r border-border bg-card">
          <div className="border-b border-border p-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-3 flex w-full items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <svg className="size-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to details
            </button>
            <h2 className="display-font text-lg text-foreground">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add question
            </button>
          </div>
          <ul className="flex-1 overflow-auto p-2">
            {questions.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No questions yet. Add one above.
              </li>
            )}
            {questions.map((q, index) => (
              <li key={q.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedQuestionId === q.id
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border hover:border-border hover:bg-accent/50"
                  }`}
                >
                  <span className="truncate">
                    Q{index + 1}: {q.text || "Untitled"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuestion(q.id);
                    }}
                    className="flex-shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-primary"
                    aria-label="Remove question"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right: current question editor */}
        <main className="flex min-w-0 flex-1 flex-col overflow-auto p-6 md:p-8">
          {!selectedQuestion && (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card/30">
              <p className="text-muted-foreground">Add a question from the sidebar to edit it.</p>
            </div>
          )}

          {selectedQuestion && (
            <div className="mx-auto w-full max-w-2xl space-y-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Question
                </label>
                <textarea
                  value={selectedQuestion.text}
                  onChange={(e) =>
                    updateQuestion(selectedQuestion.id, { text: e.target.value })
                  }
                  placeholder="Enter the question text"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={selectedQuestion.marks}
                    onChange={(e) =>
                      updateQuestion(selectedQuestion.id, {
                        marks: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    className="w-20 rounded-lg border border-border bg-card px-2 py-1 text-center text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Options (select correct one)
                  </label>
                  <button
                    type="button"
                    onClick={() => addOption(selectedQuestion.id)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    + Add option
                  </button>
                </div>
                <ul className="space-y-3">
                  {selectedQuestion.options.map((opt) => (
                    <li
                      key={opt.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <input
                        type="radio"
                        name={`correct-${selectedQuestion.id}`}
                        checked={opt.isCorrect}
                        onChange={() => setCorrectOption(selectedQuestion.id, opt.id)}
                        className="size-4 accent-primary"
                        aria-label="Correct answer"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) =>
                          updateOption(selectedQuestion.id, opt.id, {
                            text: e.target.value,
                          })
                        }
                        placeholder="Option text"
                        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                      {selectedQuestion.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeOption(selectedQuestion.id, opt.id)
                          }
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"
                          aria-label="Remove option"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {createError && (
            <p className="mt-4 text-sm text-red-400">{createError}</p>
          )}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={creating}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!hasQuestions || creating}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity disabled:opacity-50 hover:opacity-90"
            >
              {creating ? "Creating…" : "Create quiz"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
