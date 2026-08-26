/**
 * Placeholder API transport.
 *
 * Every function in `src/api/*` resolves against mock data through this
 * helper. When a real backend exists, swap the body of `request` for a
 * `fetch(BASE_URL + path)` call — no UI component needs to change.
 */

export const BASE_URL = "/api";

export const LATENCY_MS = 450;

export async function request<T>(_path: string, data: T, opts?: { fail?: boolean }): Promise<T> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  if (opts?.fail) throw new Error("Network request failed");
  return structuredClone(data);
}
