---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ["prd.md", "product-brief-Sallon.md", "product-brief-Sallon-distillate.md"]
workflowType: 'architecture'
project_name: 'Sallon'
user_name: 'ThilanBuddhikaBISTEC'
date: '2026-04-02'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
35 FRs across 6 capability areas. The booking engine (FR18-FR26) is the architectural centerpiece — it requires transactional integrity, concurrent access handling, and time-slot computation logic. User management (FR1-FR6) and service management (FR7-FR12) are standard CRUD. White-label config (FR27-FR30) requires a runtime configuration system that injects branding without rebuilds.

**Non-Functional Requirements:**
- **Performance:** < 2s page load on 3G, < 200ms API response, < 200KB bundle
- **Security:** bcrypt hashing, JWT with 24h expiry, input sanitization, CORS, role-based middleware
- **Reliability:** DB-level double-booking prevention, WAL mode, graceful error handling
- **Usability:** Mobile-first (360px+), 3 taps to booking, 44px touch targets
- **Deployability:** Single `npm install && npm start`, zero external dependencies

**Scale & Complexity:**
- Primary domain: Full-stack web application (SPA + REST API)
- Complexity level: Low-Medium
- Estimated architectural components: ~15 (6 API route groups, 8-10 React page components, 1 database module)

### Technical Constraints & Dependencies

- **SQLite only** — no external database; file-based, single-server deployment
- **No external services** — no Redis, no cloud APIs, no email/SMS providers in V1
- **Vite + React** — SPA with client-side routing
- **Node.js + Express** — RESTful JSON API
- **JWT authentication** — stateless, no session store needed
- **< 1GB RAM target** — lightweight, low-cost VPS deployment

### Cross-Cutting Concerns Identified

| Concern | Affected Components | Architectural Impact |
|---------|-------------------|---------------------|
| **Authentication** | All API routes, all frontend pages | JWT middleware, auth context, protected routes |
| **Role-based access** | Admin routes, admin UI, customer UI | Middleware guard, conditional rendering |
| **Input validation** | All forms, all API endpoints | Shared validation schemas (client + server) |
| **Error handling** | All API endpoints, all UI interactions | Centralized error handler, toast/alert UI |
| **White-label theming** | All customer-facing UI | CSS variables from config, dynamic meta tags |
| **Double-booking prevention** | Booking creation API, slot display | DB constraint + application-level check |

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application: React SPA (frontend) + Express REST API (backend) + SQLite (database). Monorepo structure with shared types.

### Starter Options Considered

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| `create-vite` + manual Express | Separate frontend/backend setup | Full control, minimal bloat | More manual wiring |
| T3 Stack | Full-stack Next.js | Excellent DX, tRPC | Overkill — Next.js not needed, no SQLite support |
| Custom monorepo | Hand-rolled structure | Exact fit for requirements | More initial setup |

### Selected Approach: Vite React + Express Monorepo

**Rationale:** T3 and similar full-stack starters are overkill and force Next.js. Our architecture is simpler: a Vite SPA that calls an Express API. A lightweight monorepo with `/client` and `/server` folders gives us the exact structure we need with zero bloat.

**Initialization Commands:**

```bash
mkdir sallon && cd sallon
npm init -y
npm create vite@latest client -- --template react
cd client && npm install tailwindcss @tailwindcss/vite
cd ..
mkdir -p server/src
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** JavaScript (ES modules). TypeScript optional — can add later without restructuring.
- **Styling Solution:** Tailwind CSS v4 via Vite plugin
- **Build Tooling:** Vite (frontend), Node.js native (backend)
- **Testing Framework:** Vitest (frontend), to be configured
- **Code Organization:** Monorepo — `/client` (React SPA), `/server` (Express API), shared root `package.json` for scripts
- **Development Experience:** Vite HMR for frontend, nodemon for backend, concurrent dev script

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database schema and migration strategy
- Authentication flow (JWT implementation)
- API route structure and error handling
- Double-booking prevention mechanism

**Important Decisions (Shape Architecture):**
- Frontend state management
- Component architecture and routing
- Validation strategy (shared client/server)

**Deferred Decisions (Post-MVP):**
- CI/CD pipeline, monitoring, caching, WebSocket for real-time updates

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Database** | SQLite with `better-sqlite3` | Synchronous API, faster than `sqlite3`, perfect for single-server. WAL mode enabled. |
| **ORM/Query** | No ORM — raw SQL via `better-sqlite3` | Project is small (5 tables). ORM adds complexity without value. Prepared statements for safety. |
| **Schema Migration** | SQL migration files (`server/migrations/*.sql`) | Numbered files (`001-init.sql`, `002-seed.sql`), run on server start. Simple, no migration library needed. |
| **Data Validation** | `zod` (shared schemas) | Single validation library for both client and server. Define once, validate everywhere. |

**Database Schema (5 tables):**

```sql
users (id, name, email, phone, password_hash, role, created_at)
categories (id, name, display_order, is_active, created_at)
services (id, category_id FK, name, description, duration_minutes, price, is_active, created_at)
operating_hours (id, day_of_week, open_time, close_time, is_closed)
bookings (id, user_id FK, service_id FK, booking_date, start_time, end_time, status, created_at, updated_at)
  UNIQUE constraint on (booking_date, start_time) with overlap check
```

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Auth Method** | JWT (access token only) | Stateless, no session store. Simple for V1. |
| **Token Storage** | `localStorage` + Authorization header | Simple SPA pattern. HttpOnly cookies add CSRF complexity. |
| **Token Expiry** | 24 hours | Balance between security and UX for salon customers. |
| **Password Hashing** | `bcrypt` (10 rounds) | Industry standard, sufficient for this threat model. |
| **Admin Seeding** | Environment variable on first run | `ADMIN_EMAIL` + `ADMIN_PASSWORD` in `.env`. Seed script creates admin if none exists. |
| **Route Protection** | Express middleware (`authMiddleware`, `adminMiddleware`) | Check JWT → extract user → check role. |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **API Style** | RESTful JSON | Standard, well-understood, matches Express naturally. |
| **API Prefix** | `/api/v1/` | Versioned from day one for future-proofing. |
| **Error Format** | `{ error: string, details?: object }` | Consistent error shape across all endpoints. |
| **Validation** | Zod middleware — validate request body/params before handler | Reject bad input early, clean handler code. |
| **CORS** | `cors` package, frontend origin only | Single allowed origin from env config. |

**API Route Structure:**

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/categories
POST   /api/v1/categories          (admin)
PUT    /api/v1/categories/:id       (admin)
DELETE /api/v1/categories/:id       (admin)

GET    /api/v1/services
GET    /api/v1/services/:id
POST   /api/v1/services             (admin)
PUT    /api/v1/services/:id          (admin)
DELETE /api/v1/services/:id          (admin)

GET    /api/v1/slots?service_id=&date=
GET    /api/v1/operating-hours
PUT    /api/v1/operating-hours       (admin)

POST   /api/v1/bookings
GET    /api/v1/bookings/my
PATCH  /api/v1/bookings/:id/cancel
GET    /api/v1/admin/bookings        (admin)
PATCH  /api/v1/admin/bookings/:id    (admin)

GET    /api/v1/config/branding
```

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **State Management** | React Context + `useReducer` | 2 contexts: AuthContext, BookingContext. No Redux — overkill for this scale. |
| **Routing** | React Router v6 | Standard, well-documented, supports protected routes. |
| **HTTP Client** | `fetch` wrapper (no axios) | Native, zero dependency. Simple wrapper for auth headers + error handling. |
| **Form Handling** | Controlled components + Zod validation | No form library needed — forms are simple (login, register, booking). |
| **Component Pattern** | Pages → Components → UI primitives | `/pages` for routes, `/components` for reusable, `/ui` for atoms (Button, Input, Card). |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Hosting** | Any VPS (DigitalOcean, Linode, etc.) | Single server, no cloud lock-in. |
| **Process Manager** | `pm2` or `node` directly | Simple process management for Express. |
| **Static Files** | Express serves Vite build output | `express.static('client/dist')` — single server serves both API and SPA. |
| **Environment Config** | `.env` file with `dotenv` | Standard Node.js pattern. |
| **Logging** | `console.log` + structured JSON in production | No logging library for V1. |

### Decision Impact Analysis

**Implementation Sequence:**
1. Database schema + migrations (foundation)
2. Auth system (JWT + middleware)
3. Service/Category CRUD APIs
4. Operating hours + slot generation
5. Booking API with double-booking prevention
6. Frontend auth pages
7. Customer booking flow
8. Admin dashboard

**Cross-Component Dependencies:**
- Auth middleware → required by all protected routes
- Database schema → required before any API
- Zod schemas → shared between frontend validation and API validation
- Branding config → injected into frontend via API + CSS variables

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 12 areas where code could be inconsistent

### Naming Patterns

**Database Naming Conventions:**
- Tables: `snake_case`, plural → `users`, `categories`, `services`, `bookings`, `operating_hours`
- Columns: `snake_case` → `user_id`, `booking_date`, `start_time`, `created_at`
- Foreign keys: `{referenced_table_singular}_id` → `user_id`, `service_id`, `category_id`
- Booleans: `is_` prefix → `is_active`, `is_closed`

**API Naming Conventions:**
- Endpoints: plural nouns, `kebab-case` → `/api/v1/categories`, `/api/v1/operating-hours`
- Route params: `:id` format → `/api/v1/services/:id`
- Query params: `snake_case` → `?service_id=1&date=2026-04-05`
- JSON response fields: `camelCase` → `{ userId, bookingDate, startTime }`

**Code Naming Conventions:**
- React components: `PascalCase` → `ServiceCard.jsx`, `BookingForm.jsx`
- React pages: `PascalCase` → `HomePage.jsx`, `AdminDashboard.jsx`
- Utility files: `camelCase` → `apiClient.js`, `formatDate.js`
- Server files: `camelCase` → `authMiddleware.js`, `bookingRoutes.js`
- Functions: `camelCase` → `getAvailableSlots()`, `createBooking()`
- Constants: `UPPER_SNAKE_CASE` → `MAX_BOOKING_DAYS_AHEAD`, `JWT_EXPIRY`
- CSS classes: Tailwind utility classes only — no custom class names

### Structure Patterns

**Project Organization:**
- Feature-grouped on backend (`routes/`, `middleware/`, `db/`)
- Type-grouped on frontend (`pages/`, `components/`, `ui/`, `context/`, `lib/`)
- No tests directory for V1 — tests added in Phase 2
- Shared Zod schemas in `server/src/validators/` — frontend imports from API response types

**File Structure Rules:**
- One component per file
- One route group per file (`authRoutes.js`, `serviceRoutes.js`, `bookingRoutes.js`)
- Config in root `.env` — loaded via `dotenv` in `server/src/config.js`
- Database file at `server/data/sallon.db` (gitignored)
- Migrations in `server/migrations/` — numbered SQL files

### Format Patterns

**API Response Formats:**

```javascript
// Success response
{ "data": { ... } }

// Success list response
{ "data": [ ... ] }

// Error response
{ "error": "Human-readable error message" }

// Validation error response
{ "error": "Validation failed", "details": { "field": "message" } }
```

**Data Exchange Rules:**
- JSON fields: `camelCase` (API ↔ Frontend)
- Database columns: `snake_case` (mapped in queries)
- Dates in JSON: ISO 8601 strings → `"2026-04-05"`
- Times in JSON: 24h format strings → `"14:00"`, `"09:30"`
- Prices: integers in cents → `500` = Rs. 500 (no decimals needed for this currency)
- Booleans: `true`/`false` (never `1`/`0` in API responses)
- Null: explicit `null` for missing optional fields (never `undefined` in JSON)

**HTTP Status Codes:**
- `200` — Success (GET, PATCH)
- `201` — Created (POST)
- `400` — Validation error / bad request
- `401` — Not authenticated
- `403` — Not authorized (wrong role)
- `404` — Resource not found
- `409` — Conflict (double booking, duplicate email)
- `500` — Server error (never expose internals)

### Communication Patterns

**State Management Rules:**
- `AuthContext` — holds `{ user, token, isLoading }`. Updated on login/logout/token refresh.
- `useAuth()` hook — access auth state from any component.
- No global booking state — booking flow is local to the booking page.
- API calls: always through `lib/api.js` wrapper — never raw `fetch` in components.

**API Client Pattern:**
```javascript
// lib/api.js — every API call goes through this
async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new ApiError(err.error, res.status, err.details);
  }
  return res.json();
}
```

### Process Patterns

**Error Handling:**
- Backend: try/catch in route handlers → send `{ error }` with appropriate status code
- Frontend: `try/catch` around API calls → show toast/alert with error message
- Never expose stack traces or SQL errors to the client
- Log server errors to console with timestamp and request context

**Loading States:**
- Each page manages its own `isLoading` state
- Show spinner/skeleton while loading
- Disable form submit buttons during API calls
- Naming: `isLoading`, `isSubmitting` (never `loading`, `submitting`)

**Form Submission Pattern:**
1. Validate with Zod → show inline errors if invalid
2. Set isSubmitting = true
3. Call API via api() wrapper
4. On success → navigate or show success message
5. On error → show error toast, keep form data
6. Set isSubmitting = false

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming conventions exactly (snake_case DB, camelCase JS/JSON, PascalCase components)
- Use the `api()` wrapper for every API call — never raw `fetch`
- Return `{ data }` or `{ error }` from every API endpoint — no other shapes
- Use Zod schemas for ALL input validation (request body, form data)
- Map `snake_case` DB columns to `camelCase` in query result mapping

**Anti-Patterns (NEVER DO):**
- Never use `any` types or skip validation
- Never return raw database rows directly (always map column names)
- Never store sensitive data in localStorage (only JWT token)
- Never use inline styles — Tailwind classes only
- Never create God components — split at 150 lines

## Project Structure & Boundaries

### Complete Project Directory Structure

```
sallon/
├── package.json                    # Root scripts (dev, build, start)
├── .env                            # Environment config (JWT_SECRET, PORT, ADMIN_EMAIL, etc.)
├── .env.example                    # Template for .env
├── .gitignore
├── README.md
│
├── client/                         # React SPA (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.jsx                # App entry point
│       ├── App.jsx                 # Root component + Router
│       ├── index.css               # Tailwind imports
│       │
│       ├── pages/                  # Route-level components
│       │   ├── HomePage.jsx        # Landing + service categories
│       │   ├── ServicesPage.jsx    # Services by category
│       │   ├── BookingPage.jsx     # Date + slot picker + confirm
│       │   ├── MyBookingsPage.jsx  # Customer booking history
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   └── admin/
│       │       ├── DashboardPage.jsx    # Today's schedule overview
│       │       ├── ManageServicesPage.jsx
│       │       ├── ManageCategoriesPage.jsx
│       │       ├── ManageBookingsPage.jsx
│       │       └── OperatingHoursPage.jsx
│       │
│       ├── components/             # Reusable feature components
│       │   ├── ServiceCard.jsx
│       │   ├── CategoryList.jsx
│       │   ├── SlotPicker.jsx
│       │   ├── BookingCard.jsx
│       │   ├── BookingStatusBadge.jsx
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       │
│       ├── ui/                     # Atomic UI primitives
│       │   ├── Button.jsx
│       │   ├── Input.jsx
│       │   ├── Card.jsx
│       │   ├── Modal.jsx
│       │   ├── Spinner.jsx
│       │   ├── Toast.jsx
│       │   └── Select.jsx
│       │
│       ├── context/                # React Context providers
│       │   └── AuthContext.jsx     # user, token, login(), logout()
│       │
│       └── lib/                    # Utilities
│           ├── api.js              # fetch wrapper with auth headers
│           ├── formatDate.js       # Date/time formatting helpers
│           └── constants.js        # Frontend constants
│
├── server/                         # Express API
│   ├── package.json
│   └── src/
│       ├── index.js                # Express app entry point
│       ├── app.js                  # Express app setup (middleware, routes, static)
│       │
│       ├── config.js               # dotenv loader, export config object
│       │
│       ├── db/
│       │   ├── database.js         # better-sqlite3 connection, WAL mode
│       │   ├── migrate.js          # Run migrations on startup
│       │   └── seed.js             # Seed admin user from .env
│       │
│       ├── migrations/
│       │   ├── 001-init.sql        # Create all tables
│       │   └── 002-seed-data.sql   # Default operating hours
│       │
│       ├── routes/
│       │   ├── authRoutes.js       # POST register, POST login, GET me
│       │   ├── categoryRoutes.js   # CRUD categories
│       │   ├── serviceRoutes.js    # CRUD services
│       │   ├── slotRoutes.js       # GET available slots
│       │   ├── bookingRoutes.js    # POST booking, GET my bookings, PATCH cancel
│       │   ├── adminRoutes.js      # GET all bookings, PATCH status
│       │   ├── operatingHoursRoutes.js  # GET/PUT hours
│       │   └── configRoutes.js     # GET branding config
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js   # JWT verification → req.user
│       │   ├── adminMiddleware.js  # Check req.user.role === 'admin'
│       │   ├── validate.js         # Zod schema validation middleware
│       │   └── errorHandler.js     # Centralized error handler
│       │
│       ├── validators/
│       │   ├── authSchemas.js      # Register, login Zod schemas
│       │   ├── serviceSchemas.js   # Service/category CRUD schemas
│       │   ├── bookingSchemas.js   # Booking creation schema
│       │   └── commonSchemas.js    # Shared schemas (id param, date, etc.)
│       │
│       └── utils/
│           ├── slotGenerator.js    # Generate time slots from operating hours + service duration
│           ├── passwordUtils.js    # bcrypt hash/compare wrappers
│           └── tokenUtils.js       # JWT sign/verify wrappers
│
└── server/data/                    # SQLite database (gitignored)
    └── .gitkeep
```

### Architectural Boundaries

**API Boundaries:**
- All client ↔ server communication goes through `/api/v1/*` endpoints
- No direct database access from client — always via REST API
- Auth boundary: JWT token in Authorization header, verified by `authMiddleware`
- Admin boundary: `adminMiddleware` stacked after `authMiddleware`

**Component Boundaries:**
- Pages own their data fetching — call `api()`, manage local state
- Components receive data via props — no direct API calls in reusable components
- `AuthContext` is the only global state — accessed via `useAuth()` hook
- UI primitives (`ui/`) have zero business logic — pure presentation

**Data Boundaries:**
- `db/database.js` is the single point of SQLite access
- Route handlers call database directly (no repository layer — overkill for 5 tables)
- DB → API mapping: `snake_case` columns mapped to `camelCase` in route handlers
- Zod validators sit between request and handler — reject bad input before DB

### Requirements to Structure Mapping

| FR Category | Backend Files | Frontend Files |
|-------------|--------------|----------------|
| **User Management** (FR1-FR6) | `authRoutes.js`, `authSchemas.js`, `passwordUtils.js`, `tokenUtils.js`, `seed.js` | `LoginPage.jsx`, `RegisterPage.jsx`, `AuthContext.jsx` |
| **Service Management** (FR7-FR12) | `serviceRoutes.js`, `categoryRoutes.js`, `serviceSchemas.js` | `ServicesPage.jsx`, `ServiceCard.jsx`, `ManageServicesPage.jsx`, `ManageCategoriesPage.jsx` |
| **Schedule & Slots** (FR13-FR17) | `slotRoutes.js`, `operatingHoursRoutes.js`, `slotGenerator.js` | `BookingPage.jsx`, `SlotPicker.jsx`, `OperatingHoursPage.jsx` |
| **Booking Management** (FR18-FR26) | `bookingRoutes.js`, `adminRoutes.js`, `bookingSchemas.js` | `BookingPage.jsx`, `MyBookingsPage.jsx`, `ManageBookingsPage.jsx`, `BookingCard.jsx` |
| **White-Label** (FR27-FR30) | `configRoutes.js`, `.env` | `App.jsx` (CSS variables), `Navbar.jsx` (logo/name) |
| **System & Security** (FR31-FR35) | `authMiddleware.js`, `adminMiddleware.js`, `validate.js`, `errorHandler.js` | `ProtectedRoute.jsx`, `api.js` |

### Data Flow

```
Customer Browser → React SPA → api.js (fetch + JWT) → Express API → Middleware → Route Handler → SQLite
                                                                                       ↓
Customer Browser ← React State ← JSON Response ← { data } or { error } ←──────────────┘
```

### Development Workflow

**Dev Command:** `npm run dev` (from root)
- Starts Vite dev server on `localhost:5173` (client)
- Starts Express with nodemon on `localhost:3000` (server)
- Vite proxies `/api/*` to Express in development

**Build Command:** `npm run build`
- Vite builds client → `client/dist/`
- Express serves `client/dist/` as static files in production

**Start Command:** `npm start`
- Runs Express on configured PORT
- Serves both API and SPA from single server

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All pass.
- React + Vite + Tailwind — fully compatible
- Express + better-sqlite3 — synchronous DB with Express handlers
- Zod — shared validation in Node.js and browser
- JWT + localStorage + Authorization header — standard SPA pattern

**Pattern Consistency:** All pass.
- snake_case (DB) → camelCase (API/JS) → PascalCase (components) — no overlaps
- API response `{ data }` / `{ error }` — uniform across all endpoints
- File naming matches component naming consistently

### Requirements Coverage

| FR Range | Coverage | Status |
|----------|----------|--------|
| FR1-FR6 (User Management) | 100% | Covered |
| FR7-FR12 (Service Management) | 100% | Covered |
| FR13-FR17 (Schedule & Slots) | 100% | Covered |
| FR18-FR26 (Booking Management) | 100% | Covered |
| FR27-FR30 (White-Label) | 100% | Covered |
| FR31-FR35 (System & Security) | 100% | Covered |

**All NFRs (Performance, Security, Reliability, Usability, Deployability) architecturally addressed.**

### Implementation Readiness

**Overall Status: READY FOR IMPLEMENTATION**
**Confidence Level: High**
**Critical Gaps: Zero**

### Architecture Completeness Checklist

- [x] Project context analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped
- [x] Critical decisions documented
- [x] Technology stack specified
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Requirements to structure mapping complete
- [x] Data flow documented
- [x] Validation passed
