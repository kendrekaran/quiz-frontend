import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { getQuizById, updateQuiz } from "../../lib/api";
import { Edit2, Save, X } from "lucide-react";

export default function QuizDetail() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [quizForm, setQuizForm] = useState({ name: "", description: "", class: "", topic: "" });
  const [questionForm, setQuestionForm] = useState({ text: "", marks: 1, options: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!quizId) {
      setQuiz(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getQuizById(quizId).then(({ quiz: data, error: err, status }) => {
      if (cancelled) return;
      setQuiz(data ?? null);
      const message = status === 401 ? "Your session has expired. Please sign in again." : (err ?? null);
      setError(message);
      if (message) toast.error(message);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [quizId]);

  // Initialize form when quiz loads or editing starts
  useEffect(() => {
    if (quiz && editingQuiz) {
      setQuizForm({
        name: quiz.name || "",
        description: quiz.description || "",
        class: quiz.class || "",
        topic: quiz.topic || "",
      });
    }
  }, [quiz, editingQuiz]);

  useEffect(() => {
    if (quiz && editingQuestionId) {
      const question = quiz.questions?.find((q) => q.id === editingQuestionId);
      if (question) {
        setQuestionForm({
          text: question.text || "",
          marks: question.marks || 1,
          options: question.options ? [...question.options] : [],
        });
      }
    }
  }, [quiz, editingQuestionId]);

  const handleSaveQuiz = async () => {
    if (!quizForm.name.trim()) {
      toast.error("Quiz name is required");
      return;
    }

    setSaving(true);
    const { quiz: updated, error: err } = await updateQuiz(quizId, {
      name: quizForm.name.trim(),
      description: quizForm.description.trim() || null,
      class: quizForm.class.trim() || null,
      topic: quizForm.topic.trim() || null,
    });
    setSaving(false);

    if (err) {
      toast.error(err);
      return;
    }

    setQuiz(updated);
    setEditingQuiz(false);
    toast.success("Quiz updated successfully");
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.text.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (!questionForm.options || questionForm.options.length < 2) {
      toast.error("At least 2 options are required");
      return;
    }
    if (!questionForm.options.some((opt) => opt.isCorrect)) {
      toast.error("At least one option must be marked as correct");
      return;
    }

    const updatedQuestions = quiz.questions.map((q) =>
      q.id === editingQuestionId
        ? {
            ...q,
            text: questionForm.text.trim(),
            marks: questionForm.marks || 1,
            options: questionForm.options,
          }
        : q
    );

    setSaving(true);
    const { quiz: updated, error: err } = await updateQuiz(quizId, {
      questions: updatedQuestions,
    });
    setSaving(false);

    if (err) {
      toast.error(err);
      return;
    }

    setQuiz(updated);
    setEditingQuestionId(null);
    setQuestionForm({ text: "", marks: 1, options: [] });
    toast.success("Question updated successfully");
  };

  const handleUpdateOption = (optIndex, field, value) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, idx) =>
        idx === optIndex ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const handleToggleCorrect = (optIndex) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, idx) =>
        idx === optIndex ? { ...opt, isCorrect: !opt.isCorrect } : opt
      ),
    }));
  };

  if (loading) {
    return <LoadingScreen variant="block" message="Loading quiz…" />;
  }

  if (error || !quiz) {
    return (
      <div>
        <p className="text-muted-foreground">{error || "Quiz not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-quizzes")}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Back to My Quizzes
        </button>
      </div>
    );
  }

  return (
    <div>
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

      {/* Quiz details at top */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {editingQuiz ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={quizForm.name}
                  onChange={(e) => setQuizForm({ ...quizForm, name: e.target.value })}
                  placeholder="Quiz name"
                  className="display-font w-full rounded-xl border border-border bg-background px-4 py-2 text-2xl text-foreground md:text-3xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={quizForm.class}
                    onChange={(e) => setQuizForm({ ...quizForm, class: e.target.value })}
                    placeholder="Class (optional)"
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={quizForm.topic}
                    onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                    placeholder="Topic (optional)"
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveQuiz}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save className="size-4" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuiz(false);
                      setQuizForm({ name: "", description: "", class: "", topic: "" });
                    }}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-50"
                  >
                    <X className="size-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="display-font text-2xl text-foreground md:text-3xl">
                  {quiz.name || "Untitled Quiz"}
                </h1>
                {quiz.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{quiz.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-4">
                  {quiz.class && (
                    <span className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Class: {quiz.class}
                    </span>
                  )}
                  {quiz.topic && (
                    <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                      Topic: {quiz.topic}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          {!editingQuiz && (
            <button
              onClick={() => setEditingQuiz(true)}
              className="shrink-0 rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Edit quiz"
            >
              <Edit2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Questions and options below */}
      <div className="mt-8">
        <h2 className="display-font mb-4 text-xl text-foreground">Questions</h2>
        <ul className="space-y-6">
          {quiz.questions?.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              No questions in this quiz.
            </li>
          )}
          {quiz.questions?.map((q, index) => (
            <li
              key={q.id}
              className="rounded-2xl border border-border bg-card p-5 md:p-6"
            >
              {editingQuestionId === q.id ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Q{index + 1}.</span>
                    <input
                      type="text"
                      value={questionForm.text}
                      onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                      placeholder="Question text"
                      className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      min="1"
                      value={questionForm.marks}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) || 1 })
                      }
                      placeholder="Marks"
                      className="w-20 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Options:</p>
                    {questionForm.options?.map((opt, optIdx) => (
                      <div key={opt.id || optIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.text || ""}
                          onChange={(e) => handleUpdateOption(optIdx, "text", e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => handleToggleCorrect(optIdx)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                            opt.isCorrect
                              ? "bg-chart-2 text-primary-foreground"
                              : "border border-border bg-background text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {opt.isCorrect ? "Correct" : "Mark Correct"}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveQuestion}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Save className="size-4" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingQuestionId(null);
                        setQuestionForm({ text: "", marks: 1, options: [] });
                      }}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-50"
                    >
                      <X className="size-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium text-foreground">
                      Q{index + 1}. {q.text || "Untitled question"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded-lg bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">
                        {q.marks} {q.marks === 1 ? "mark" : "marks"}
                      </span>
                      <button
                        onClick={() => setEditingQuestionId(q.id)}
                        className="shrink-0 rounded-lg border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label={`Edit question ${index + 1}`}
                      >
                        <Edit2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {q.options?.map((opt) => (
                      <li
                        key={opt.id}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${
                          opt.isCorrect
                            ? "border-chart-2/50 bg-chart-2/10 text-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {opt.isCorrect && (
                          <span className="shrink-0 rounded-full bg-chart-2 px-2 py-0.5 text-xs font-bold text-primary-foreground">
                            Correct
                          </span>
                        )}
                        <span>{opt.text || "(Empty option)"}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
