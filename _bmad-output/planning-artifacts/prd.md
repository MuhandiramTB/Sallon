---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain-skipped", "step-06-innovation-skipped", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
inputDocuments: ["product-brief-Sallon.md", "product-brief-Sallon-distillate.md"]
workflowType: 'prd'
documentCounts:
  briefs: 2
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
---

# Product Requirements Document - Sallon

**Author:** ThilanBuddhikaBISTEC
**Date:** 2026-04-01

## Executive Summary

**Sallon** is a self-hosted, white-label web booking platform for salon and spa businesses. It replaces phone-based scheduling, paper appointment books, and walk-in chaos with a simple online system where customers browse services, see real-time availability, and book in seconds.

The platform serves two audiences: **customers** who want frictionless online booking without downloading apps or creating complex accounts, and **salon owners** who need a centralized schedule view, service management, and system-enforced double-booking prevention — without paying monthly SaaS fees.

Built on React, Node.js/Express, and SQLite, Sallon is designed for single-server deployment on low-cost infrastructure. It is a **greenfield product** targeting small and village-level salons that are priced out of platforms like Fresha, Booksy, and Vagaro. The platform is fully rebrandable — change the name, logo, colors, and service catalog to deploy for any salon or spa client.

### What Makes This Special

- **Zero recurring cost** — Self-hosted, no subscriptions. A village salon paying $0/month instead of $50-80/month on SaaS platforms.
- **Instant setup** — Admin seeds a few services, sets operating hours, and the system is live. No complex onboarding or training.
- **WhatsApp-ready sharing** — Salon owners share booking links via WhatsApp status/groups — the natural distribution channel for small local businesses.
- **White-label business model** — Developers/agencies can deploy customized instances for multiple salon clients, charging setup fees.
- **The anti-SaaS approach** — 5 features that work perfectly vs. 100 features nobody uses. Built for salon owners who aren't tech-savvy.

**Core insight:** Small salons don't need enterprise software. They need a booking page their customers can find on WhatsApp and a dashboard they can check on their phone between appointments.

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Project Type** | Web Application (SPA, mobile-first responsive) |
| **Domain** | General / Small Business (Service Industry — Appointments) |
| **Complexity** | Low — well-understood domain, no regulatory requirements |
| **Project Context** | Greenfield — building from scratch |
| **Tech Stack** | React + Tailwind CSS, Node.js + Express, SQLite, JWT Auth |

## Success Criteria

### User Success
- **Customer booking speed:** Complete a booking in under 60 seconds (browse → select → confirm)
- **Zero friction entry:** Customer can book via a shared WhatsApp link — no app install, minimal account setup
- **Booking confidence:** Customer sees real-time availability and gets instant confirmation — no "we'll call you back"
- **Self-service:** Customer can view their own booking history and status without calling the salon

### Business Success
- **Admin setup time:** New salon instance fully configured (services, hours, pricing) in under 5 minutes
- **Rebrand turnaround:** Developer can rebrand and deploy for a new salon client in under 1 hour
- **Operational reliability:** Zero double bookings — system-enforced, not human-dependent
- **Cost advantage:** Platform runs on a $5/month VPS — 10x cheaper than any SaaS alternative
- **Adoption target:** Deployable for 5-10 real salons within first 3 months of launch

### Technical Success
- **Lightweight:** Runs on < 1GB RAM, single server, SQLite — no external dependencies
- **Responsive:** Page load under 2 seconds on 3G mobile connections
- **Mobile-first:** All customer flows fully usable on smartphone screens
- **White-label ready:** Name, logo, colors, service catalog configurable without code changes

### Measurable Outcomes
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Booking completion rate | > 80% of started bookings | Bookings created / service page views |
| Double bookings | 0 | System constraint — impossible by design |
| Admin onboarding | < 5 min to first bookable service | Time from login to first service created |
| Page load (mobile) | < 2s on 3G | Lighthouse performance audit |
| Rebranding effort | < 1 hour | Config file changes only |

## Product Scope

### MVP - Minimum Viable Product
- User registration & login (JWT)
- Admin role with protected dashboard
- Service categories (admin-configurable)
- Service CRUD (name, description, duration, price, category)
- Admin-configurable operating hours
- Date-based time slot generation (based on service duration)
- Booking creation with system-enforced double-booking prevention
- Booking status lifecycle (Pending → Confirmed → Completed → Cancelled)
- Customer booking history view
- Admin booking management (view, filter, update status)
- Mobile-first responsive UI
- Shareable booking link (WhatsApp-ready)

### Growth Features (Post-MVP)
- Staff/stylist assignment per booking
- Guest booking (no account required)
- Email/SMS booking confirmations
- Basic analytics (bookings per day, popular services, revenue)
- Customer cancellation with time-window rules
- Service images and gallery

### Vision (Future)
- Online payment integration (Stripe, etc.)
- Multi-location support
- Customer loyalty program
- Plugin/module architecture
- Marketplace of salon templates
- Calendar sync (Google, iCal)
- Recurring appointment scheduling

## User Journeys

### Journey 1: Nimal — The Customer (Happy Path)

**Who:** Nimal, 28, works at a nearby office. Gets his hair cut every 3 weeks. Tired of calling the salon during lunch break only to hear "fully booked today, sir."

**Opening Scene:** It's Thursday evening. Nimal sees a WhatsApp status from his regular salon: "Book online now! No more waiting." He taps the link on his phone.

**Rising Action:** The booking page loads instantly. He sees three categories: Boys, Ladies, Spa. He taps "Boys" → sees "Haircut - Rs. 500 (30 min)", "Beard Trim - Rs. 300 (15 min)". He picks "Haircut", selects Saturday, and sees green time slots for the day. 10:00 AM is open — perfect.

**Climax:** He taps 10:00 AM, confirms the booking. Instantly sees: "Booking Confirmed — Saturday 10:00 AM, Haircut." No call. No waiting. Done in 40 seconds.

**Resolution:** Saturday morning, Nimal walks in at 10:00 AM. His slot is ready. No queue. He thinks: "Why didn't every salon have this?"

**Capabilities revealed:** Service browsing, category filtering, date picker, time slot display, booking creation, instant confirmation, booking history.

---

### Journey 2: Nimal — The Customer (Edge Case: Slot Taken)

**Opening Scene:** Nimal tries to book his usual Saturday 10:00 AM slot, but this week it shows as unavailable (greyed out).

**Rising Action:** He sees other available slots — 10:30 AM and 11:00 AM are open. He picks 10:30 AM. The system confirms instantly.

**What could go wrong:** Two customers select the same slot at the exact same moment. The system's double-booking prevention catches this at the database level — the second request gets a friendly "This slot was just taken. Please select another time."

**Resolution:** Nimal learns to book a day earlier. The system never double-books.

**Capabilities revealed:** Real-time slot availability, concurrent booking protection, graceful error messages, slot refresh.

---

### Journey 3: Kumari — The Salon Owner / Admin

**Who:** Kumari, 42, owns "Kumari's Beauty Salon" in a village town. She runs the business with 2 staff members. She manages bookings in a paper notebook and loses track when it gets busy.

**Opening Scene:** A developer friend sets up Sallon for her. She logs into the admin dashboard on her phone for the first time.

**Rising Action:** She adds her service categories: "Ladies Hair", "Ladies Facial", "Spa". Then adds services: "Haircut & Blow Dry - Rs. 800 (45 min)", "Facial - Rs. 1500 (60 min)", "Full Body Massage - Rs. 3000 (90 min)". She sets operating hours: 9:00 AM - 7:00 PM, closed Mondays.

**Climax:** Within 5 minutes, her booking page is live. She shares the link on her WhatsApp business status. By evening, 3 bookings come in. She sees them all in her dashboard — dates, times, services, customer names. She taps "Confirm" on each.

**Resolution:** Next morning, she opens the dashboard and sees today's schedule at a glance. She knows exactly who's coming and when. No more paper notebook chaos.

**Capabilities revealed:** Admin login, service category CRUD, service CRUD with duration/price, operating hours configuration, booking list view with filters, booking status update, shareable booking URL.

---

### Journey 4: Kumari — Admin Troubleshooting

**Opening Scene:** A customer calls saying "I booked but can't see my appointment." Kumari opens her admin dashboard.

**Rising Action:** She filters bookings by customer name and finds it — status is "Pending." She realizes she forgot to confirm it.

**Climax:** She taps "Confirm" and tells the customer it's all set. She also notices a booking for tomorrow at 6:30 PM, but she needs to close early. She changes that booking's status to "Cancelled."

**Resolution:** Kumari now checks the dashboard every morning and confirms all pending bookings. She realizes the system gives her visibility she never had with paper.

**Capabilities revealed:** Booking search/filter by customer, status management, cancel flow, daily schedule view.

---

### Journey 5: Developer Deploys for a New Client

**Who:** Ashan, freelance developer, wants to offer booking systems to local salons as a side business.

**Opening Scene:** A spa owner asks Ashan to build a booking website. Instead of building from scratch, Ashan clones Sallon.

**Rising Action:** He changes the config: name → "Serene Spa & Wellness", colors → calming blue/green palette, logo → client's logo. He seeds service categories: "Massage", "Facial", "Body Treatment" with the spa's pricing.

**Climax:** In under an hour, the spa has a fully branded booking platform. Ashan charges a setup fee and moves on to the next client.

**Resolution:** Ashan now has 5 salon/spa clients, each running their own Sallon instance. Zero recurring costs for them, recurring setup revenue for him.

**Capabilities revealed:** White-label config (name, logo, colors), service seeding, independent deployment, no code changes needed for rebranding.

---

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|--------------------------|
| Customer Happy Path | Service browsing, category filter, date/time picker, booking creation, confirmation |
| Customer Edge Case | Double-booking prevention, concurrent request handling, error UX, slot refresh |
| Admin Setup & Daily Use | Service/category CRUD, operating hours, booking dashboard, status management, shareable link |
| Admin Troubleshooting | Booking search/filter, cancel flow, daily schedule view |
| Developer Rebranding | White-label config, service seeding, independent deployment |

## Web Application Specific Requirements

### Project-Type Overview
Single Page Application (SPA) built with React + Tailwind CSS. API-driven architecture with a Node.js/Express backend. Mobile-first responsive design targeting smartphone users who access the platform via shared WhatsApp links.

### Technical Architecture Considerations

**Application Type:** SPA with client-side routing (React Router)
**API Pattern:** RESTful JSON API (Express backend)
**State Management:** React Context or lightweight state (no Redux needed for V1)
**Build Tool:** Vite (fast builds, modern defaults)

### Browser Support Matrix

| Priority | Browsers | Min Version |
|----------|----------|-------------|
| **P0 — Must Work** | Chrome Android, Safari iOS | Last 2 versions |
| **P1 — Should Work** | Samsung Internet, Firefox Mobile | Last 2 versions |
| **P2 — Nice to Have** | Chrome Desktop, Safari Desktop, Edge | Last 2 versions |

### Responsive Design

- **Mobile-first** — all layouts designed for 360px+ screens first
- **Breakpoints:** Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px)
- **Touch targets:** Minimum 44x44px for all interactive elements
- **No horizontal scrolling** on any screen size

### Performance Targets

| Metric | Target | Context |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | On 3G mobile connection |
| Time to Interactive | < 3s | On 3G mobile connection |
| Lighthouse Performance | > 80 | Mobile audit |
| API Response Time | < 200ms | For booking/slot queries |
| Bundle Size | < 200KB gzipped | Initial load |

### SEO Strategy
- Not a priority for V1 — distribution is via direct WhatsApp links
- Basic meta tags and Open Graph tags for link previews when shared on WhatsApp/social
- No server-side rendering needed

### Accessibility Level
- **Target:** WCAG 2.1 Level A (basic compliance)
- Semantic HTML, proper heading hierarchy
- Sufficient color contrast (4.5:1 minimum)
- Keyboard navigable forms
- Screen reader friendly labels on inputs and buttons

### Implementation Considerations
- **No native features needed** — pure web, no PWA for V1
- **No CLI commands** — admin uses web dashboard only
- **Offline:** Not required for V1 (SQLite handles server-side, but client needs connectivity)
- **Image optimization:** Lazy loading for service images (Growth feature)

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP — deliver the minimum that eliminates the core pain (phone-based booking chaos) and proves the self-hosted model works.

**MVP Validation Question:** "Can a salon owner set up the system in 5 minutes and receive their first online booking the same day?"

**Resource Requirements:** 1 full-stack developer, no external services or APIs needed.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Customer Happy Path (browse → select → book)
- Customer Edge Case (double-booking prevention)
- Admin Setup & Daily Use (configure services, manage bookings)
- Admin Troubleshooting (search, filter, cancel)

**Must-Have Capabilities:** 13 items (see Product Scope → MVP section)

### Post-MVP Features

**Phase 2 — Growth:** Guest booking, staff assignment, email/SMS confirmations, basic analytics, self-cancellation, service images.

**Phase 3 — Expansion:** Payment integration, multi-location, loyalty program, recurring appointments, calendar sync, plugin architecture.

### Risk Mitigation Strategy

| Risk Type | Risk | Mitigation |
|-----------|------|------------|
| Technical | SQLite concurrent write contention | WAL mode + UNIQUE constraint on (date, time_slot, service_id) |
| Technical | JWT token security | Short expiry (24h), httpOnly cookies, bcrypt passwords |
| Technical | Bundle size bloat | Vite tree-shaking, lazy route loading, < 200KB target |
| Market | Salon owners can't self-setup | Pre-built service templates + 5-minute setup flow |
| Market | Customers don't use online booking | WhatsApp-first distribution, minimal friction |
| Resource | Scope creep | Phase 2/3 features explicitly OUT — no exceptions |

## Functional Requirements

### User Management

- **FR1:** Customer can register an account with name, email, phone, and password
- **FR2:** Customer can log in with email and password
- **FR3:** Admin can log in with admin credentials
- **FR4:** System can distinguish between Customer and Admin roles
- **FR5:** Customer can view and update their own profile information
- **FR6:** Admin can be seeded via configuration on first deployment

### Service Management

- **FR7:** Admin can create, read, update, and delete service categories
- **FR8:** Admin can create, read, update, and delete individual services
- **FR9:** Each service can have a name, description, duration (minutes), price, and category assignment
- **FR10:** Customer can browse all active services organized by category
- **FR11:** Customer can filter services by category
- **FR12:** Admin can activate or deactivate services without deleting them

### Schedule & Time Slot Management

- **FR13:** Admin can configure salon operating hours (open time, close time) per day of week
- **FR14:** Admin can mark specific days as closed (holidays, days off)
- **FR15:** System can generate available time slots for a given date based on service duration and operating hours
- **FR16:** System can exclude already-booked slots from available slots
- **FR17:** Customer can view available time slots for a selected service and date

### Booking Management

- **FR18:** Customer can create a booking by selecting a service, date, and available time slot
- **FR19:** System can prevent double bookings at the database level (same date + time slot + overlapping duration)
- **FR20:** System can handle concurrent booking attempts gracefully with a user-friendly error message
- **FR21:** Customer can view their own booking history with status
- **FR22:** Customer can cancel their own pending bookings
- **FR23:** Admin can view all bookings with filters (by date, status, category, customer)
- **FR24:** Admin can update booking status (Pending → Confirmed → Completed)
- **FR25:** Admin can cancel any booking (status → Cancelled)
- **FR26:** System can display today's schedule as a daily view for admin

### White-Label & Configuration

- **FR27:** System can be configured with custom salon name, logo, and brand colors via config file
- **FR28:** System can display the configured branding across all customer-facing pages
- **FR29:** Admin can generate and share a direct booking link (WhatsApp-ready URL)
- **FR30:** Open Graph meta tags can render a branded preview when the booking link is shared on WhatsApp/social

### System & Security

- **FR31:** System can authenticate users via JWT tokens
- **FR32:** System can protect admin routes from unauthorized access
- **FR33:** System can protect customer routes from unauthenticated access
- **FR34:** System can hash and securely store passwords
- **FR35:** System can validate all user inputs on both client and server side

## Non-Functional Requirements

### Performance
- All customer-facing pages load in under 2 seconds on a 3G mobile connection
- API endpoints respond within 200ms for booking and slot queries
- System supports at least 50 concurrent users without degradation
- Initial JavaScript bundle size under 200KB gzipped

### Security
- All passwords hashed with bcrypt (minimum 10 salt rounds)
- JWT tokens expire within 24 hours
- All API endpoints validate and sanitize input to prevent SQL injection and XSS
- Admin routes protected by role-based middleware
- CORS configured to allow only the frontend origin
- No sensitive data (passwords, tokens) logged or exposed in API responses

### Reliability
- Double-booking prevention enforced at database level (not just application level)
- Graceful error handling — no unhandled crashes visible to users
- SQLite database with WAL mode for concurrent read performance
- Database file backed up via simple file copy (no complex backup infrastructure)

### Usability
- All customer flows completable on a 360px mobile screen
- Maximum 3 taps/clicks from landing page to confirmed booking
- Touch targets minimum 44x44px
- Error messages are human-readable and actionable (not technical codes)
- Admin dashboard usable on mobile phone (salon owner checks between appointments)

### Deployability
- Single `npm install && npm start` to run the entire application
- No external services required (no Redis, no PostgreSQL, no cloud APIs)
- Environment variables for all configuration (port, JWT secret, database path)
- White-label config changeable without rebuilding the application

