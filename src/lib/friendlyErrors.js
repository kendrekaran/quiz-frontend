/**
 * Maps technical/backend error messages to user-friendly text.
 * Used so we never show raw JWT or server errors in the UI.
 */

const AUTH_PATTERNS = [
  [/jwt|token.*expired|expired.*token/i, "Your session has expired. Please sign in again."],
  [/invalid.*token|token.*invalid|unable to parse|verify signature|invalid claims/i, "Your session is invalid. Please sign in again."],
  [/unauthorized|missing.*authorization|invalid authorization/i, "Please sign in to continue."],
  [/invalid or expired token/i, "Your session has expired. Please sign in again."],
];

const GENERIC_PATTERNS = [
  [/network|fetch|failed to fetch|could not reach/i, "Could not reach the server. Check your connection and try again."],
  [/not found|404/i, "The requested item was not found."],
  [/forbidden|403/i, "You don't have permission to do that."],
  [/server error|500|503/i, "Something went wrong on our end. Please try again later."],
];

/**
 * @param {string} [raw] - Raw error message from API or exception
 * @returns {string} - User-friendly message
 */
export function getFriendlyErrorMessage(raw) {
  if (!raw || typeof raw !== "string") {
    return "Something went wrong. Please try again.";
  }
  const text = raw.trim();
  for (const [pattern, friendly] of [...AUTH_PATTERNS, ...GENERIC_PATTERNS]) {
    if (pattern.test(text)) return friendly;
  }
  return "Something went wrong. Please try again.";
}
