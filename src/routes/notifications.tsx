import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { useEffect } from "react";
import { getNotifications } from "@/api/services";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  useAsync,
} from "@/components/kit";
import { useApp } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — SahyogSeva" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const notifications = useAsync(getNotifications);
  const { markAllRead } = useApp();

  useEffect(() => {
    markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (notifications.loading) return <Loading label="Loading notifications…" />;
  if (notifications.error) return <ErrorState message={notifications.error} onRetry={notifications.retry} />;

  const list = notifications.data ?? [];

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Job alerts, payments and cooperative announcements"
        action={
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />

      {list.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" body="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <Card
              key={n.id}
              className={cn("flex gap-3", n.unread && "border-primary/30 bg-primary-soft/40")}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                  n.unread ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
