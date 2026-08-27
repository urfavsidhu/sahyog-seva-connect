/**
 * Real API transport — talks to the Express/MongoDB backend in `server/`.
 *
 * Every function in `src/api/services.ts` calls `request()` below. It
 * attaches the JWT (if we have one) as an `Authorization` header, sends
 * the given method/body, and throws on any non-2xx response so callers'
 * existing `try/catch` blocks keep working exactly as before.
 */

export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const TOKEN_KEY = "ss.token";

/** Reads the stored JWT. Guarded for SSR, where `window` doesn't exist. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
}

/**
 * Thrown on any non-2xx response. `status` lets callers branch on e.g.
 * 401 (bad credentials) vs 403 (forbidden) vs 409 (conflict) if they need to.
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network request failed — check your connection and try again.", 0);
  }

  // 204 No Content / empty body responses.
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = (data && (data.message as string)) || "Request failed";
    throw new ApiError(message, res.status);
  }

  return data as T;
}
