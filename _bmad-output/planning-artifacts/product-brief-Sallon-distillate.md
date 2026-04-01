---
title: "Product Brief Distillate: Sallon"
type: llm-distillate
source: "product-brief-Sallon.md"
created: "2026-04-01"
purpose: "Token-efficient context for downstream PRD creation"
---

# Product Brief Distillate: Sallon

## Core Product Intent
- Generic, white-label salon & spa booking platform
- Build once, rebrand for any salon/spa business (name, logo, colors, service catalog)
- Spa and Salon are NOT separate systems — unified engine with configurable service categories
- Target: small/village salons that can't afford or don't need SaaS platforms

## Requirements Hints
- User auth: registration + login, JWT-based
- Two roles: Customer and Admin
- Service categories are admin-configurable (e.g., Boys, Ladies, Spa, Grooming, Nails — any label)
- Each service has: name, description, duration, price, category
- Booking flow: browse services → select date → pick available time slot → confirm
- Double-booking prevention is a HARD constraint (system-enforced, not advisory)
- Booking status lifecycle: Pending → Confirmed → Completed
- Admin dashboard: full CRUD on services, categories, pricing; view/filter/update all bookings
- Mobile-first responsive design
- Customer can view their own booking history

## Technical Constraints (User-Specified)
- Frontend: React + Tailwind CSS (non-negotiable)
- Backend: Node.js + Express (non-negotiable)
- Database: SQLite (non-negotiable — zero-config, file-based)
- Auth: JWT tokens
- Single-server deployment model
- No external database dependencies
- Must run on low-cost VPS (< 1GB RAM)

## Scope Signals — Explicitly OUT for V1
- NO online payments (pay at salon)
- NO SMS/email notifications
- NO staff/stylist assignment per booking
- NO multi-branch/location support
- NO recurring appointments
- NO customer reviews/ratings
- NO calendar sync (Google, iCal)
- NO complex analytics/reporting

## Scope Signals — V2+ Considerations
- Staff assignment and individual schedules
- Payment gateway integration (Stripe, etc.)
- Notification system (email/SMS)
- Multi-location support
- Analytics dashboard
- Customer loyalty program
- Plugin/module architecture

## Rejected Ideas & Decisions
- Separate systems for Spa vs Salon: REJECTED — unified system with configurable categories
- SaaS model: REJECTED — self-hosted, one-time setup
- Complex multi-tenant architecture: REJECTED for V1 — single salon instance
- PostgreSQL/MySQL: REJECTED — SQLite chosen for simplicity and zero-config

## User Scenarios
- **Customer books appointment:** Opens site → browses "Ladies Salon" category → selects "Haircut & Blow Dry" → picks next Saturday at 2:00 PM → confirms → sees Pending status
- **Admin confirms booking:** Opens dashboard → filters today's bookings → clicks Pending booking → marks as Confirmed
- **Admin adds new service:** Dashboard → Services → Add New → fills in name/price/duration/category → service immediately appears on customer-facing site
- **Double-booking attempt:** Customer A books 2:00 PM slot → Customer B tries same slot → system rejects with "slot unavailable" → Customer B picks 2:30 PM instead
- **Rebranding:** Developer clones project → changes config (name: "Glamour Studio", logo, colors) → deploys → fully branded booking site for a different salon

## Open Questions
- What are the salon's operating hours? (Configurable by admin? Fixed?)
- Time slot duration: fixed intervals (30 min) or based on service duration?
- Can customers cancel their own bookings, or only admin?
- Is there a "Cancelled" or "No-Show" status needed beyond Pending/Confirmed/Completed?
- Should admin be seeded on first run, or is there a setup wizard?
- Any specific branding/color scheme for the initial build?

## Key Differentiators to Preserve
- Simplicity over feature-richness
- Self-hosted over SaaS dependency
- Configurable categories over hardcoded sections
- White-label ready from day one
- SQLite = zero infrastructure overhead
