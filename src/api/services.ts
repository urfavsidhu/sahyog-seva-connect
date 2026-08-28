import type {
  AppUser,
  AppNotification,
  Booking,
  Cooperative,
  Dispute,
  Member,
  Message,
  Review,
  Role,
  ServiceCategory,
  Transaction,
  Worker,
} from "@/lib/types";
import { request } from "./client";

/* ---------------- auth ---------------- */
export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string; role: Role };
}

export const login = (payload: { email: string; password: string }) =>
  request<AuthResponse>("/auth/login", { method: "POST", body: payload });

export const signup = (payload: {
  name: string;
  email: string;
  phone: string;
  city?: string;
  password: string;
  role: Role;
}) => request<AuthResponse>("/auth/signup", { method: "POST", body: payload });

/* ---------------- catalogue ---------------- */
export const getCategories = () => request<ServiceCategory[]>("/categories");

export const getWorkers = () => request<Worker[]>("/workers");

// Admin-only — every worker regardless of status (verification queue).
// admin/workers.tsx currently imports `getWorkers` instead of this; it
// needs to switch over for pending/suspended workers to actually show up.
export const getAllWorkersAdmin = () => request<Worker[]>("/workers/admin");

export const getWorker = (id: string) => request<Worker>(`/workers/${id}`);

export const getCurrentWorker = () => request<Worker>("/workers/me");

export const getWorkerBookings = async () =>
  (await request<unknown[]>("/workers/me/bookings")).map(mapBooking);

export const searchWorkers = (params: {
  q?: string;
  category?: string;
  maxDistance?: number;
  maxPrice?: number;
  minRating?: number;
  /** Chosen location (from the navbar location picker) that distance is measured from. */
  origin?: { lat: number; lng: number };
}) => {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  if (params.maxDistance !== undefined) qs.set("maxDistance", String(params.maxDistance));
  if (params.maxPrice !== undefined) qs.set("maxPrice", String(params.maxPrice));
  if (params.minRating !== undefined) qs.set("minRating", String(params.minRating));
  if (params.origin) {
    qs.set("lat", String(params.origin.lat));
    qs.set("lng", String(params.origin.lng));
  }
  const query = qs.toString();
  return request<Worker[]>(`/workers/search${query ? `?${query}` : ""}`);
};

/* ---------------- bookings ---------------- */
// Backend stores the worker reference as `worker` (Mongo ObjectId); the
// frontend's Booking type expects `workerId`. This adapter bridges that.
function mapBooking(raw: any): Booking {
  return { ...raw, id: raw.id ?? raw._id, workerId: raw.worker };
}

export const getBookings = async () => (await request<unknown[]>("/bookings/me")).map(mapBooking);

// Admin-only — every booking across every customer. admin/bookings.tsx and
// admin/index.tsx currently import `getBookings` instead of this; they
// need to switch over to see more than just the admin's own bookings.
export const getAllBookingsAdmin = async () =>
  (await request<unknown[]>("/bookings/admin")).map(mapBooking);

export const getBooking = async (id: string) => mapBooking(await request<unknown>(`/bookings/${id}`));

export const getIncomingRequests = async () =>
  (await request<unknown[]>("/bookings/requests")).map(mapBooking);

export const createBooking = async (payload: Partial<Booking> & { workerId: string }) =>
  mapBooking(await request<unknown>("/bookings", { method: "POST", body: payload }));

export const updateBookingStatus = (id: string, status: Booking["status"], otp?: string) =>
  request(`/bookings/${id}/status`, { method: "PATCH", body: { status, otp } });

export const submitReview = (payload: { bookingId: string; rating: number; comment: string }) =>
  request<Review>("/reviews", { method: "POST", body: payload });

/* ---------------- people ---------------- */
export const getReviews = (workerId?: string) =>
  request<Review[]>(`/reviews${workerId ? `?workerId=${workerId}` : ""}`);

// NOTE: chat.tsx currently calls getMessages() with no bookingId and
// simulates the rest of the thread locally (fake auto-replies) — it isn't
// wired to real per-booking chat yet. Kept optional here, returning an
// empty thread when no bookingId is passed, so nothing throws until
// chat.tsx is updated to pass the active conversation's bookingId.
export const getMessages = (bookingId?: string) =>
  bookingId ? request<Message[]>(`/messages/${bookingId}`) : Promise.resolve([] as Message[]);

export const sendMessage = (bookingId: string, text: string) =>
  request<Message>(`/messages/${bookingId}`, { method: "POST", body: { text } });

export const getMembers = () => request<Member[]>("/coop/members");

export const getCooperatives = () => request<Cooperative[]>("/coop");

export const getUsers = () => request<AppUser[]>("/users");

export const getCurrentUser = () => request<AppUser>("/users/me");

export const updateProfile = (payload: Partial<AppUser>) =>
  request<AppUser>("/users/me", { method: "PATCH", body: payload });

export const getTransactions = () => request<Transaction[]>("/analytics/transactions");

export const getDisputes = () => request<Dispute[]>("/analytics/disputes");

export const getNotifications = () => request<AppNotification[]>("/notifications");

/* ---------------- analytics ---------------- */
// NOTE: backend returns { week, month, total } as totals, not the
// day/week-by-day chart series pro/earnings.tsx expects (mock.earningsWeek/
// earningsMonth are arrays of { label, earnings, jobs }). Wired through
// as-is for now — the earnings chart will need analytics.controller.ts
// updated to return a real per-day/per-week breakdown, and this function
// updated to match, before that page renders correctly.
export const getWorkerEarnings = () =>
  request<{ week: number; month: number; total: number }>("/analytics/worker");

interface DateValue {
  date: string;
  value: number;
}

export const getCoopAnalytics = async () => {
  const data = await request<{
    jobsOverTime: DateValue[];
    categoryBreakdown: { name: string; value: number }[];
  }>("/coop/analytics");
  return {
    // NOTE: backend's jobsOverTime currently counts jobs, not revenue, but
    // the chart in coop/analytics.tsx reads a "revenue" field. Renamed
    // honestly to `jobs` here — the chart will need a real per-date revenue
    // aggregation added server-side to show correct figures.
    jobsOverTime: data.jobsOverTime.map((d) => ({ label: d.date, jobs: d.value })),
    categoryBreakdown: data.categoryBreakdown,
  };
};

export const getPlatformAnalytics = async () => {
  const data = await request<{
    trend: DateValue[];
    areaDemand: { name: string; value: number }[];
  }>("/analytics/platform");
  return {
    trend: data.trend.map((d) => ({ label: d.date, revenue: d.value })),
    // NOTE: admin/demand.tsx expects { area, lat, lng, top, requests, unmet }
    // per area for its map + table. Backend's areaDemand is currently just
    // a { name, value } count by category, not by geographic area — this
    // page needs a proper area-based demand endpoint before it'll work.
    areaDemand: data.areaDemand as unknown as {
      area: string;
      lat: number;
      lng: number;
      top: string;
      requests: number;
      unmet: number;
    }[],
  };
};
