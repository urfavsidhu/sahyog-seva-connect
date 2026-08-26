import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Home,
  LogIn,
  MapPin,
  ShieldCheck,
  UserPlus,
  Wallet,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { createBooking, getWorker } from "@/api/services";
import { Button, Card, ErrorState, Loading, Section, Stars, inr, useAsync } from "@/components/kit";
import { useApp } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book/$id")({
  head: () => ({
    meta: [{ title: "Confirm booking — SahyogSeva" }],
  }),
  component: BookingPage,
});

const SLOTS = [
  "7:00 – 9:00 AM",
  "9:00 – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "2:00 – 4:00 PM",
  "4:00 – 6:00 PM",
  "6:00 – 8:00 PM",
];

const URGENT_FEE = 100;

const todayIso = () => new Date().toISOString().slice(0, 10);

function nextDays(count: number) {
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().slice(0, 10),
      dow: d.toLocaleDateString("en-IN", { weekday: "short" }),
      day: d.getDate(),
      mon: d.toLocaleDateString("en-IN", { month: "short" }),
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : null,
    };
  });
}

function BookingPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const worker = useAsync(() => getWorker(id), [id]);
  const days = useMemo(() => nextDays(7), []);

  const [date, setDate] = useState(todayIso());
  const [slot, setSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(2);
  const [urgent, setUrgent] = useState(false);
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"online" | "cash">("online");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: string; otp: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const w = worker.data;
  const subtotal = w ? w.pricePerHour * duration : 0;
  const urgentFee = urgent ? URGENT_FEE : 0;
  const total = subtotal + urgentFee;
  const canConfirm =
    !!w && !!date && (urgent || !!slot) && address.trim().length > 5 && !submitting;

  async function handleConfirm() {
    if (!w || !canConfirm) return;
    setSubmitting(true);
    try {
      const res = await createBooking({
        workerId: w.id,
        workerName: w.name,
        workerPhoto: w.photo,
        customerName: "You",
        service: w.category,
        date,
        slot: urgent ? "ASAP · within 60 min" : slot!,
        status: "pending",
        price: total,
        address: address.trim(),
        urgent,
        payment,
        lat: w.lat,
        lng: w.lng,
      });
      setConfirmed({ id: res.id, otp: res.otp });
    } finally {
      setSubmitting(false);
    }
  }

  if (worker.loading) return <Loading label="Loading worker…" />;
  if (worker.error) return <ErrorState message={worker.error} onRetry={worker.retry} />;
  if (!w) {
    return <ErrorState message="We couldn't find this worker. They may no longer be listed." />;
  }

  /* ---------- login required ---------- */
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="flex flex-col items-center px-6 py-10 text-center">
          <div className="mb-4 rounded-full bg-primary-soft p-4 text-primary">
            <LogIn className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-bold">Log in to book {w.name.split(" ")[0] ?? w.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a free account or log in to confirm this booking, track your OTP and chat with
            your worker.
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

          <button
            onClick={() => navigate({ to: "/search" })}
            className="tap tap-active mt-5 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to search
          </button>
        </Card>
      </div>
    );
  }

  /* ---------- success state ---------- */
  if (confirmed) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="flex flex-col items-center px-6 py-10 text-center">
          <div className="mb-4 rounded-full bg-success-soft p-4 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-bold">Booking confirmed!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {w.name} has been notified and will confirm shortly.
          </p>

          <div className="mt-6 w-full space-y-3">
            <div className="surface flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground">Booking ID</span>
              <span className="font-mono text-sm font-bold">{confirmed.id}</span>
            </div>
            <div className="surface flex items-center justify-between p-4">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Share this OTP on arrival</p>
                <p className="mt-1 font-mono text-2xl font-extrabold tracking-widest text-primary">
                  {confirmed.otp}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(confirmed.otp);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="tap tap-active rounded-lg border border-border p-2.5 hover:bg-secondary"
                aria-label="Copy OTP"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mt-6 flex w-full gap-2">
            <Link to="/" className="flex-1">
              <Button variant="outline" full>
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
            <Link to="/search" className="flex-1">
              <Button full>Book another</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------- booking form ---------- */
  return (
    <div className="mx-auto max-w-3xl pb-28 lg:pb-8">
      <button
        onClick={() => navigate({ to: "/search" })}
        className="tap tap-active mb-4 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* worker summary */}
      <Card className="mb-6 flex gap-3">
        <img src={w.photo} alt={w.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 font-semibold">
            {w.name}
            {w.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
          </p>
          <p className="text-xs text-muted-foreground">
            {w.category} · {w.experienceYears} yrs · {w.cooperative}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Stars value={w.rating} size={12} />
              <span className="font-semibold text-foreground">{w.rating}</span> ({w.reviews})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {w.distanceKm} km
            </span>
          </div>
        </div>
        <p className="shrink-0 self-start text-sm font-bold">
          {inr(w.pricePerHour)}
          <span className="text-xs font-medium text-muted-foreground">/hr</span>
        </p>
      </Card>

      {/* date */}
      <Section title="Select date">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => (
            <button
              key={d.iso}
              onClick={() => setDate(d.iso)}
              className={cn(
                "tap tap-active flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5",
                date === d.iso
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
            >
              <span className="text-[10px] font-semibold uppercase opacity-80">
                {d.label ?? d.dow}
              </span>
              <span className="text-lg font-bold leading-none">{d.day}</span>
              <span className="text-[10px] opacity-80">{d.mon}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* urgent toggle */}
      <Section>
        <Card
          interactive
          onClick={() => {
            setUrgent((u) => !u);
            if (!urgent) setSlot(null);
          }}
          className={cn("flex items-center gap-3", urgent && "border-urgent/40 bg-urgent-soft")}
        >
          <span
            className={cn(
              "rounded-xl p-2.5",
              urgent ? "bg-urgent/15 text-urgent" : "bg-secondary text-muted-foreground",
            )}
          >
            <Zap className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Urgent booking</p>
            <p className="text-xs text-muted-foreground">
              Nearest available worker arrives within 60 min · +{inr(URGENT_FEE)}
            </p>
          </div>
          <span
            className={cn(
              "flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors",
              urgent ? "justify-end bg-urgent" : "justify-start bg-secondary",
            )}
          >
            <span className="h-5 w-5 rounded-full bg-card shadow-sm" />
          </span>
        </Card>
      </Section>

      {/* time slot */}
      {!urgent && (
        <Section title="Select time slot">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SLOTS.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={cn(
                  "tap tap-active flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold",
                  slot === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground",
                )}
              >
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {s}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* duration */}
      <Section title="Estimated duration">
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold">Hours needed</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDuration((d) => Math.max(1, d - 1))}
              className="tap tap-active grid h-9 w-9 place-items-center rounded-lg border border-border text-lg font-bold hover:bg-secondary"
              aria-label="Decrease duration"
            >
              −
            </button>
            <span className="w-6 text-center text-base font-bold">{duration}</span>
            <button
              onClick={() => setDuration((d) => Math.min(8, d + 1))}
              className="tap tap-active grid h-9 w-9 place-items-center rounded-lg border border-border text-lg font-bold hover:bg-secondary"
              aria-label="Increase duration"
            >
              +
            </button>
          </div>
        </Card>
      </Section>

      {/* address */}
      <Section title="Service address">
        <div className="surface flex items-start gap-2 p-3">
          <MapPin className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House / flat no., street, area, landmark…"
            rows={3}
            className="w-full resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </Section>

      {/* payment */}
      <Section title="Payment method">
        <div className="grid grid-cols-2 gap-3">
          <Card
            interactive
            onClick={() => setPayment("online")}
            className={cn(
              "flex flex-col items-center gap-2 py-4 text-center",
              payment === "online" && "border-primary ring-1 ring-primary",
            )}
          >
            <span className="rounded-xl bg-primary-soft p-2.5 text-primary">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">Pay online</span>
            <span className="text-[11px] text-muted-foreground">UPI, card, wallet</span>
          </Card>
          <Card
            interactive
            onClick={() => setPayment("cash")}
            className={cn(
              "flex flex-col items-center gap-2 py-4 text-center",
              payment === "cash" && "border-primary ring-1 ring-primary",
            )}
          >
            <span className="rounded-xl bg-accent-soft p-2.5 text-accent-foreground">
              <Banknote className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">Cash on service</span>
            <span className="text-[11px] text-muted-foreground">Pay after work is done</span>
          </Card>
        </div>
      </Section>

      {/* notes */}
      <Section title="Additional notes (optional)">
        <div className="surface p-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g. bring your own tools, gate code, parking instructions…"
            rows={2}
            className="w-full resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </Section>

      {/* price summary */}
      <Section title="Price summary">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {inr(w.pricePerHour)} × {duration} {duration === 1 ? "hour" : "hours"}
            </span>
            <span className="font-semibold">{inr(subtotal)}</span>
          </div>
          {urgent && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Urgent fee</span>
              <span className="font-semibold">{inr(urgentFee)}</span>
            </div>
          )}
          <div className="my-1 border-t border-border" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-extrabold">{inr(total)}</span>
          </div>
          <p className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            85% goes straight to {w.name.split(" ")[0] ?? w.name} and their cooperative.
          </p>
        </Card>
      </Section>

      {/* desktop confirm */}
      <Button
        size="lg"
        full
        disabled={!canConfirm}
        onClick={handleConfirm}
        className="hidden lg:flex"
      >
        {submitting ? "Confirming…" : `Confirm booking · ${inr(total)}`}
      </Button>

      {/* mobile sticky confirm bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Total</p>
            <p className="text-base font-extrabold leading-tight">{inr(total)}</p>
          </div>
          <Button size="lg" full disabled={!canConfirm} onClick={handleConfirm} className="flex-1">
            {submitting ? "Confirming…" : "Confirm booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}
