import { getFriendlyErrorMessage } from "./friendlyErrors.js";

const SESSION_KEY = "quizlab_teacher_session";
const STUDENT_SESSION_KEY = "quizlab_student_session";

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

  let data = {};
  // Don't try to parse JSON for 204 No Content responses
  if (res.status !== 204) {
    try {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json().catch(() => ({}));
      }
    } catch {
      data = {};
    }
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

// ---------------------------------------------------------------------------
// Student session helpers
// ---------------------------------------------------------------------------

export function getStudentSession() {
  try {
    const raw = localStorage.getItem(STUDENT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStudentSession(session) {
  try {
    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));
  } catch (_) {}
}

export function clearStudentSession() {
  try {
    localStorage.removeItem(STUDENT_SESSION_KEY);
  } catch (_) {}
}

export function getStudentToken() {
  return getStudentSession()?.token ?? null;
}

export function clearStudentSessionAndRedirectToLogin() {
  clearStudentSession();
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  params.set("role", "student");
  params.set("message", "session_expired");
  window.location.replace(`/login?${params.toString()}`);
}

export async function studentApiRequest(path, options = {}) {
  const token = getStudentToken();
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
      data: {},
      error: getFriendlyErrorMessage(raw),
      message: getFriendlyErrorMessage(raw),
      status: 0,
    };
  }

  let data = {};
  if (res.status !== 204) {
    try {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json().catch(() => ({}));
      }
    } catch {
      data = {};
    }
  }

  const rawError = data.message ?? data.error;
  const friendlyError = rawError ? getFriendlyErrorMessage(String(rawError)) : null;

  if (res.status === 401 && token) {
    clearStudentSessionAndRedirectToLogin();
  }

  return {
    ok: res.ok,
    data,
    error: friendlyError ?? data.error,
    message: friendlyError ?? data.message,
    status: res.status,
  };
}

/**
 * Student login.
 * First-time: password = mobile number.
 * Returns { session: { token, student, password_set }, error }.
 */
export async function studentLogin(email, password) {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  let res;
  try {
    res = await fetch(`${apiUrl}/api/auth/student/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    return { session: null, error: getFriendlyErrorMessage(err?.message ?? "Cannot reach server.") };
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message || body.error || "Sign in failed.";
    return { session: null, error: getFriendlyErrorMessage(msg) };
  }
  return { session: body, error: null };
}

/**
 * Setup student password after first login.
 * token: the student JWT from the login response.
 * Returns { token, error }.
 */
export async function studentSetupPassword(token, password, confirmPassword) {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  let res;
  try {
    res = await fetch(`${apiUrl}/api/auth/student/setup-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password, confirm_password: confirmPassword }),
    });
  } catch (err) {
    return { token: null, error: getFriendlyErrorMessage(err?.message ?? "Cannot reach server.") };
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message || body.error || "Failed to set password.";
    return { token: null, error: getFriendlyErrorMessage(msg) };
  }
  return { token: body.token, error: null };
}

export async function getStudentQuizzes() {
  const result = await studentApiRequest("/api/auth/student/quizzes");
  if (!result.ok) {
    return {
      student: null,
      quizzes: [],
      error: result.message || result.error,
      status: result.status,
    };
  }

  return {
    student: result.data?.student ?? null,
    quizzes: Array.isArray(result.data?.quizzes) ? result.data.quizzes : [],
    error: null,
    status: result.status,
  };
}

export async function getStudentQuizById(id) {
  const result = await studentApiRequest(`/api/auth/student/quizzes/${id}`);
  if (!result.ok) {
    return {
      quiz: null,
      error: result.message || result.error,
      status: result.status,
    };
  }

  return {
    quiz: result.data?.quiz ?? result.data ?? null,
    error: null,
    status: result.status,
  };
}

// ---------------------------------------------------------------------------
// Quiz API
// ---------------------------------------------------------------------------

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

/**
 * Delete a student by id.
 * Returns { error } (null if successful).
 */
export async function deleteStudent(id) {
  const result = await apiRequest(`/api/students/${id}`, {
    method: "DELETE",
  });
  if (!result.ok) {
    return { error: result.message || result.error };
  }
  return { error: null };
}

/**
 * Update a quiz by id. Payload: { name?, description?, class?, topic?, questions? }.
 * Returns { quiz, error }.
 */
export async function updateQuiz(id, payload) {
  const result = await apiRequest(`/api/quizzes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!result.ok) {
    return { quiz: null, error: result.message || result.error };
  }
  return { quiz: result.data, error: null };
}

/**
 * Delete a quiz by id.
 * Returns { error } (null if successful).
 */
export async function deleteQuiz(id) {
  const result = await apiRequest(`/api/quizzes/${id}`, {
    method: "DELETE",
  });
  if (!result.ok) {
    return { error: result.message || result.error };
  }
  return { error: null };
}

// ---------------------------------------------------------------------------
// Student Quiz Attempt API
// ---------------------------------------------------------------------------

/**
 * Submit quiz answers.
 * Payload: { answers: [{ question_id, selected_option_id }], started_at }
 * Returns { result, error }.
 */
export async function submitQuizAttempt(quizId, payload) {
  const result = await studentApiRequest(`/api/auth/student/quizzes/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!result.ok) {
    return {
      result: null,
      error: result.message || result.error,
      already_attempted: result.data?.already_attempted ?? false,
      status: result.status,
    };
  }
  return { result: result.data, error: null, already_attempted: false, status: result.status };
}

/**
 * Get quiz result for a previously submitted attempt.
 * Returns { result, error }.
 */
export async function getQuizResult(quizId) {
  const result = await studentApiRequest(`/api/auth/student/quizzes/${quizId}/result`);
  if (!result.ok) {
    return { result: null, error: result.message || result.error, status: result.status };
  }
  return { result: result.data, error: null, status: result.status };
}

/**
 * Get all quiz attempt summaries for the logged-in student.
 * Returns { attempts, error }.
 */
export async function getStudentAttempts() {
  const result = await studentApiRequest("/api/auth/student/attempts");
  if (!result.ok) {
    return { attempts: [], error: result.message || result.error, status: result.status };
  }
  return {
    attempts: Array.isArray(result.data?.attempts) ? result.data.attempts : [],
    error: null,
    status: result.status,
  };
}

// ---------------------------------------------------------------------------
// Teacher Reports API
// ---------------------------------------------------------------------------

/**
 * Get all quizzes with attempt counts for the teacher reports page.
 */
export async function getReportQuizzes() {
  const result = await apiRequest("/api/reports/quizzes");
  if (!result.ok) {
    return { quizzes: [], error: result.message || result.error };
  }
  return { quizzes: Array.isArray(result.data) ? result.data : [], error: null };
}

/**
 * Get detailed report for a specific quiz (all student attempts + scores).
 */
export async function getQuizReport(quizId) {
  const result = await apiRequest(`/api/reports/quizzes/${quizId}`);
  if (!result.ok) {
    return { report: null, error: result.message || result.error };
  }
  return { report: result.data, error: null };
}
