import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { signup as apiSignup } from "@/api/services";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/kit";
import { useApp } from "@/lib/app-store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Create account — SahyogSeva" }],
  }),
  component: SignupPage,
});

const ROLE_OPTIONS: { id: Role; label: string }[] = [
  { id: "customer", label: "Customer" },
  { id: "worker", label: "Worker" },
  { id: "coop", label: "Cooperative" },
];

const ROLE_HOME: Record<Role, string> = {
  customer: "/",
  worker: "/pro/dashboard",
  coop: "/coop",
  admin: "/admin",
};

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [role, setSelectedRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await apiSignup({ name, email, phone, city, password, role });
      login(token, user);
      // Use the role the server actually assigned (e.g. ADMIN_EMAIL override),
      // not just the one the person picked in the form above.
      navigate({ to: ROLE_HOME[user.role] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Join a cooperative-first services platform">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">I am a</label>
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={cn(
                  "tap flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold",
                  role === r.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Full name
          </label>
          <div className="surface flex items-center gap-2 px-3">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="name"
            />
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Phone
            </label>
            <div className="surface flex items-center gap-2 px-3">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="tel"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">City</label>
            <div className="surface flex items-center gap-2 px-3">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Pune"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="address-level2"
              />
            </div>
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
              placeholder="Create a password"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="new-password"
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

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Confirm password
          </label>
          <div className="surface flex items-center gap-2 px-3">
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" full disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
