import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, MessageSquare, Phone, Send, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getBookings, getMessages } from "@/api/services";
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
import type { Booking, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [{ title: "Chat — SahyogSeva" }],
  }),
  component: ChatPage,
});

const ACTIVE_STATUSES: Booking["status"][] = ["pending", "confirmed", "in-progress"];

const AUTO_REPLIES = {
  en: [
    "Sure, I'll keep you posted.",
    "Understood, thank you for letting me know.",
    "I'm on schedule, see you at the slot.",
    "Noted — I'll bring what's needed.",
  ],
  hi: [
    "ठीक है, मैं आपको बताता रहूँगा।",
    "समझ गया, बताने के लिए धन्यवाद।",
    "मैं समय पर हूँ, स्लॉट पर मिलते हैं।",
    "नोट कर लिया — जरूरी सामान ले आऊँगा।",
  ],
};

interface Conversation {
  workerId: string;
  workerName: string;
  workerPhoto: string;
  service: string;
  status: Booking["status"];
  bookingId: string;
}

function latestConversations(bookings: Booking[]): Conversation[] {
  const byWorker = new Map<string, Booking>();
  for (const b of bookings) {
    const existing = byWorker.get(b.workerId);
    if (!existing || b.date > existing.date) byWorker.set(b.workerId, b);
  }
  return [...byWorker.values()]
    .sort((a, b) => {
      const aActive = ACTIVE_STATUSES.includes(a.status) ? 1 : 0;
      const bActive = ACTIVE_STATUSES.includes(b.status) ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return b.date < a.date ? -1 : 1;
    })
    .map((b) => ({
      workerId: b.workerId,
      workerName: b.workerName,
      workerPhoto: b.workerPhoto,
      service: b.service,
      status: b.status,
      bookingId: b.id,
    }));
}

function ChatPage() {
  const { lang } = useApp();
  const bookings = useAsync(getBookings);
  const seedMessages = useAsync(getMessages);

  const conversations = useMemo(() => latestConversations(bookings.data ?? []), [bookings.data]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversations.length && !activeId) setActiveId(conversations[0]!.workerId);
  }, [conversations, activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeId, threads, typing]);

  const active = conversations.find((c) => c.workerId === activeId) ?? null;
  const thread = (activeId && threads[activeId]) || seedMessages.data || [];

  function send() {
    if (!input.trim() || !activeId) return;
    const text = input.trim();
    setInput("");
    const mine: Message = { id: `local-${Date.now()}`, from: "me", text, time: "now" };
    setThreads((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || thread), mine] }));
    setTyping(true);
    setTimeout(() => {
      const pool = AUTO_REPLIES[lang];
      const reply: Message = {
        id: `local-${Date.now() + 1}`,
        from: "them",
        text: pool[Math.floor(Math.random() * pool.length)] ?? pool[0]!,
        time: "now",
      };
      setThreads((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || thread), reply] }));
      setTyping(false);
    }, 1000);
  }

  if (bookings.loading) return <Loading label="Loading conversations…" />;
  if (bookings.error) return <ErrorState message={bookings.error} onRetry={bookings.retry} />;

  if (!conversations.length) {
    return (
      <div>
        <PageHeader title="Chat" subtitle="Message workers about your bookings" />
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          body="Book a worker to start chatting about your service."
          action={
            <Link to="/search">
              <Button>Find a worker</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Chat" subtitle="Message workers about your bookings" />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* conversation list */}
        <Card
          className={cn(
            "flex h-[65vh] flex-col gap-1 overflow-y-auto p-2 lg:h-[70vh]",
            active && "hidden lg:flex",
          )}
        >
          {conversations.map((c) => (
            <button
              key={c.workerId}
              onClick={() => setActiveId(c.workerId)}
              className={cn(
                "tap flex items-center gap-3 rounded-xl p-2.5 text-left",
                activeId === c.workerId ? "bg-primary-soft" : "hover:bg-secondary",
              )}
            >
              <div className="relative shrink-0">
                <img
                  src={c.workerPhoto}
                  alt={c.workerName}
                  className="h-11 w-11 rounded-full object-cover"
                />
                {ACTIVE_STATUSES.includes(c.status) && (
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.workerName}</p>
                <p className="truncate text-xs text-muted-foreground">{c.service}</p>
              </div>
              {c.status === "in-progress" && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-urgent-soft px-2 py-0.5 text-[10px] font-bold text-urgent">
                  <Zap className="h-2.5 w-2.5" /> Live
                </span>
              )}
            </button>
          ))}
        </Card>

        {/* thread */}
        {active && (
          <Card className="flex h-[65vh] flex-col p-0 lg:h-[70vh]">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button
                onClick={() => setActiveId(null)}
                className="tap tap-active rounded-lg p-1.5 hover:bg-secondary lg:hidden"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <img
                src={active.workerPhoto}
                alt={active.workerName}
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-semibold">
                  {active.workerName}
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {active.bookingId} · {active.service}
                </p>
              </div>
              <a
                href="tel:+911234567890"
                className="tap tap-active rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Call worker"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
              {thread.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex flex-col", m.from === "me" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                      m.from === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">{m.time}</span>
                </div>
              ))}
              {typing && (
                <div className="w-16 rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  •••
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-border p-2.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={lang === "en" ? "Type a message…" : "संदेश लिखें…"}
                className="h-11 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="md" onClick={send} aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
