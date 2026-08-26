# Sahyog Seva Connect

Build a complete, production-quality, fully responsive frontend for "SahyogSeva" — a Cooperative Gig Services Platform connecting local service workers (plumbers, electricians, tutors, cooks, cleaners) with customers through worker cooperatives (not a single company, unlike Urban Company). This is frontend-only for now — use mock/dummy data and local state everywhere; no real backend yet, but structure API calls in a separate services/ or api/ folder using placeholder functions so a real backend can be plugged in later without touching UI components.

Tech Stack

React.js + React Router for navigation

Tailwind CSS for all styling

Recharts for dashboard analytics/charts

Leaflet.js + OpenStreetMap for map views (use dummy coordinates/markers)

Lucide icons for iconography

Fully responsive: mobile-first design, must look and feel comfortable on phone screens (narrow width, touch-friendly tap targets, bottom nav on mobile) AND look polished on desktop (wider layouts, sidebar nav, multi-column grids) — test both breakpoints carefully

Design Requirements (very important)

Clean, modern, trustworthy look — this is a service booking app, so it should feel reliable and easy, similar in polish to Urban Company/UrbanClap but with its own distinct visual identity (don't literally copy their branding)

Consistent color system: pick a primary brand color (suggest a warm, trustworthy tone — e.g., teal or deep blue) plus a secondary accent; use them consistently across buttons, links, active states

Consistent typography scale, spacing, and card/button styles across all screens — no mismatched styles page to page

Mobile: bottom tab navigation for primary actions (Home/Search, Bookings, Chat, Profile); large tappable buttons; forms broken into simple steps rather than long single forms

Desktop: left sidebar navigation, wider content area, dashboard-style grids for admin/cooperative views

Loading states, empty states (e.g., "no bookings yet"), and error states for every data-driven screen

Smooth micro-interactions: hover states, button press feedback, transitions between steps

Role-Based Structure

Build separate route groups/dashboards for four roles, with a role switcher in dev/demo mode (since there's no real auth yet, add a simple "Login as: Customer / Worker / Cooperative Admin / Super Admin" screen to preview all four):

1. Customer Flow

Landing/Home page — hero section explaining the cooperative concept, service category grid (plumber, electrician, tutor, cleaner, cook, etc.) with icons, search bar

Service search & results page — filter by category, location/distance, price range, rating; list/grid of nearby workers with photo, name, rating, price, "cooperative verified" badge

Worker profile page — skills, experience, rating breakdown, reviews, completed jobs count, availability calendar, "Book Now" CTA

Booking flow — step-by-step: select date & time slot → confirm address/location on map → see estimated price → choose payment method (online/cash) → confirm

Emergency/urgent booking option — a distinct, visually urgent (but not alarming) flag/toggle for priority service requests

Booking confirmation screen — summary, worker assigned, OTP shown for job completion

Booking history page — past and upcoming bookings, status badges (pending/confirmed/in-progress/completed/cancelled)

Active booking tracking screen — live status, worker's live location on map (mock), in-app chat button

Chat screen — customer ↔ worker messaging UI (mock messages)

Ratings & review submission screen — after job completion, star rating + comment

Cancel/reschedule flow — accessible from booking details

Customer profile/settings page — saved addresses, payment methods, notification preferences

2. Worker Flow

Worker onboarding/registration flow — multi-step: personal details → document upload (mock file upload UI) → services offered (multi-select with custom pricing per service) → service area radius (map picker) → availability calendar setup

Worker home/dashboard — today's jobs, quick stats (earnings this week, rating, jobs completed)

Incoming booking requests screen — accept/reject cards with customer details, location, timing

Job details/active job screen — customer info, location on map, chat button, "mark complete" with OTP entry

Earnings dashboard — daily/weekly/monthly breakdown chart, transaction list

Work calendar view — visual calendar showing booked slots and availability

Worker profile/edit page — edit services, pricing, availability, service area

Ratings received screen — list of customer reviews

Notifications screen — new job alerts, cooperative announcements

3. Cooperative Admin Flow

Cooperative dashboard (overview) — total members, total jobs this month, collective earnings, top performer highlight, all shown as summary cards + charts

Member management screen — list of workers in the cooperative, add/remove members, view individual performance

Job assignment screen — incoming jobs for the cooperative, assign to suitable member (show suggested best-match member first)

Revenue-sharing screen — commission/split rules setup, per-member earnings breakdown table, transparent calculation shown clearly (e.g., "Job ₹500 → Worker ₹425 (85%) → Cooperative fund ₹75 (15%)")

Cooperative service listings screen — manage which services the cooperative offers collectively

Transaction history screen — full ledger, filterable by member/date

Cooperative analytics screen — charts for jobs over time, revenue trends, service-category breakdown

4. Super Admin Flow

Admin dashboard (overview) — platform-wide stats: total users, workers, cooperatives, bookings, revenue, shown as cards + trend charts

User management screen — table of all users, search/filter, view/suspend

Worker management screen — table of all workers, verification status, approve/reject documents

Cooperative management screen — table of all cooperatives, approve new cooperative registrations

Service categories management — add/edit/remove service categories

Booking monitoring screen — table of all platform bookings with status filters

Payments & commissions screen — platform-wide financial overview

Complaints/disputes screen — list of raised disputes with status and resolution actions

Area-wise demand analytics screen — map or chart showing which areas need which services most

5. Shared/Cross-Cutting Screens

AI chatbot widget — floating chat icon (bottom-right), opens a chat panel for booking help/FAQs; UI should support both Hindi and English text (add a language toggle)

Voice booking button — mic icon on the search/home page that visually indicates "listening" state (UI only, mock the transcription result)

Language switcher — Hindi/English toggle accessible from a top-level settings/nav location

Notification center — bell icon with dropdown/panel, shared across roles

404 and error pages

Mobile-Specific Requirements

Bottom tab bar for Customer and Worker roles (Home, Bookings, Chat, Profile)

Cooperative Admin and Super Admin dashboards should collapse into a hamburger-menu + full-width single-column layout on mobile, since these are data-heavy

All forms should be touch-optimized (large inputs, clear labels, minimal typing where possible — use pickers/steppers over free text)

Charts should remain readable on small screens (simplify or stack on mobile rather than shrinking illegibly)

Data

Use realistic mock/dummy data throughout (sample workers with names, ratings, prices; sample bookings in various states; sample cooperative with 5-10 members) so the app feels alive during demo, not empty.

## Development

You need Node.js/Bun installed.

\`\`\`sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev
\`\`\`
