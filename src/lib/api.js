import { getFriendlyErrorMessage } from "./friendlyErrors.js";

const SESSION_KEY = "quizlab_teacher_session";

function getApiUrl() {
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
}

/** Clear stored session and redirect to teacher login. Call on 401. */
export function clearSessionAndRedirectToLogin() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (_) {}
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  params.set("role", "teacher");
  params.set("message", "session_expired");
  window.location.replace(`/login?${params.toString()}`);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  const session = getSession();
  return session?.access_token ?? null;
}

/**
 * Authenticated request to the backend. Uses stored teacher session token.
 * Returns { ok, data, error, status }.
 */
export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const base = getApiUrl();
  const url = path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    const raw = err?.message ?? "Could not reach server";
    return {
      ok: false,
      error: getFriendlyErrorMessage(raw),
      message: getFriendlyErrorMessage(raw),
      status: 0,
    };
  }

  let data;
  try {
    data = await res.json().catch(() => ({}));
  } catch {
    data = {};
  }

  const rawError = data.message ?? data.error;
  const friendlyError = rawError ? getFriendlyErrorMessage(String(rawError)) : null;

  if (res.status === 401 && token) {
    clearSessionAndRedirectToLogin();
  }

  return {
    ok: res.ok,
    data,
    error: friendlyError ?? data.error,
    message: friendlyError ?? data.message,
    status: res.status,
  };
}

export async function getQuizzes() {
  const result = await apiRequest("/api/quizzes");
  if (!result.ok) {
    return { quizzes: [], error: result.message || result.error };
  }
  return { quizzes: Array.isArray(result.data) ? result.data : [], error: null };
}

export async function getQuizById(id) {
  const result = await apiRequest(`/api/quizzes/${id}`);
  if (!result.ok) {
    return { quiz: null, error: result.message || result.error, status: result.status };
  }
  return { quiz: result.data, error: null, status: result.status };
}

/**
 * Create a quiz. Payload: { name, description?, class?, topic?, questions }.
 * Returns { quiz, error }.
 */
export async function createQuiz(payload) {
  const result = await apiRequest("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!result.ok) {
    return { quiz: null, error: result.message || result.error };
  }
  return { quiz: result.data, error: null };
}

/**
 * Get all students for the authenticated teacher.
 */
export async function getStudents() {
  const result = await apiRequest("/api/students");
  if (!result.ok) {
    return { students: [], error: result.message || result.error };
  }
  return { students: Array.isArray(result.data) ? result.data : [], error: null };
}

/**
 * Create a student. Payload: { name, email, number?, class?, div?, roll_number? }.
 */
export async function createStudent(payload) {
  const result = await apiRequest("/api/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!result.ok) {
    return { student: null, error: result.message || result.error };
  }
  return { student: result.data, error: null };
}
