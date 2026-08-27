import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  CalendarDays,
  Home,
  IndianRupee,
  LayoutDashboard,
  ListChecks,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Search,
  Shield,
  Star,
  Store,
  Tags,
  User,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useApp } from "@/lib/app-store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Chatbot } from "./Chatbot";
import { LocationPicker } from "./LocationPicker";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV: Record<Role, NavItem[]> = {
  customer: [
    { to: "/", label: "Home", icon: Home },
    { to: "/search", label: "Search", icon: Search },
    { to: "/bookings", label: "Bookings", icon: ListChecks },
    { to: "/chat", label: "Chat", icon: MessageSquare },
    { to: "/profile", label: "Profile", icon: User },
  ],
  worker: [
    { to: "/pro/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/pro/requests", label: "Requests", icon: Briefcase },
    { to: "/pro/earnings", label: "Earnings", icon: IndianRupee },
    { to: "/pro/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/pro/reviews", label: "Reviews", icon: Star },
  ],
  coop: [
    { to: "/coop", label: "Overview", icon: LayoutDashboard },
    { to: "/coop/members", label: "Members", icon: Users },
    { to: "/coop/assign", label: "Assign", icon: Briefcase },
    { to: "/coop/revenue", label: "Revenue", icon: Wallet },
    { to: "/coop/analytics", label: "Analytics", icon: IndianRupee },
  ],
  admin: [
    { to: "/admin", label: "Overview", icon: Shield },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/workers", label: "Workers", icon: Briefcase },
    { to: "/admin/cooperatives", label: "Co-ops", icon: Store },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/bookings", label: "Bookings", icon: ListChecks },
    { to: "/admin/payments", label: "Payments", icon: Wallet },
    { to: "/admin/disputes", label: "Disputes", icon: Shield },
    { to: "/admin/demand", label: "Demand map", icon: MapPin },
  ],
};

const ROLE_HOME: Record<Role, string> = {
  customer: "/",
  worker: "/pro/dashboard",
  coop: "/coop",
  admin: "/admin",
};

const ROLE_LABEL: Record<Role, string> = {
  customer: "Customer",
  worker: "Worker",
  coop: "Cooperative",
  admin: "Admin",
};

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-base font-black text-primary-foreground">
        स
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Sahyog<span className="text-primary">Seva</span>
      </span>
    </Link>
  );
}

function RoleSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const { role, setRole } = useApp();
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-secondary p-1">
      {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
        <Link
          key={r}
          to={ROLE_HOME[r]}
          onClick={() => {
            setRole(r);
            onNavigate?.();
          }}
          className={cn(
            "tap rounded-lg px-2.5 py-1.5 text-xs font-semibold",
            role === r
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {ROLE_LABEL[r]}
        </Link>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { role, lang, toggleLang, unread, isAuthenticated, logout } = useApp();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV[role];
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background pb-48 lg:pb-0">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="relative flex h-16 w-full items-center gap-3 px-4 lg:px-8">
          <button
            className="tap tap-active rounded-lg p-2 hover:bg-secondary lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Brand />
          <div className="left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:absolute sm:block">
            <LocationPicker />
          </div>
          <div className="ml-auto hidden md:block">
            <RoleSwitcher />
          </div>
          <button
            onClick={toggleLang}
            className="tap tap-active ml-auto rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold md:ml-0"
            aria-label="Toggle language"
          >
            {lang === "en" ? "EN" : "हिं"}
          </button>
          <Link
            to="/notifications"
            className="tap tap-active relative rounded-lg p-2 hover:bg-secondary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-urgent px-1 text-[10px] font-bold text-primary-foreground">
                {unread}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="tap tap-active flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary"
              aria-label="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="tap tap-active flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              aria-label="Log in"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </Link>
          )}
        </div>
      </header>

      <div className="flex w-full">
        {/* desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border px-3 py-5 lg:block">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {ROLE_LABEL[role]}
          </p>
          <nav className="space-y-1">
            {items.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className={cn(
                  "tap flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
                  isActive(i.to)
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <i.icon className="h-4.5 w-4.5" />
                {i.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-4 bg-card p-4 shadow-pop">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <RoleSwitcher onNavigate={() => setOpen(false)} />
            <div className="sm:hidden">
              <LocationPicker />
            </div>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="tap tap-active flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="tap tap-active flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <LogIn className="h-4 w-4" /> Login
              </Link>
            )}
            <nav className="space-y-1 overflow-y-auto">
              {items.map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "tap flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold",
                    isActive(i.to)
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <i.icon className="h-5 w-5" />
                  {i.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {items.slice(0, 5).map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className={cn(
                "tap tap-active flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                isActive(i.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <i.icon className="h-5 w-5" />
              {i.label}
            </Link>
          ))}
        </div>
      </nav>

      <Chatbot />
    </div>
  );
}
