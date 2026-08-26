import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { getCategories } from "@/api/services";
import { Button, Card, ErrorState, Loading, PageHeader, inr, useAsync } from "@/components/kit";
import { categoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — SahyogSeva Admin" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const cats = useAsync(getCategories);
  const [newName, setNewName] = useState("");

  if (cats.loading) return <Loading label="Loading categories…" />;
  if (cats.error) return <ErrorState message={cats.error} onRetry={cats.retry} />;

  function toggleActive(id: string) {
    cats.setData((prev) => (prev ? prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)) : prev));
  }

  function remove(id: string) {
    cats.setData((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
  }

  function addCategory() {
    if (!newName.trim()) return;
    cats.setData((prev) => [
      ...(prev ?? []),
      {
        id: newName.trim().toLowerCase().replace(/\s+/g, "-"),
        name: newName.trim(),
        nameHi: newName.trim(),
        icon: "Wrench",
        basePrice: 299,
        jobs: 0,
        active: true,
      },
    ]);
    setNewName("");
  }

  const list = cats.data ?? [];

  return (
    <div>
      <PageHeader title="Service categories" subtitle={`${list.length} categories on the platform`} />

      <Card className="mb-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
          placeholder="New category name, e.g. Pest control"
          className="h-11 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <Button onClick={addCategory}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const Icon = categoryIcon(c.icon);
          return (
            <Card key={c.id} className="flex items-center gap-3">
              <span
                className={cn(
                  "shrink-0 rounded-xl p-2.5",
                  c.active ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  from {inr(c.basePrice)} · {c.jobs} jobs
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => toggleActive(c.id)}
                  className={cn(
                    "tap tap-active flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
                    c.active ? "justify-end bg-primary" : "justify-start bg-secondary",
                  )}
                  aria-label={c.active ? "Deactivate" : "Activate"}
                >
                  <span className="h-5 w-5 rounded-full bg-card shadow-sm" />
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="tap tap-active rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
