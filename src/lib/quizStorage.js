/**
 * Client-side helpers for building quiz/question/option shapes.
 * Persistence is handled by the API (backend); see lib/api.js.
 */

export function createNewQuestion() {
  return {
    id: crypto.randomUUID?.() ?? `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: "",
    marks: 1,
    options: [
      { id: `opt-${Date.now()}-1`, text: "", isCorrect: false },
      { id: `opt-${Date.now()}-2`, text: "", isCorrect: false },
    ],
  };
}

export function createNewOption() {
  return {
    id: `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: "",
    isCorrect: false,
  };
}
