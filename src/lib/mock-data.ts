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
} from "./types";

export const categories: ServiceCategory[] = [
  { id: "plumber", name: "Plumber", nameHi: "प्लंबर", icon: "Wrench", basePrice: 299, jobs: 1284, active: true },
  { id: "electrician", name: "Electrician", nameHi: "इलेक्ट्रीशियन", icon: "Zap", basePrice: 349, jobs: 1102, active: true },
  { id: "cleaner", name: "Cleaner", nameHi: "सफाईकर्मी", icon: "Sparkles", basePrice: 249, jobs: 1876, active: true },
  { id: "cook", name: "Cook", nameHi: "रसोइया", icon: "ChefHat", basePrice: 399, jobs: 742, active: true },
  { id: "tutor", name: "Tutor", nameHi: "शिक्षक", icon: "GraduationCap", basePrice: 449, jobs: 517, active: true },
  { id: "carpenter", name: "Carpenter", nameHi: "बढ़ई", icon: "Hammer", basePrice: 379, jobs: 431, active: true },
  { id: "painter", name: "Painter", nameHi: "पेंटर", icon: "PaintRoller", basePrice: 329, jobs: 288, active: true },
  { id: "ac-repair", name: "AC Repair", nameHi: "एसी मरम्मत", icon: "Wind", basePrice: 499, jobs: 655, active: true },
  { id: "gardener", name: "Gardener", nameHi: "माली", icon: "Sprout", basePrice: 279, jobs: 143, active: false },
];

const photo = (seed: string) => `https://i.pravatar.cc/240?u=${seed}`;

export const workers: Worker[] = [
  {
    id: "w1", name: "Ramesh Yadav", photo: photo("ramesh"), category: "Plumber", categoryId: "plumber",
    rating: 4.8, reviews: 214, jobsCompleted: 486, pricePerHour: 320, experienceYears: 9, distanceKm: 1.2,
    cooperative: "Nagar Sahyog Cooperative", verified: true,
    skills: ["Leak repair", "Pipe fitting", "Bathroom install", "Water tank cleaning"],
    bio: "Nine years of plumbing across Pune. Member-owner of Nagar Sahyog Cooperative since 2021.",
    lat: 18.5204, lng: 73.8567, availableToday: true, status: "active",
    documents: [{ name: "Aadhaar", status: "verified" }, { name: "Skill certificate", status: "verified" }],
    earningsThisMonth: 24800,
  },
  {
    id: "w2", name: "Sunita Deshmukh", photo: photo("sunita"), category: "Cleaner", categoryId: "cleaner",
    rating: 4.9, reviews: 331, jobsCompleted: 712, pricePerHour: 260, experienceYears: 6, distanceKm: 2.4,
    cooperative: "Shakti Women's Cooperative", verified: true,
    skills: ["Deep cleaning", "Kitchen degrease", "Sofa shampoo"],
    bio: "Leads a 12-woman cleaning crew. Every booking supports the cooperative's childcare fund.",
    lat: 18.5314, lng: 73.8446, availableToday: true, status: "active",
    documents: [{ name: "Aadhaar", status: "verified" }, { name: "Police verification", status: "verified" }],
    earningsThisMonth: 31200,
  },
  {
    id: "w3", name: "Imran Shaikh", photo: photo("imran"), category: "Electrician", categoryId: "electrician",
    rating: 4.7, reviews: 189, jobsCompleted: 402, pricePerHour: 380, experienceYears: 11, distanceKm: 3.1,
    cooperative: "Nagar Sahyog Cooperative", verified: true,
    skills: ["Wiring", "Inverter setup", "Fan & light", "MCB repair"],
    bio: "Licensed electrician, ITI Pune. Handles emergency callouts within 40 minutes.",
    lat: 18.5089, lng: 73.8553, availableToday: true, status: "active",
    documents: [{ name: "Aadhaar", status: "verified" }, { name: "Electrical licence", status: "pending" }],
    earningsThisMonth: 28600,
  },
  {
    id: "w4", name: "Anita Kulkarni", photo: photo("anita"), category: "Tutor", categoryId: "tutor",
    rating: 4.9, reviews: 96, jobsCompleted: 158, pricePerHour: 470, experienceYears: 8, distanceKm: 4.6,
    cooperative: "Vidya Shikshak Sangh", verified: true,
    skills: ["Maths 6-10", "Science 6-8", "Marathi", "Exam prep"],
    bio: "Maths and science tutor for grades 6-10. Free first session for cooperative referrals.",
    lat: 18.5421, lng: 73.8302, availableToday: false, status: "active",
    documents: [{ name: "Aadhaar", status: "verified" }, { name: "B.Ed degree", status: "verified" }],
    earningsThisMonth: 19400,
  },
  {
    id: "w5", name: "Vikram Patil", photo: photo("vikram"), category: "Cook", categoryId: "cook",
    rating: 4.6, reviews: 142, jobsCompleted: 269, pricePerHour: 410, experienceYears: 7, distanceKm: 2.9,
    cooperative: "Annapurna Rasoi Cooperative", verified: true,
    skills: ["Maharashtrian", "North Indian", "Party catering", "Jain food"],
    bio: "Home cook and event caterer. Cooks for up to 40 guests with two cooperative helpers.",
    lat: 18.5012, lng: 73.8721, availableToday: true, status: "active",
    documents: [{ name: "Aadhaar", status: "verified" }, { name: "FSSAI basic", status: "verified" }],
    earningsThisMonth: 26100,
  },
  {
    id: "w6", name: "Sanjay More", photo: photo("sanjay"), category: "Carpenter", categoryId: "carpenter",
    rating: 4.5, reviews: 78, jobsCompleted: 191, pricePerHour: 350, experienceYears: 14, distanceKm: 5.3,
    cooperative: "Nagar Sahyog Cooperative", verified: true,
    skills: ["Furniture repair", "Modular fitting", "Door alignment"],
    bio: "Fourteen years in woodwork. Specialises in restoring old teak furniture.",
    lat: 18.4901, lng: 73.8201, availableToday: true, status: "active",
    documents: [{ name: "Aadhaar", status: "verified" }],
    earningsThisMonth: 21700,
  },
  {
    id: "w7", name: "Farah Qureshi", photo: photo("farah"), category: "Cleaner", categoryId: "cleaner",
    rating: 4.4, reviews: 54, jobsCompleted: 103, pricePerHour: 240, experienceYears: 3, distanceKm: 1.9,
    cooperative: "Shakti Women's Cooperative", verified: false,
    skills: ["Home cleaning", "Bathroom deep clean"],
    bio: "Joined the cooperative last year through the skilling programme.",
    lat: 18.5265, lng: 73.8712, availableToday: true, status: "pending",
    documents: [{ name: "Aadhaar", status: "verified" }, { name: "Police verification", status: "pending" }],
    earningsThisMonth: 11200,
  },
  {
    id: "w8", name: "Deepak Rathod", photo: photo("deepak"), category: "AC Repair", categoryId: "ac-repair",
    rating: 4.8, reviews: 167, jobsCompleted: 348, pricePerHour: 520, experienceYears: 10, distanceKm: 6.2,
    cooperative: "Cool Care Technicians Co-op", verified: true,
    skills: ["Split AC service", "Gas refill", "Compressor repair"],
    bio: "AC and refrigeration technician serving Kothrud and Baner.",
    lat: 18.5074, lng: 73.8077, availableToday: false, status: "active",
    documents: [{ name: "Aadhaar", status: "verified" }, { name: "HVAC certificate", status: "verified" }],
    earningsThisMonth: 34500,
  },
];

export const bookings: Booking[] = [
  {
    id: "BK-2481", workerId: "w1", workerName: "Ramesh Yadav", workerPhoto: photo("ramesh"),
    customerName: "Priya Nair", customerPhone: "+91 98230 11223", service: "Plumber — Leak repair",
    date: "2026-08-24", slot: "10:00 AM – 11:00 AM", status: "in-progress", price: 640,
    address: "Flat 402, Sunrise Residency, Baner, Pune", urgent: true, otp: "4821", payment: "online",
    lat: 18.5204, lng: 73.8567,
  },
  {
    id: "BK-2479", workerId: "w2", workerName: "Sunita Deshmukh", workerPhoto: photo("sunita"),
    customerName: "Priya Nair", customerPhone: "+91 98230 11223", service: "Cleaner — Deep cleaning",
    date: "2026-08-26", slot: "9:00 AM – 12:00 PM", status: "confirmed", price: 780,
    address: "Flat 402, Sunrise Residency, Baner, Pune", urgent: false, otp: "7391", payment: "cash",
    lat: 18.5314, lng: 73.8446,
  },
  {
    id: "BK-2465", workerId: "w3", workerName: "Imran Shaikh", workerPhoto: photo("imran"),
    customerName: "Priya Nair", customerPhone: "+91 98230 11223", service: "Electrician — Inverter setup",
    date: "2026-08-28", slot: "4:00 PM – 6:00 PM", status: "pending", price: 760,
    address: "Flat 402, Sunrise Residency, Baner, Pune", urgent: false, otp: "1150", payment: "online",
    lat: 18.5089, lng: 73.8553,
  },
  {
    id: "BK-2402", workerId: "w5", workerName: "Vikram Patil", workerPhoto: photo("vikram"),
    customerName: "Priya Nair", customerPhone: "+91 98230 11223", service: "Cook — Party catering",
    date: "2026-08-12", slot: "6:00 PM – 10:00 PM", status: "completed", price: 1640,
    address: "Flat 402, Sunrise Residency, Baner, Pune", urgent: false, otp: "2288", payment: "online",
    lat: 18.5012, lng: 73.8721, rated: false,
  },
  {
    id: "BK-2377", workerId: "w4", workerName: "Anita Kulkarni", workerPhoto: photo("anita"),
    customerName: "Priya Nair", customerPhone: "+91 98230 11223", service: "Tutor — Maths grade 8",
    date: "2026-08-05", slot: "5:00 PM – 6:00 PM", status: "completed", price: 470,
    address: "Flat 402, Sunrise Residency, Baner, Pune", urgent: false, otp: "9043", payment: "cash",
    lat: 18.5421, lng: 73.8302, rated: true,
  },
  {
    id: "BK-2310", workerId: "w6", workerName: "Sanjay More", workerPhoto: photo("sanjay"),
    customerName: "Priya Nair", customerPhone: "+91 98230 11223", service: "Carpenter — Door alignment",
    date: "2026-07-29", slot: "11:00 AM – 1:00 PM", status: "cancelled", price: 700,
    address: "Flat 402, Sunrise Residency, Baner, Pune", urgent: false, otp: "3312", payment: "cash",
    lat: 18.4901, lng: 73.8201,
  },
];

export const incomingRequests: Booking[] = [
  {
    id: "BK-2502", workerId: "w1", workerName: "Ramesh Yadav", workerPhoto: photo("ramesh"),
    customerName: "Aditya Joshi", customerPhone: "+91 90210 44556", service: "Plumber — Tap replacement",
    date: "2026-08-24", slot: "3:00 PM – 4:00 PM", status: "pending", price: 380,
    address: "B-12, Green Meadows, Aundh, Pune", urgent: true, otp: "5561", payment: "online",
    lat: 18.5599, lng: 73.8077,
  },
  {
    id: "BK-2503", workerId: "w1", workerName: "Ramesh Yadav", workerPhoto: photo("ramesh"),
    customerName: "Meera Kulkarni", customerPhone: "+91 99870 33112", service: "Plumber — Water tank cleaning",
    date: "2026-08-25", slot: "8:00 AM – 10:00 AM", status: "pending", price: 900,
    address: "Row House 7, Pashan Link Road, Pune", urgent: false, otp: "6620", payment: "cash",
    lat: 18.5362, lng: 73.7896,
  },
  {
    id: "BK-2504", workerId: "w1", workerName: "Ramesh Yadav", workerPhoto: photo("ramesh"),
    customerName: "Rohit Sharma", customerPhone: "+91 98111 77220", service: "Plumber — Bathroom fitting",
    date: "2026-08-26", slot: "12:00 PM – 2:00 PM", status: "pending", price: 1250,
    address: "Sai Heights, Wakad, Pune", urgent: false, otp: "8834", payment: "online",
    lat: 18.5975, lng: 73.7623,
  },
];

export const reviews: Review[] = [
  { id: "r1", author: "Aditya Joshi", rating: 5, comment: "Fixed the leak in 30 minutes and cleaned up after. Very professional.", date: "2026-08-18", service: "Leak repair" },
  { id: "r2", author: "Meera Kulkarni", rating: 5, comment: "Explained the problem clearly and gave a fair price. Booking again.", date: "2026-08-11", service: "Pipe fitting" },
  { id: "r3", author: "Rohit Sharma", rating: 4, comment: "Good work, arrived 15 minutes late but informed in advance.", date: "2026-08-04", service: "Tap replacement" },
  { id: "r4", author: "Neha Bansal", rating: 5, comment: "Really happy that the money goes back into the workers' cooperative.", date: "2026-07-27", service: "Bathroom install" },
  { id: "r5", author: "Sameer Kale", rating: 4, comment: "Solid job. Would prefer more time slots in the evening.", date: "2026-07-19", service: "Leak repair" },
];

export const messages: Message[] = [
  { id: "m1", from: "them", text: "Namaste! I am on the way, about 12 minutes away.", time: "10:02 AM" },
  { id: "m2", from: "me", text: "Great. The building gate needs a visitor pass, I've informed security.", time: "10:03 AM" },
  { id: "m3", from: "them", text: "Thank you. Is the water supply main valve accessible?", time: "10:05 AM" },
  { id: "m4", from: "me", text: "Yes, it's next to the kitchen balcony.", time: "10:06 AM" },
  { id: "m5", from: "them", text: "Perfect, I have the spare parts with me. See you shortly.", time: "10:07 AM" },
];

export const members: Member[] = [
  { id: "m1", name: "Ramesh Yadav", photo: photo("ramesh"), role: "Plumber", jobs: 42, rating: 4.8, earnings: 24800, share: 85, joined: "2021-03-14", status: "active" },
  { id: "m2", name: "Imran Shaikh", photo: photo("imran"), role: "Electrician", jobs: 38, rating: 4.7, earnings: 28600, share: 85, joined: "2021-06-02", status: "active" },
  { id: "m3", name: "Sanjay More", photo: photo("sanjay"), role: "Carpenter", jobs: 27, rating: 4.5, earnings: 21700, share: 82, joined: "2022-01-19", status: "active" },
  { id: "m4", name: "Sunita Deshmukh", photo: photo("sunita"), role: "Cleaner", jobs: 51, rating: 4.9, earnings: 31200, share: 88, joined: "2020-11-08", status: "active" },
  { id: "m5", name: "Vikram Patil", photo: photo("vikram"), role: "Cook", jobs: 33, rating: 4.6, earnings: 26100, share: 85, joined: "2022-05-23", status: "active" },
  { id: "m6", name: "Farah Qureshi", photo: photo("farah"), role: "Cleaner", jobs: 18, rating: 4.4, earnings: 11200, share: 80, joined: "2025-02-11", status: "on-leave" },
  { id: "m7", name: "Deepak Rathod", photo: photo("deepak"), role: "AC Technician", jobs: 44, rating: 4.8, earnings: 34500, share: 85, joined: "2021-09-30", status: "active" },
  { id: "m8", name: "Anita Kulkarni", photo: photo("anita"), role: "Tutor", jobs: 22, rating: 4.9, earnings: 19400, share: 90, joined: "2023-07-04", status: "active" },
];

export const cooperatives: Cooperative[] = [
  { id: "c1", name: "Nagar Sahyog Cooperative", city: "Pune", members: 34, jobs: 812, revenue: 486000, status: "approved" },
  { id: "c2", name: "Shakti Women's Cooperative", city: "Pune", members: 28, jobs: 964, revenue: 402000, status: "approved" },
  { id: "c3", name: "Annapurna Rasoi Cooperative", city: "Nashik", members: 19, jobs: 431, revenue: 289000, status: "approved" },
  { id: "c4", name: "Cool Care Technicians Co-op", city: "Pune", members: 12, jobs: 322, revenue: 331000, status: "approved" },
  { id: "c5", name: "Vidya Shikshak Sangh", city: "Nagpur", members: 23, jobs: 218, revenue: 174000, status: "pending" },
  { id: "c6", name: "Suraksha Guards Collective", city: "Thane", members: 41, jobs: 0, revenue: 0, status: "pending" },
];

export const transactions: Transaction[] = [
  { id: "TX-9812", date: "2026-08-23", member: "Sunita Deshmukh", service: "Deep cleaning", amount: 780, workerShare: 686, coopShare: 94, method: "online" },
  { id: "TX-9811", date: "2026-08-23", member: "Ramesh Yadav", service: "Leak repair", amount: 640, workerShare: 544, coopShare: 96, method: "online" },
  { id: "TX-9805", date: "2026-08-22", member: "Deepak Rathod", service: "AC gas refill", amount: 1450, workerShare: 1232, coopShare: 218, method: "cash" },
  { id: "TX-9799", date: "2026-08-22", member: "Imran Shaikh", service: "Inverter setup", amount: 760, workerShare: 646, coopShare: 114, method: "online" },
  { id: "TX-9788", date: "2026-08-21", member: "Vikram Patil", service: "Party catering", amount: 1640, workerShare: 1394, coopShare: 246, method: "online" },
  { id: "TX-9770", date: "2026-08-20", member: "Anita Kulkarni", service: "Maths tuition", amount: 470, workerShare: 423, coopShare: 47, method: "cash" },
  { id: "TX-9761", date: "2026-08-19", member: "Sanjay More", service: "Furniture repair", amount: 700, workerShare: 574, coopShare: 126, method: "cash" },
  { id: "TX-9755", date: "2026-08-19", member: "Farah Qureshi", service: "Home cleaning", amount: 420, workerShare: 336, coopShare: 84, method: "online" },
];

export const disputes: Dispute[] = [
  { id: "DP-118", booking: "BK-2402", raisedBy: "Priya Nair", against: "Vikram Patil", issue: "Catering arrived 45 minutes late for an event.", status: "investigating", date: "2026-08-14" },
  { id: "DP-117", booking: "BK-2288", raisedBy: "Aditya Joshi", against: "Farah Qureshi", issue: "Charged above the quoted price for extra rooms.", status: "open", date: "2026-08-12" },
  { id: "DP-115", booking: "BK-2201", raisedBy: "Sanjay More", against: "Rahul Mehta", issue: "Customer refused payment after job completion.", status: "resolved", date: "2026-08-03" },
  { id: "DP-112", booking: "BK-2140", raisedBy: "Neha Bansal", against: "Cool Care Technicians Co-op", issue: "Repeated rescheduling of AC service.", status: "resolved", date: "2026-07-28" },
];

export const users: AppUser[] = [
  { id: "u1", name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 98230 11223", city: "Pune", role: "customer", joined: "2024-04-12", status: "active", bookings: 24 },
  { id: "u2", name: "Aditya Joshi", email: "aditya.j@example.com", phone: "+91 90210 44556", city: "Pune", role: "customer", joined: "2024-08-01", status: "active", bookings: 11 },
  { id: "u3", name: "Ramesh Yadav", email: "ramesh.y@example.com", phone: "+91 97640 88123", city: "Pune", role: "worker", joined: "2021-03-14", status: "active", bookings: 486 },
  { id: "u4", name: "Sunita Deshmukh", email: "sunita.d@example.com", phone: "+91 99201 55411", city: "Pune", role: "worker", joined: "2020-11-08", status: "active", bookings: 712 },
  { id: "u5", name: "Rahul Mehta", email: "rahul.m@example.com", phone: "+91 98110 22334", city: "Mumbai", role: "customer", joined: "2025-01-22", status: "suspended", bookings: 3 },
  { id: "u6", name: "Kavita Rane", email: "kavita.r@example.com", phone: "+91 90045 66771", city: "Nashik", role: "coop", joined: "2022-06-15", status: "active", bookings: 0 },
  { id: "u7", name: "Neha Bansal", email: "neha.b@example.com", phone: "+91 98700 44112", city: "Pune", role: "customer", joined: "2023-09-19", status: "active", bookings: 39 },
  { id: "u8", name: "Deepak Rathod", email: "deepak.r@example.com", phone: "+91 97300 99001", city: "Pune", role: "worker", joined: "2021-09-30", status: "active", bookings: 348 },
];

export const earningsWeek = [
  { label: "Mon", earnings: 1240, jobs: 3 },
  { label: "Tue", earnings: 980, jobs: 2 },
  { label: "Wed", earnings: 1720, jobs: 4 },
  { label: "Thu", earnings: 640, jobs: 2 },
  { label: "Fri", earnings: 2130, jobs: 5 },
  { label: "Sat", earnings: 2680, jobs: 6 },
  { label: "Sun", earnings: 1450, jobs: 3 },
];

export const earningsMonth = [
  { label: "Week 1", earnings: 8600, jobs: 19 },
  { label: "Week 2", earnings: 10240, jobs: 24 },
  { label: "Week 3", earnings: 9180, jobs: 21 },
  { label: "Week 4", earnings: 10840, jobs: 26 },
];

export const jobsOverTime = [
  { label: "Mar", jobs: 118, revenue: 62000 },
  { label: "Apr", jobs: 142, revenue: 74500 },
  { label: "May", jobs: 165, revenue: 88200 },
  { label: "Jun", jobs: 151, revenue: 81900 },
  { label: "Jul", jobs: 189, revenue: 99400 },
  { label: "Aug", jobs: 214, revenue: 116800 },
];

export const categoryBreakdown = [
  { name: "Cleaning", value: 34 },
  { name: "Plumbing", value: 22 },
  { name: "Electrical", value: 18 },
  { name: "Cooking", value: 14 },
  { name: "Tutoring", value: 12 },
];

export const platformTrend = [
  { label: "Mar", users: 8400, bookings: 3120, revenue: 1240000 },
  { label: "Apr", users: 9600, bookings: 3680, revenue: 1418000 },
  { label: "May", users: 11250, bookings: 4310, revenue: 1662000 },
  { label: "Jun", users: 12980, bookings: 4880, revenue: 1873000 },
  { label: "Jul", users: 14710, bookings: 5620, revenue: 2141000 },
  { label: "Aug", users: 16340, bookings: 6205, revenue: 2394000 },
];

export const areaDemand = [
  { area: "Baner", lat: 18.5590, lng: 73.7868, top: "Plumbing", requests: 412, unmet: 38 },
  { area: "Kothrud", lat: 18.5074, lng: 73.8077, top: "AC Repair", requests: 368, unmet: 51 },
  { area: "Viman Nagar", lat: 18.5679, lng: 73.9143, top: "Cleaning", requests: 502, unmet: 22 },
  { area: "Hadapsar", lat: 18.5089, lng: 73.9260, top: "Electrical", requests: 289, unmet: 64 },
  { area: "Kharadi", lat: 18.5515, lng: 73.9470, top: "Cooking", requests: 244, unmet: 19 },
];

export const notifications = [
  { id: "n1", title: "New job request", body: "Aditya Joshi requested a tap replacement — urgent.", time: "5 min ago", unread: true },
  { id: "n2", title: "Payment received", body: "₹640 credited for booking BK-2481.", time: "1 hr ago", unread: true },
  { id: "n3", title: "Cooperative announcement", body: "Monthly member meeting on 28 Aug, 7 PM at the Baner office.", time: "Yesterday", unread: false },
  { id: "n4", title: "New 5-star review", body: "Meera Kulkarni rated your service 5 stars.", time: "2 days ago", unread: false },
];

export const savedAddresses = [
  { id: "a1", label: "Home", line: "Flat 402, Sunrise Residency, Baner, Pune 411045", primary: true },
  { id: "a2", label: "Parents", line: "14 Shanti Nagar, Kothrud, Pune 411038", primary: false },
  { id: "a3", label: "Office", line: "5th floor, Tech Park One, Yerwada, Pune 411006", primary: false },
];

export const paymentMethods = [
  { id: "p1", label: "UPI — priya@okaxis", type: "UPI", primary: true },
  { id: "p2", label: "HDFC Credit •••• 4412", type: "Card", primary: false },
  { id: "p3", label: "Cash on completion", type: "Cash", primary: false },
];

export const timeSlots = [
  "8:00 AM – 9:00 AM",
  "9:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM",
  "12:00 PM – 1:00 PM",
  "2:00 PM – 3:00 PM",
  "4:00 PM – 5:00 PM",
  "6:00 PM – 7:00 PM",
];
