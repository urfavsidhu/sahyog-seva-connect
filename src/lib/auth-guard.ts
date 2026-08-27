import { redirect } from "@tanstack/react-router";
import { getToken } from "@/api/client";
import type { Role } from "./types";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const ROLE_HOME: Record<Role, string> = {
  customer: "/",
  worker: "/pro/dashboard",
  coop: "/coop",
  admin: "/admin",
};

/**
 * Reads the logged-in user straight out of localStorage. Deliberately not
 * using `useApp()` here — `beforeLoad` runs outside React, before any
 * component (and therefore any context) exists.
 */
function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  if (!getToken()) return null;

  const raw = localStorage.getItem("ss.user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Route guard for `beforeLoad`. Sends a logged-out visitor to /login, and
 * a logged-in visitor with the wrong role to their own section instead —
 * e.g. a customer hitting /admin lands back on "/", not on the admin panel.
 *
 * Usage: `beforeLoad: requireRole("worker")` on a layout route.
 */
export function requireRole(...allowed: Role[]) {
  return () => {
    const user = getStoredUser();

    if (!user) {
      throw redirect({ to: "/login" });
    }
    if (!allowed.includes(user.role)) {
      throw redirect({ to: ROLE_HOME[user.role] });
    }
  };
}
