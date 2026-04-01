---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments: ["prd.md", "architecture.md", "product-brief-Sallon.md", "product-brief-Sallon-distillate.md", "epics.md"]
---

# UX Design Specification Sallon

**Author:** ThilanBuddhikaBISTEC
**Date:** 2026-04-02

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

Sallon is a self-hosted, white-label salon booking platform targeting small and village-level salons. The core UX promise: a customer can go from WhatsApp link to booked appointment in under 60 seconds, in 3 taps. The admin experience must be equally simple — a salon owner checking her phone between appointments should see today's schedule at a glance.

### Target Users

**Customer (Nimal):** Age 20-45, smartphone user, accesses via WhatsApp shared link. Ranges from tech-savvy to basic smartphone users. Books on mobile 90% of the time. Wants speed and clarity.

**Salon Owner (Kumari):** Age 30-55, small business owner, not tech-savvy. Uses admin dashboard on her phone between clients. Needs to see "who's coming today" in 2 seconds.

**Developer (Ashan):** Rebrands and deploys for clients. Needs the design system to support easy theming via CSS variables.

### Key Design Challenges

1. **Trust on first visit** — Customer arrives from WhatsApp link. UI must establish credibility instantly.
2. **Mobile-first with fat fingers** — 90% mobile usage. Every element needs large, clear tap targets with breathing room.
3. **Admin simplicity** — Schedule view, not data tables. Visual hierarchy must scream "here's what matters right now."
4. **White-label theming** — Design must work with ANY color scheme via CSS variables.

### Design Opportunities

1. **Booking flow as a "wow" moment** — Smooth transitions, progress indicators, satisfying confirmation animation.
2. **Visual service categories** — Category cards with icons give personality and help non-readers navigate.
3. **Today's schedule as a timeline** — Admin daily view as visual timeline, not a table.
4. **Branded WhatsApp preview** — Professional OG preview image increases click-through rates.

## Core User Experience

### Defining Experience

The ONE action that must be perfect: Booking an appointment — from tapping a WhatsApp link to seeing "Booking Confirmed" in under 60 seconds. Core loop: Browse categories → Select service → Pick date & time → Confirm → Done.

### Platform Strategy

- **Mobile Web (Chrome/Safari):** P0 — 90% of traffic via WhatsApp links on phones
- **Desktop Web:** P2 — Admin may use desktop occasionally
- **Touch interaction:** Primary input — all elements designed for thumb navigation
- Every screen must work beautifully at 360px width. Mobile-first.

### Effortless Interactions

- Service selection: Tap category card → see services instantly
- Date picking: Horizontal date scroll (14 days) — one tap to select
- Time slot selection: Green = available, grey = taken. One tap.
- Booking confirmation: Single "Confirm" button. Zero unnecessary fields.
- Admin daily check: Open dashboard → see timeline. No navigation needed.

### Critical Success Moments

1. First impression (0-3s): Branded page with clear categories → "this looks legit"
2. Service discovery (3-10s): Services with price and duration → "this is what I need"
3. Slot selection (10-30s): Green slots → feels in control
4. Confirmation (30-60s): Animated success → feels accomplished
5. Admin morning check (5s): Timeline of today → knows what's ahead

### Experience Principles

1. **Speed is the feature** — Every interaction must feel instant.
2. **Clarity over cleverness** — No ambiguous icons, no hidden menus, no jargon.
3. **Confidence through feedback** — Every tap has feedback, every action has confirmation.
4. **Beauty builds trust** — Polished enough that sharing on WhatsApp feels like a flex.

## Desired Emotional Response

### Primary Emotional Goals

- **Customer:** "That was easy" — Relief + Accomplishment from booking in under a minute
- **Salon Owner:** "I've got this under control" — Confidence + Clarity from seeing today at a glance
- **Returning Customer:** "I love this place" — Loyalty + Belonging from recognizing the brand

### Emotional Journey Mapping

- Landing: Curious but skeptical → Professional design builds trust instantly
- Browsing: Exploring → Clean cards, clear pricing, no hidden costs
- Picking date/time: Deciding → Visual availability, satisfying tap feedback
- Confirming: Slight anxiety → Clear summary, easy cancel, reassuring confirmation
- After booking: Accomplished → Celebration animation, clear details
- Error states: Frustrated → Friendly message, instant refresh, suggest alternatives

### Micro-Emotions

- Cultivate: Confidence, Trust, Delight, Accomplishment
- Prevent: Confusion, Skepticism, Frustration, Dead ends
- Method: Clear CTAs, consistent branding, smooth animations, recovery paths

### Emotional Design Principles

1. **Celebrate success loudly** — Booking confirmation deserves an animation, not just text.
2. **Handle failure gently** — Errors feel like helpful suggestions, not rejections.
3. **Respect attention** — Skeleton screens over spinners. Never make users wait without feedback.
4. **Build trust through consistency** — Same spacing, same patterns everywhere.

## UX Pattern Analysis & Inspiration

### Industry Benchmark Analysis

| App | What They Do Well | What We'll Borrow |
|-----|------------------|-------------------|
| **Fresha** | Clean booking flow, service cards with images, smooth date picker | Card layout for services, horizontal date scroller |
| **Booksy** | Category icons, branded salon profiles, trust indicators | Visual category navigation with icons |
| **Calendly** | Ultra-simple time selection, one-screen booking, minimal friction | Grid-based time slot picker, single-page booking flow |
| **Airbnb** | Trust through design quality, photography emphasis, micro-animations | Design polish level, confirmation celebration, card shadows |
| **WhatsApp** | Familiar to our users, clean chat UI, green action color | Green for "available/success", familiar interaction patterns |

### Patterns to Adopt

1. **Horizontal date scroll** (Calendly/Fresha) — not a calendar popup. Faster, thumb-friendly.
2. **Service cards with visual hierarchy** (Fresha) — name bold, price prominent, duration subtle.
3. **Color-coded availability** (Calendly) — green = available, grey = taken. Universal.
4. **Celebration confirmation** (Airbnb) — animated checkmark, not just a text message.
5. **Bottom-anchored CTA** (mobile apps) — "Confirm Booking" button stays visible while scrolling slots.
6. **Skeleton loading** (Facebook/LinkedIn) — content-shaped placeholders instead of spinners.

### Anti-Patterns to Avoid

- Calendar date pickers on mobile (too small, requires precision)
- Dropdown selects for time (scroll through 40+ options)
- Multi-page booking wizard with back/next buttons (too slow)
- Generic success pages with no booking details
- Admin tables with tiny text and no mobile consideration

## Design System

### Approach: Custom Tailwind Design Tokens

No component library (Material UI, Chakra, etc.) — we use **Tailwind CSS v4 with custom CSS variables** for theming. This keeps bundle size minimal and gives full white-label control.

### Design Token Architecture

```css
/* Root CSS variables — set from .env branding config */
:root {
  /* Brand Colors (overridden per salon) */
  --color-primary: var(--brand-primary, #6366f1);
  --color-primary-hover: var(--brand-primary-hover, #4f46e5);
  --color-primary-light: var(--brand-primary-light, #e0e7ff);
  --color-secondary: var(--brand-secondary, #8b5cf6);

  /* Semantic Colors (fixed) */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-info: #3b82f6;

  /* Status Colors */
  --color-status-pending: #f59e0b;
  --color-status-confirmed: #10b981;
  --color-status-completed: #3b82f6;
  --color-status-cancelled: #6b7280;

  /* Neutral Palette */
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;

  /* Spacing Scale */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */

  /* Border Radius */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

## Visual Foundation

### Typography

| Role | Font | Weight | Size (mobile) | Size (desktop) |
|------|------|--------|---------------|----------------|
| **H1 — Page title** | Inter / System | 700 (Bold) | 1.75rem (28px) | 2.25rem (36px) |
| **H2 — Section heading** | Inter / System | 600 (Semi) | 1.25rem (20px) | 1.5rem (24px) |
| **H3 — Card title** | Inter / System | 600 (Semi) | 1.125rem (18px) | 1.25rem (20px) |
| **Body** | Inter / System | 400 (Regular) | 0.9375rem (15px) | 1rem (16px) |
| **Small / Caption** | Inter / System | 400 (Regular) | 0.8125rem (13px) | 0.875rem (14px) |
| **Button** | Inter / System | 500 (Medium) | 0.9375rem (15px) | 1rem (16px) |
| **Price** | Inter / System | 700 (Bold) | 1.125rem (18px) | 1.25rem (20px) |

**Font stack:** `'Inter', system-ui, -apple-system, sans-serif` — Inter for polish, system fallback for speed.

### Color Application

| Context | Color | Usage |
|---------|-------|-------|
| **Primary action buttons** | `--color-primary` | Book Now, Confirm, Save |
| **Navigation bar** | `--color-primary` with white text | Header/navbar background |
| **Available slot** | `--color-success-light` border + `--color-success` text | Time slot buttons |
| **Taken/unavailable** | `--color-border` background, `--color-text-muted` | Greyed out slots |
| **Status: Pending** | `--color-status-pending` | Amber badge |
| **Status: Confirmed** | `--color-status-confirmed` | Green badge |
| **Status: Completed** | `--color-status-completed` | Blue badge |
| **Status: Cancelled** | `--color-status-cancelled` | Grey badge |
| **Error messages** | `--color-error` on `--color-error-light` bg | Inline errors, toast |
| **Success messages** | `--color-success` on `--color-success-light` bg | Confirmation, toast |
| **Cards** | `--color-surface` with `--shadow-md` | All content cards |
| **Page background** | `--color-bg` | Body background |

### Spacing Rules

- **Card padding:** `--space-lg` (24px)
- **Section gap:** `--space-xl` (32px)
- **Between form fields:** `--space-md` (16px)
- **Inline element gap:** `--space-sm` (8px)
- **Container max-width:** 1200px, padding `--space-md` on mobile
- **Touch target minimum:** 44px height, 8px gap between targets

## Design Directions

### Visual Style: "Clean Professional"

Not minimalist-cold (like a banking app). Not playful-loud (like a gaming app). **Clean professional with warmth** — like a well-designed salon interior: modern, inviting, trustworthy.

**Characteristics:**
- Generous white space — content breathes
- Soft shadows instead of hard borders (cards float, not boxed)
- Rounded corners (12px for cards, 8px for buttons, full-round for pills/badges)
- Subtle gradient on primary CTAs for depth
- Warm neutral backgrounds (slate-50, not pure white)

### Animation & Motion

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transitions | Fade in + slide up 8px | 200ms | ease-out |
| Card hover | Lift shadow + scale 1.02 | 150ms | ease |
| Button press | Scale 0.97 | 100ms | ease |
| Slot selection | Background color fill | 150ms | ease |
| Date scroll | Smooth horizontal scroll | native | - |
| Booking success | Checkmark draw + scale bounce | 600ms | spring |
| Toast enter | Slide in from top + fade | 300ms | ease-out |
| Toast exit | Fade out | 200ms | ease-in |
| Skeleton pulse | Opacity 0.5 → 1 → 0.5 | 1.5s | infinite |
| Status badge change | Color crossfade | 200ms | ease |

### Empty States

Every empty state should have:
1. An illustration or icon (not just text)
2. A headline explaining the state
3. A CTA to fix it

Examples:
- **No categories:** "No categories yet" + "Create your first category" button
- **No bookings:** "No bookings yet" + "Browse services" link
- **No slots available:** "Salon is closed on this day" + "Try another date" suggestion

## User Journey Screens

### Customer Flow (6 screens)

1. **Home Page** — Hero section with salon name, tagline, category cards grid
2. **Services Page** — Category filter pills + service cards grid with Book Now
3. **Booking Page** — Service summary card + date scroller + time slot grid + sticky confirm button
4. **Booking Confirmation** — Animated checkmark + booking details card + "My Bookings" / "Book Another" buttons
5. **My Bookings** — Booking cards list sorted by date, status badges, cancel button on pending
6. **Login / Register** — Clean centered form, minimal fields, toggle between login/register

### Admin Flow (5 screens)

1. **Dashboard** — Today's schedule timeline + stat cards (today's bookings count, pending count) + quick nav
2. **Manage Categories** — List with edit/delete + add modal
3. **Manage Services** — Table with status toggle + add/edit modal
4. **Manage Bookings** — Filterable table with date/status filters + action buttons per row
5. **Operating Hours** — 7-day grid with time inputs and closed toggles

## Component Strategy

### UI Primitives (Atomic)

| Component | Variants | Notes |
|-----------|----------|-------|
| **Button** | primary, secondary, danger, ghost, loading | Gradient on primary, 44px min-height |
| **Input** | text, email, password, tel, number, time | With label, error state, focus ring |
| **Select** | single select with label | Native select + custom styling |
| **Card** | default, interactive (hover lift), status | Shadow levels vary |
| **Badge** | pending, confirmed, completed, cancelled | Color-coded status |
| **Modal** | default with overlay | Slide-up on mobile, centered on desktop |
| **Toast** | success, error, info | Auto-dismiss 4s, slide-in animation |
| **Spinner** | default, inline | Branded color spinner |
| **Skeleton** | text, card, row | Pulse animation, content-shaped |
| **Avatar** | initials, image | Circle with fallback initials |

### Feature Components

| Component | Purpose | Key Behavior |
|-----------|---------|-------------|
| **Navbar** | Navigation + branding | Sticky top, responsive collapse, brand logo/name from config |
| **CategoryCard** | Home page category selection | Icon + name, hover lift, tap → services page |
| **ServiceCard** | Service display with Book CTA | Name, price (bold), duration, description, Book Now button |
| **SlotPicker** | Date + time selection | Horizontal date scroll + time slot grid |
| **BookingCard** | Booking display in lists | Service, date/time, status badge, cancel (if pending) |
| **StatusBadge** | Visual booking status | Color-coded pill with status text |
| **TimelineView** | Admin daily schedule | Vertical timeline with time markers, booking blocks |
| **FilterBar** | Admin booking filters | Date picker + status dropdown + category filter |
| **EmptyState** | No-data placeholder | Icon + message + CTA |
| **ConfirmationScreen** | Post-booking success | Animated checkmark + details + next actions |

## UX Interaction Patterns

### Booking Flow Pattern

```
[Category Cards] → tap → [Service List] → "Book Now" → [Booking Page]
                                                            │
                                                    ┌───────┴───────┐
                                                    │ Service Card   │
                                                    │ (summary)      │
                                                    ├────────────────┤
                                                    │ Date Scroller  │
                                                    │ [< Mon Tue Wed │
                                                    │  Thu Fri Sat >]│
                                                    ├────────────────┤
                                                    │ Time Slots     │
                                                    │ [9:00] [9:30]  │
                                                    │ [10:00] [10:30]│
                                                    ├────────────────┤
                                                    │ ┌────────────┐ │
                                                    │ │ Confirm    │ │ ← sticky bottom
                                                    │ │ Rs. 500    │ │
                                                    │ └────────────┘ │
                                                    └────────────────┘
```

### Loading Pattern

- **Initial page load:** Full skeleton (cards, text blocks shaped like content)
- **API calls:** Inline skeleton or shimmer on the specific area updating
- **Form submission:** Button shows spinner + disabled state, text changes to "Booking..."
- **Never:** Full-screen spinner blocking all interaction

### Error Pattern

- **Form validation:** Inline red text below the field, field border turns red
- **API errors:** Toast notification (top-right, auto-dismiss 4s) OR inline error banner
- **Slot conflict:** Replace error with updated available slots automatically
- **Network error:** "Connection lost. Please check your internet." with retry button

### Navigation Pattern

- **Customer:** Navbar with: Logo/Name | Services | My Bookings | Login/Register (or Username + Logout)
- **Admin:** Same navbar + Dashboard link + Share Link button
- **Mobile:** Horizontal nav, no hamburger menu (few enough items to show all)
- **Active state:** Underline or bold on current page link

## Responsive Design & Accessibility

### Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| **Mobile** | < 640px | Single column, stacked cards, full-width buttons |
| **Tablet** | 640-1024px | 2-column grid for cards, side padding increases |
| **Desktop** | > 1024px | 3-column grid, max-width container, more white space |

### Mobile-Specific Rules

- All buttons full-width on mobile (< 640px)
- Service cards stack vertically (1 column)
- Date scroller uses horizontal scroll with snap
- Time slots: 3 columns on mobile, 4 on tablet, 6 on desktop
- Admin tables become card lists on mobile
- Modal slides up from bottom on mobile, centered on desktop
- Sticky CTA bar at bottom of booking page on mobile

### Accessibility (WCAG 2.1 Level A)

| Requirement | Implementation |
|-------------|---------------|
| **Color contrast** | 4.5:1 minimum for text, 3:1 for large text and UI elements |
| **Focus indicators** | 2px ring in primary color on all interactive elements |
| **Keyboard navigation** | Tab order follows visual order, Enter/Space activates buttons |
| **Screen readers** | Semantic HTML, ARIA labels on icon buttons, role attributes on custom widgets |
| **Touch targets** | 44x44px minimum, 8px gap between adjacent targets |
| **Form labels** | Every input has an associated `<label>`, errors linked with `aria-describedby` |
| **Status announcements** | Booking confirmation and errors announced via `aria-live="polite"` |
| **Reduced motion** | Respect `prefers-reduced-motion`, disable animations |

### White-Label Theming Rules

1. All brand colors use CSS variables — never hardcode hex values
2. Logo loaded via `--brand-logo-url` or branding API
3. Salon name displayed from config — never hardcoded
4. Primary/secondary colors cascade through all components via variables
5. Font remains Inter/system — not configurable per salon (consistency)
6. Shadows, radius, spacing are fixed (consistent quality across brands)
