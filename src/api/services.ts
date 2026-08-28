import type {
  AppNotification,
  AppUser,
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
function mapBooking(raw: any): Booking {
  return { ...raw, id: raw.id ?? raw._id, workerId: raw.worker };
}

export const getBookings = async () => (await request<unknown[]>("/bookings/me")).map(mapBooking);

// Admin-only — every booking across every customer.
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
interface EarningsBucket {
  label: string;
  earnings: number;
  jobs: number;
}

export const getWorkerEarnings = () =>
  request<{ week: EarningsBucket[]; month: EarningsBucket[]; total: number }>(
    "/analytics/worker",
  );

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
