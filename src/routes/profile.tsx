import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  Calendar,
  Check,
  IndianRupee,
  ListChecks,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { getBookings, getCurrentUser, updateProfile } from "@/api/services";
import {
  Button,
  Card,
  ErrorState,
  Loading,
  PageHeader,
  Section,
  StatCard,
  StatusBadge,
  inr,
  useAsync,
} from "@/components/kit";
import { useApp } from "@/lib/app-store";
import type { AppUser } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Your profile — SahyogSeva" }],
  }),
  component: ProfilePage,
});

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

type FormState = Pick<AppUser, "name" | "email" | "phone" | "city">;

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      <div className="surface flex items-center gap-2 px-3">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

function ProfilePage() {
  const { lang, toggleLang, unread, markAllRead, isAuthenticated, logout } = useApp();
  const profile = useAsync(getCurrentUser);
  const bookings = useAsync(getBookings);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const user = profile.data;
  const bookingData = bookings.data ?? [];
  const completed = bookingData.filter((b) => b.status === "completed").length;
  const spent = bookingData
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.price, 0);

  function startEdit() {
    if (!user) return;
    setForm({ name: user.name, email: user.email, phone: user.phone, city: user.city });
    setSaved(false);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setForm(null);
  }

  async function saveEdit() {
    if (!form) return;
    setSaving(true);
    try {
      await updateProfile(form);
      profile.setData((prev) => (prev ? { ...prev, ...form } : prev));
      setEditing(false);
      setForm(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your personal details and preferences" />

      {!isAuthenticated ? (
        <Card className="flex flex-col items-center px-6 py-10 text-center">
          <div className="mb-4 rounded-full bg-primary-soft p-4 text-primary">
            <LogIn className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-bold">Log in to view your profile</h1>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Log in or create an account to manage your details, track bookings and update your
            preferences.
          </p>

          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
            <Link to="/login" className="flex-1">
              <Button full>
                <LogIn className="h-4 w-4" /> Log in
              </Button>
            </Link>
            <Link to="/signup" className="flex-1">
              <Button variant="outline" full>
                <UserPlus className="h-4 w-4" /> Sign up
              </Button>
            </Link>
          </div>
        </Card>
      ) : profile.loading ? (
        <Loading label="Loading your profile…" />
      ) : profile.error || !user ? (
        <ErrorState message={profile.error ?? undefined} onRetry={profile.retry} />
      ) : (
        <>
          {/* identity card */}
          <div className="surface mb-6 overflow-hidden">
            <div className="relative bg-primary p-5 pb-14 text-primary-foreground sm:p-6 sm:pb-16">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/25 blur-2xl" />
            </div>

            <div className="-mt-10 px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="flex items-end justify-between gap-3">
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=0d9488,f59e0b,0ea5e9,dc2626,7c3aed,059669&fontFamily=Plus%20Jakarta%20Sans&fontWeight=700`}
                  alt={user.name}
                  className="h-20 w-20 shrink-0 rounded-2xl border-4 border-card bg-secondary object-cover shadow-pop"
                />
                {!editing && (
                  <Button variant="outline" size="sm" onClick={startEdit}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                )}
              </div>

              {!editing || !form ? (
                <>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{user.name}</h2>
                    <StatusBadge status={user.status} />
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Member since {formatJoined(user.joined)}
                  </p>

                  <div className="mt-4 space-y-2.5 border-t border-border pt-4">
                    <p className="flex items-center gap-2.5 text-sm">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" /> {user.email}
                    </p>
                    <p className="flex items-center gap-2.5 text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" /> {user.phone}
                    </p>
                    <p className="flex items-center gap-2.5 text-sm">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" /> {user.city}
                    </p>
                  </div>

                  {saved && (
                    <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-success-soft px-3 py-2 text-xs font-semibold text-success">
                      <Check className="h-3.5 w-3.5" /> Profile updated
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-4 space-y-3">
                  <Field
                    label="Full name"
                    icon={User}
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                  />
                  <Field
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                  />
                  <Field
                    label="Phone"
                    icon={Phone}
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                  />
                  <Field
                    label="City"
                    icon={MapPin}
                    value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })}
                  />

                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" full onClick={cancelEdit} disabled={saving}>
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                    <Button full onClick={saveEdit} disabled={saving}>
                      <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* stats */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <StatCard
              icon={ListChecks}
              label="Bookings"
              value={String(user.bookings)}
              tone="primary"
            />
            <StatCard icon={BadgeCheck} label="Completed" value={String(completed)} tone="success" />
            <StatCard icon={IndianRupee} label="Total spent" value={inr(spent)} tone="accent" />
          </div>

          {/* preferences */}
          <Section title="Preferences">
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Language</p>
                  <p className="text-xs text-muted-foreground">Choose your app language</p>
                </div>
                <div className="flex gap-1 rounded-xl bg-secondary p-1">
                  <button
                    onClick={() => lang !== "en" && toggleLang()}
                    className={cn(
                      "tap rounded-lg px-3 py-1.5 text-xs font-bold",
                      lang === "en" ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => lang !== "hi" && toggleLang()}
                    className={cn(
                      "tap rounded-lg px-3 py-1.5 text-xs font-bold",
                      lang === "hi" ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
                    )}
                  >
                    हिं
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <Bell className="h-4 w-4" /> Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {unread > 0
                      ? `${unread} unread notification${unread > 1 ? "s" : ""}`
                      : "You're all caught up"}
                  </p>
                </div>
                {unread > 0 ? (
                  <Button variant="outline" size="sm" onClick={markAllRead}>
                    Mark all read
                  </Button>
                ) : (
                  <Link to="/notifications">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </Section>

          {/* account */}
          <Section title="Account">
            <Card>
              <button
                onClick={handleLogout}
                className="tap tap-active flex w-full items-center gap-2.5 rounded-lg py-1 text-sm font-semibold text-destructive"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </Card>
          </Section>
        </>
      )}
    </div>
  );
}
