import * as mock from "@/lib/mock-data";
import { distanceKm as haversineKm } from "@/lib/locations";
import type {
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
export const login = (payload: { email: string; password: string }) =>
  request<{ token: string }>("/auth/login", { token: "mock-jwt-token" });

export const signup = (payload: {
  name: string;
  email: string;
  phone: string;
  city?: string;
  password: string;
  role: Role;
}) => request<{ token: string }>("/auth/signup", { token: "mock-jwt-token" });

/* ---------------- catalogue ---------------- */
export const getCategories = () => request<ServiceCategory[]>("/categories", mock.categories);

export const getWorkers = () => request<Worker[]>("/workers", mock.workers);

export const getWorker = async (id: string) => {
  const list = await getWorkers();
  return list.find((w) => w.id === id) ?? null;
};

// Demo session: the "logged in" worker for all /pro/* screens.
export const CURRENT_WORKER_ID = "w1";
export const getCurrentWorker = async () => {
  const list = await getWorkers();
  return list.find((w) => w.id === CURRENT_WORKER_ID) ?? list[0] ?? null;
};
export const getWorkerBookings = async () => {
  const list = await getBookings();
  return list.filter((b) => b.workerId === CURRENT_WORKER_ID);
};

export const searchWorkers = async (params: {
  q?: string;
  category?: string;
  maxDistance?: number;
  maxPrice?: number;
  minRating?: number;
  /** Chosen location (from the navbar location picker) that distance is measured from. */
  origin?: { lat: number; lng: number };
}) => {
  const list = await getWorkers();
  // When a location is selected, recompute each worker's distance from that
  // point instead of relying on the static mock distanceKm.
  const withDistance = params.origin
    ? list.map((w) => ({ ...w, distanceKm: haversineKm(params.origin!, { lat: w.lat, lng: w.lng }) }))
    : list;

  return withDistance
    .filter(
      (w) =>
        (!params.q ||
          w.name.toLowerCase().includes(params.q.toLowerCase()) ||
          w.category.toLowerCase().includes(params.q.toLowerCase()) ||
          w.skills.some((s) => s.toLowerCase().includes(params.q!.toLowerCase()))) &&
        (!params.category || params.category === "all" || w.categoryId === params.category) &&
        (params.maxDistance === undefined || w.distanceKm <= params.maxDistance) &&
        (params.maxPrice === undefined || w.pricePerHour <= params.maxPrice) &&
        (params.minRating === undefined || w.rating >= params.minRating),
    )
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

/* ---------------- bookings ---------------- */
export const getBookings = () => request<Booking[]>("/bookings", mock.bookings);
export const getBooking = async (id: string) =>
  (await getBookings()).find((b) => b.id === id) ?? null;
export const getIncomingRequests = () =>
  request<Booking[]>("/worker/requests", mock.incomingRequests);
export const createBooking = (payload: Partial<Booking>) =>
  request<Partial<Booking> & { id: string; otp: string }>("/bookings", {
    ...payload,
    id: `BK-${Math.floor(2500 + Math.random() * 400)}`,
    otp: String(Math.floor(1000 + Math.random() * 9000)),
  });
export const updateBookingStatus = (id: string, status: Booking["status"]) =>
  request("/bookings/status", { id, status });
export const submitReview = (payload: { bookingId: string; rating: number; comment: string }) =>
  request("/reviews", payload);

/* ---------------- people ---------------- */
export const getReviews = () => request<Review[]>("/reviews", mock.reviews);
export const getMessages = () => request<Message[]>("/messages", mock.messages);
export const getMembers = () => request<Member[]>("/coop/members", mock.members);
export const getCooperatives = () => request<Cooperative[]>("/cooperatives", mock.cooperatives);
export const getUsers = () => request<AppUser[]>("/users", mock.users);
export const getCurrentUser = async () => {
  const list = await getUsers();
  return list.find((u) => u.id === "u1") ?? list[0] ?? null;
};
export const updateProfile = (payload: Partial<AppUser>) =>
  request<Partial<AppUser>>("/profile", payload);
export const getTransactions = () => request<Transaction[]>("/transactions", mock.transactions);
export const getDisputes = () => request<Dispute[]>("/disputes", mock.disputes);
export const getNotifications = () => request("/notifications", mock.notifications);

/* ---------------- analytics ---------------- */
export const getWorkerEarnings = () =>
  request("/worker/earnings", { week: mock.earningsWeek, month: mock.earningsMonth });
export const getCoopAnalytics = () =>
  request("/coop/analytics", {
    jobsOverTime: mock.jobsOverTime,
    categoryBreakdown: mock.categoryBreakdown,
  });
export const getPlatformAnalytics = () =>
  request("/admin/analytics", { trend: mock.platformTrend, areaDemand: mock.areaDemand });
