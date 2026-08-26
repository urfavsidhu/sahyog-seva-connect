export type Role = "customer" | "worker" | "coop" | "admin";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface ServiceCategory {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  basePrice: number;
  jobs: number;
  active: boolean;
}

export interface Worker {
  id: string;
  name: string;
  photo: string;
  category: string;
  categoryId: string;
  rating: number;
  reviews: number;
  jobsCompleted: number;
  pricePerHour: number;
  experienceYears: number;
  distanceKm: number;
  cooperative: string;
  verified: boolean;
  skills: string[];
  bio: string;
  lat: number;
  lng: number;
  availableToday: boolean;
  status: "active" | "pending" | "suspended";
  documents: { name: string; status: "verified" | "pending" | "rejected" }[];
  earningsThisMonth: number;
}

export interface Booking {
  id: string;
  workerId: string;
  workerName: string;
  workerPhoto: string;
  customerName: string;
  customerPhone: string;
  service: string;
  date: string;
  slot: string;
  status: BookingStatus;
  price: number;
  address: string;
  urgent: boolean;
  otp: string;
  payment: "online" | "cash";
  lat: number;
  lng: number;
  rated?: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

export interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Member {
  id: string;
  name: string;
  photo: string;
  role: string;
  jobs: number;
  rating: number;
  earnings: number;
  share: number;
  joined: string;
  status: "active" | "on-leave";
}

export interface Cooperative {
  id: string;
  name: string;
  city: string;
  members: number;
  jobs: number;
  revenue: number;
  status: "approved" | "pending" | "rejected";
}

export interface Transaction {
  id: string;
  date: string;
  member: string;
  service: string;
  amount: number;
  workerShare: number;
  coopShare: number;
  method: "online" | "cash";
}

export interface Dispute {
  id: string;
  booking: string;
  raisedBy: string;
  against: string;
  issue: string;
  status: "open" | "investigating" | "resolved";
  date: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: Role;
  joined: string;
  status: "active" | "suspended";
  bookings: number;
}
