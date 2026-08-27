import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { login as apiLogin } from "@/api/services";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/kit";
import { useApp } from "@/lib/app-store";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Log in — SahyogSeva" }],
  }),
  component: LoginPage,
});

const ROLE_HOME: Record<Role, string> = {
  customer: "/",
  worker: "/pro/dashboard",
  coop: "/coop",
  admin: "/admin",
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await apiLogin({ email, password });
      login(token, user);
      navigate({ to: ROLE_HOME[user.role] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to book verified cooperative workers">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">Email</label>
          <div className="surface flex items-center gap-2 px-3">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Password
          </label>
          <div className="surface flex items-center gap-2 px-3">
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="tap tap-active shrink-0 p-1 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" full disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        New to SahyogSeva?{" "}
        <Link to="/signup" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
