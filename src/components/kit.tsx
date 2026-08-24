import { cn } from "@/lib/utils";
import { AlertTriangle, Inbox, Loader2, Star, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/* ---------- page scaffolding ---------- */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-6", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold sm:text-lg">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({
  className,
  children,
  interactive,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "surface tap p-4",
        interactive && "cursor-pointer hover:-translate-y-0.5 hover:shadow-pop tap-active",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ---------- states ---------- */
export function Loading({ label = "Loading…", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {label}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface h-20 animate-pulse bg-muted/60" />
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  body,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 rounded-full bg-primary-soft p-3 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="surface flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 rounded-full bg-destructive/10 p-3 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="font-semibold">Something went wrong</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {message ?? "We couldn't load this data. Please try again."}
      </p>
      {onRetry && (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

/* ---------- primitives ---------- */
type Variant = "primary" | "accent" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm",
  outline: "border border-border bg-card text-foreground hover:bg-secondary",
  ghost: "text-foreground hover:bg-secondary",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  full,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}) {
  return (
    <button
      className={cn(
        "tap tap-active inline-flex items-center justify-center gap-2 rounded-xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        full && "w-full",
        className,
      )}
      {...rest}
    />
  );
}

const tones = {
  neutral: "bg-secondary text-secondary-foreground",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-accent-foreground",
  urgent: "bg-urgent-soft text-urgent",
  danger: "bg-destructive/10 text-destructive",
} as const;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, keyof typeof tones> = {
    pending: "warning",
    confirmed: "primary",
    "in-progress": "primary",
    completed: "success",
    cancelled: "danger",
    active: "success",
    suspended: "danger",
    approved: "success",
    rejected: "danger",
    verified: "success",
    open: "warning",
    investigating: "primary",
    resolved: "success",
    "on-leave": "neutral",
  };
  return <Badge tone={map[status] ?? "neutral"}>{status.replace("-", " ")}</Badge>;
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            i <= Math.round(value) ? "fill-accent text-accent" : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  tone?: "primary" | "accent" | "success" | "urgent";
}) {
  const bg = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent-foreground",
    success: "bg-success-soft text-success",
    urgent: "bg-urgent-soft text-urgent",
  }[tone];
  return (
    <Card className="flex items-start gap-3">
      <div className={cn("rounded-xl p-2.5", bg)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold tracking-tight">{value}</p>
        {delta && <p className="mt-0.5 text-xs font-medium text-success">{delta}</p>}
      </div>
    </Card>
  );
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* ---------- async data hook (mock API) ---------- */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fn()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, retry: () => setNonce((n) => n + 1), setData };
}

/* ---------- table shell ---------- */
export function DataTable({
  head,
  children,
  className,
}: {
  head: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface overflow-x-auto p-0", className)}>
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}
