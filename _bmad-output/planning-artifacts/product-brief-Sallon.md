---
title: "Product Brief: Sallon"
status: "complete"
created: "2026-04-01"
updated: "2026-04-01"
inputs: [user-conversation]
---

# Product Brief: Sallon — Generic Salon & Spa Booking Platform

## Executive Summary

Small and mid-size salons and spas still rely on phone calls, paper appointment books, and walk-in chaos to manage their daily schedules. The result is double bookings, no-shows with no tracking, lost revenue from unfilled slots, and frustrated customers who can't see availability without calling.

**Sallon** is a lightweight, self-hosted web booking platform designed for salon and spa businesses. Customers browse categorized services (Men's Grooming, Ladies' Salon, Spa, etc.), pick available time slots, and book appointments in seconds — no phone call needed. Salon owners get a clean admin dashboard to manage services, pricing, and bookings in real time with full visibility into their schedule.

Built as a **generic, white-label platform**, Sallon can be rebranded and redeployed for any salon or spa business. Change the name, logo, colors, and service catalog — the core engine stays the same.

## The Problem

- **Customers** waste time calling salons, waiting on hold, or walking in only to find no availability. There's no way to see open slots or book after hours.
- **Salon owners** manage appointments on paper or basic spreadsheets. Double bookings happen regularly. There's no centralized view of the day's schedule.
- **Staff** spend time answering phones for booking instead of serving customers.
- **Revenue leaks** through untracked no-shows, unoptimized time slots, and inability to plan capacity.

Existing solutions (Fresha, Booksy, Vagaro) are SaaS platforms with monthly fees, complex onboarding, and features most small salons never use. A village or neighborhood salon needs something simple, affordable, and self-contained.

## The Solution

A unified web-based booking system with two interfaces:

**Customer-Facing:**
- Browse services organized by category (configurable by admin)
- View real-time time slot availability by date
- Book appointments with instant confirmation
- View and manage personal bookings (Pending → Confirmed → Completed)
- Register/login for booking history

**Admin Dashboard:**
- Full CRUD for service categories and individual services
- Set and update pricing per service
- View all bookings with filters (date, status, category)
- Update booking status (Pending → Confirmed → Completed)
- Prevent double bookings at the system level (hard constraint)

## What Makes This Different

| Aspect | SaaS Platforms (Fresha, Booksy) | Sallon |
|--------|-------------------------------|--------|
| Cost | Monthly subscription fees | One-time setup, self-hosted |
| Complexity | 100+ features, steep learning curve | Focused on what small salons actually need |
| Ownership | Data on third-party servers | Full data ownership (SQLite) |
| Customization | Limited branding options | Fully white-label, rebrandable |
| Deployment | Cloud-dependent | Runs anywhere (VPS, local server, etc.) |

**Core advantage:** Simplicity and ownership. This is not trying to be Fresha. It's the tool a village salon owner can actually use without training.

## Who This Serves

**Primary Users:**

1. **Salon/Spa Owners** — Small business owners who want a digital booking system without SaaS fees or complexity. They need to see today's schedule, manage services, and prevent double bookings.

2. **Customers** — Local clients who want to book an appointment quickly online, see what's available, and skip the phone call. They range from tech-savvy to basic smartphone users.

**Secondary Users:**

3. **Developers/Agencies** — Who want a white-label booking template they can customize and deploy for multiple salon clients.

## Success Criteria

- Customer can complete a booking in under 60 seconds
- Zero double bookings (system-enforced)
- Admin can add a new service and have it bookable within 2 minutes
- Platform runs on a single low-cost VPS (< 1GB RAM)
- Fully functional with SQLite — no external database dependencies
- Rebrandable in under 1 hour (name, logo, colors, services)

## Scope

### V1 — In Scope
- User registration and login (JWT-based)
- Admin role with protected dashboard
- Service categories (configurable: Boys, Ladies, Spa, etc.)
- Service management (name, description, duration, price, category)
- Date-based time slot availability
- Booking creation with double-booking prevention
- Booking status lifecycle (Pending → Confirmed → Completed)
- Responsive UI (mobile-first)

### V1 — Out of Scope
- Online payments (pay at salon)
- SMS/email notifications
- Staff/stylist assignment per booking
- Multi-branch/location support
- Recurring appointments
- Customer reviews/ratings
- Calendar sync (Google, iCal)

### Future Considerations (V2+)
- Staff assignment and individual schedules
- Payment gateway integration
- Notification system (email/SMS)
- Multi-location support
- Analytics and reporting dashboard
- Customer loyalty program

## Vision

If successful, Sallon becomes the **go-to open-source/white-label salon booking engine** for small businesses and developer agencies. The core stays lean and focused, while optional modules (payments, notifications, multi-branch) can be added as needed.

**Year 1:** Stable single-salon platform, deployed for 5-10 real businesses.
**Year 2:** Plugin architecture for payments, notifications, and staff management.
**Year 3:** Marketplace of salon templates and configurations, with a community of developers deploying Sallon for their clients.

## Technical Approach (High-Level)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + Tailwind CSS | Fast development, responsive, component-based |
| Backend | Node.js + Express | Lightweight, JavaScript full-stack consistency |
| Database | SQLite | Zero-config, file-based, perfect for single-server deployment |
| Auth | JWT tokens | Stateless, simple, works with REST API |
| Deployment | Any VPS or local server | No cloud vendor lock-in |
