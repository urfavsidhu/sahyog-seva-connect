import * as mock from "@/lib/mock-data";
import type {
  AppUser,
  Booking,
  Cooperative,
  Dispute,
  Member,
  Message,
  Review,
  ServiceCategory,
  Transaction,
  Worker,
} from "@/lib/types";
import { request } from "./client";

/* ---------------- catalogue ---------------- */
export const getCategories = () => request<ServiceCategory[]>("/categories", mock.categories);

export const getWorkers = () => request<Worker[]>("/workers", mock.workers);

export const getWorker = async (id: string) => {
  const list = await getWorkers();
  return list.find((w) => w.id === id) ?? null;
};

export const searchWorkers = async (params: {
  q?: string;
  category?: string;
  maxDistance?: number;
  maxPrice?: number;
  minRating?: number;
}) => {
  const list = await getWorkers();
  return list.filter(
    (w) =>
      (!params.q ||
        w.name.toLowerCase().includes(params.q.toLowerCase()) ||
        w.category.toLowerCase().includes(params.q.toLowerCase()) ||
        w.skills.some((s) => s.toLowerCase().includes(params.q!.toLowerCase()))) &&
      (!params.category || params.category === "all" || w.categoryId === params.category) &&
      (params.maxDistance === undefined || w.distanceKm <= params.maxDistance) &&
      (params.maxPrice === undefined || w.pricePerHour <= params.maxPrice) &&
      (params.minRating === undefined || w.rating >= params.minRating),
  );
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
