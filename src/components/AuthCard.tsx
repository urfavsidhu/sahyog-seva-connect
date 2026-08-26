import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-lg font-black text-primary-foreground">
            स
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Sahyog<span className="text-primary">Seva</span>
          </span>
        </Link>

        <div className="surface overflow-hidden">
          <div className="relative bg-primary px-6 py-6 text-primary-foreground">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/25 blur-2xl" />
            <h1 className="relative text-xl font-bold">{title}</h1>
            <p className="relative mt-1 text-sm opacity-90">{subtitle}</p>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
