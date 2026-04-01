---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ["prd.md", "architecture.md", "product-brief-Sallon.md"]
---

# Sallon - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Sallon, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: Customer can register an account with name, email, phone, and password
- FR2: Customer can log in with email and password
- FR3: Admin can log in with admin credentials
- FR4: System can distinguish between Customer and Admin roles
- FR5: Customer can view and update their own profile information
- FR6: Admin can be seeded via configuration on first deployment
- FR7: Admin can create, read, update, and delete service categories
- FR8: Admin can create, read, update, and delete individual services
- FR9: Each service can have a name, description, duration (minutes), price, and category assignment
- FR10: Customer can browse all active services organized by category
- FR11: Customer can filter services by category
- FR12: Admin can activate or deactivate services without deleting them
- FR13: Admin can configure salon operating hours (open time, close time) per day of week
- FR14: Admin can mark specific days as closed (holidays, days off)
- FR15: System can generate available time slots for a given date based on service duration and operating hours
- FR16: System can exclude already-booked slots from available slots
- FR17: Customer can view available time slots for a selected service and date
- FR18: Customer can create a booking by selecting a service, date, and available time slot
- FR19: System can prevent double bookings at the database level
- FR20: System can handle concurrent booking attempts gracefully with a user-friendly error message
- FR21: Customer can view their own booking history with status
- FR22: Customer can cancel their own pending bookings
- FR23: Admin can view all bookings with filters (by date, status, category, customer)
- FR24: Admin can update booking status (Pending → Confirmed → Completed)
- FR25: Admin can cancel any booking (status → Cancelled)
- FR26: System can display today's schedule as a daily view for admin
- FR27: System can be configured with custom salon name, logo, and brand colors via config file
- FR28: System can display the configured branding across all customer-facing pages
- FR29: Admin can generate and share a direct booking link (WhatsApp-ready URL)
- FR30: Open Graph meta tags can render a branded preview when the booking link is shared on WhatsApp/social
- FR31: System can authenticate users via JWT tokens
- FR32: System can protect admin routes from unauthorized access
- FR33: System can protect customer routes from unauthenticated access
- FR34: System can hash and securely store passwords
- FR35: System can validate all user inputs on both client and server side

### NonFunctional Requirements

- NFR1: All customer-facing pages load in under 2 seconds on a 3G mobile connection
- NFR2: API endpoints respond within 200ms for booking and slot queries
- NFR3: System supports at least 50 concurrent users without degradation
- NFR4: Initial JavaScript bundle size under 200KB gzipped
- NFR5: All passwords hashed with bcrypt (minimum 10 salt rounds)
- NFR6: JWT tokens expire within 24 hours
- NFR7: All API endpoints validate and sanitize input to prevent SQL injection and XSS
- NFR8: Admin routes protected by role-based middleware
- NFR9: CORS configured to allow only the frontend origin
- NFR10: No sensitive data logged or exposed in API responses
- NFR11: Double-booking prevention enforced at database level
- NFR12: Graceful error handling — no unhandled crashes visible to users
- NFR13: SQLite database with WAL mode for concurrent read performance
- NFR14: All customer flows completable on a 360px mobile screen
- NFR15: Maximum 3 taps/clicks from landing page to confirmed booking
- NFR16: Touch targets minimum 44x44px
- NFR17: Error messages are human-readable and actionable
- NFR18: Admin dashboard usable on mobile phone
- NFR19: Single npm install && npm start to run the entire application
- NFR20: No external services required
- NFR21: Environment variables for all configuration
- NFR22: White-label config changeable without rebuilding the application

### Additional Requirements

- Starter template: Vite React + Express monorepo initialization
- Database: SQLite with better-sqlite3, WAL mode, numbered SQL migration files
- Auth: JWT with bcrypt, admin seeded from .env on first run
- API: RESTful /api/v1/*, Zod validation middleware, { data } / { error } response format
- Frontend: React Context (AuthContext), React Router v6, fetch wrapper (lib/api.js), Tailwind CSS
- Deployment: Express serves Vite build output as static files, single server

### UX Design Requirements

No UX Design specification document. UI implementation guided by PRD user journeys, mobile-first responsive design, and Tailwind CSS utility classes.

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Customer registration |
| FR2 | Epic 1 | Customer login |
| FR3 | Epic 1 | Admin login |
| FR4 | Epic 1 | Role distinction |
| FR5 | Epic 1 | Profile management |
| FR6 | Epic 1 | Admin seeding |
| FR7 | Epic 2 | Category CRUD |
| FR8 | Epic 2 | Service CRUD |
| FR9 | Epic 2 | Service fields |
| FR10 | Epic 2 | Customer browse services |
| FR11 | Epic 2 | Category filtering |
| FR12 | Epic 2 | Service activate/deactivate |
| FR13 | Epic 3 | Operating hours config |
| FR14 | Epic 3 | Closed days |
| FR15 | Epic 3 | Slot generation |
| FR16 | Epic 3 | Exclude booked slots |
| FR17 | Epic 3 | Customer view slots |
| FR18 | Epic 4 | Create booking |
| FR19 | Epic 4 | Prevent double booking |
| FR20 | Epic 4 | Handle concurrent bookings |
| FR21 | Epic 4 | Booking history |
| FR22 | Epic 4 | Customer cancel booking |
| FR23 | Epic 5 | Admin view all bookings |
| FR24 | Epic 5 | Admin update status |
| FR25 | Epic 5 | Admin cancel booking |
| FR26 | Epic 5 | Daily schedule view |
| FR27 | Epic 6 | Branding config |
| FR28 | Epic 6 | Display branding |
| FR29 | Epic 6 | Shareable booking link |
| FR30 | Epic 6 | OG meta tags |
| FR31 | Epic 1 | JWT authentication |
| FR32 | Epic 1 | Admin route protection |
| FR33 | Epic 1 | Customer route protection |
| FR34 | Epic 1 | Password hashing |
| FR35 | Epic 1 | Input validation |

## Epic List

### Epic 1: Project Foundation & Authentication
Users can register, log in, and access role-appropriate areas of the application. Admin account is seeded on first deployment.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR31, FR32, FR33, FR34, FR35

### Epic 2: Service & Category Management
Admin can set up the salon's service catalog. Customers can browse and filter services.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12

### Epic 3: Schedule & Time Slot System
Admin can configure operating hours. System generates available time slots based on service duration.
**FRs covered:** FR13, FR14, FR15, FR16, FR17

### Epic 4: Booking System
Customers can book appointments and view their booking history. System prevents double bookings.
**FRs covered:** FR18, FR19, FR20, FR21, FR22

### Epic 5: Admin Booking Management
Admin can view, filter, and manage all bookings. Daily schedule view for operations.
**FRs covered:** FR23, FR24, FR25, FR26

### Epic 6: White-Label & Branding
System supports custom branding and shareable booking links.
**FRs covered:** FR27, FR28, FR29, FR30

---

## Epic 1: Project Foundation & Authentication

Users can register, log in, and access role-appropriate areas. Admin seeded on first deployment.

### Story 1.1: Project Initialization & Database Setup

As a **developer**,
I want the monorepo scaffolded with database migrations,
So that all future stories have a working foundation to build on.

**Acceptance Criteria:**

**Given** the project is cloned and `npm install` is run
**When** `npm run dev` is executed
**Then** the Vite dev server starts on port 5173 and Express starts on port 3000
**And** SQLite database is created with WAL mode enabled
**And** all 5 tables (users, categories, services, operating_hours, bookings) are created via migration
**And** `.env.example` contains all required environment variables

### Story 1.2: User Registration

As a **customer**,
I want to register with my name, email, phone, and password,
So that I can create an account and book appointments.

**Acceptance Criteria:**

**Given** a visitor is on the registration page
**When** they submit valid name, email, phone, and password
**Then** an account is created with role "customer" and password hashed with bcrypt
**And** a JWT token is returned and stored in localStorage
**And** the user is redirected to the home page

**Given** a visitor submits an email that already exists
**When** the registration request is processed
**Then** a 409 error is returned with message "Email already registered"

**Given** a visitor submits invalid data (missing fields, short password)
**When** the form is submitted
**Then** Zod validation errors are shown inline on the form

### Story 1.3: User Login

As a **customer or admin**,
I want to log in with email and password,
So that I can access my account.

**Acceptance Criteria:**

**Given** a registered user is on the login page
**When** they submit correct email and password
**Then** a JWT token is returned and stored in localStorage
**And** the user is redirected based on role (customer → home, admin → dashboard)

**Given** a user submits incorrect credentials
**When** the login request is processed
**Then** a 401 error is returned with message "Invalid email or password"

### Story 1.4: Admin Seeding & Auth Context

As a **salon owner**,
I want an admin account created on first deployment,
So that I can immediately access the admin dashboard.

**Acceptance Criteria:**

**Given** `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`
**When** the server starts and no admin user exists
**Then** an admin user is created with role "admin"

**Given** a user is logged in
**When** any page is loaded
**Then** AuthContext provides user data, token, and role via `useAuth()` hook
**And** Navbar shows login/register for guests, or user name + logout for authenticated users

### Story 1.5: Route Protection & Profile

As a **customer**,
I want my routes protected and my profile viewable,
So that only I can see my data and only admins can access admin pages.

**Acceptance Criteria:**

**Given** an unauthenticated user tries to access `/my-bookings`
**When** the route is loaded
**Then** they are redirected to `/login`

**Given** a customer tries to access `/admin/*`
**When** the route is loaded
**Then** they receive a 403 Forbidden response

**Given** an authenticated customer navigates to their profile
**When** the profile page loads
**Then** they see their name, email, and phone
**And** they can update their profile information

---

## Epic 2: Service & Category Management

Admin configures service catalog. Customers browse and filter.

### Story 2.1: Admin Category Management

As a **salon owner**,
I want to create, edit, and delete service categories,
So that I can organize my salon's offerings.

**Acceptance Criteria:**

**Given** an admin is on the Manage Categories page
**When** they create a new category with name and display order
**Then** the category is saved and appears in the list

**Given** an admin edits a category name
**When** they save the changes
**Then** the category is updated immediately

**Given** an admin deletes a category that has no services
**When** they confirm deletion
**Then** the category is removed

### Story 2.2: Admin Service Management

As a **salon owner**,
I want to add, edit, and activate/deactivate services,
So that I can manage my salon's service menu.

**Acceptance Criteria:**

**Given** an admin is on the Manage Services page
**When** they create a service with name, description, duration, price, and category
**Then** the service is saved and associated with the chosen category

**Given** an admin deactivates a service
**When** the service status is toggled
**Then** the service is hidden from customers but still visible in admin panel

**Given** an admin edits a service's price or duration
**When** they save changes
**Then** the updated details are reflected immediately

### Story 2.3: Customer Service Browsing

As a **customer**,
I want to browse services by category,
So that I can find the service I need.

**Acceptance Criteria:**

**Given** a customer visits the home page
**When** the page loads
**Then** all active categories are displayed as selectable cards

**Given** a customer selects a category (e.g., "Boys")
**When** the services page loads
**Then** all active services in that category are displayed with name, duration, and price

**Given** a customer filters by a different category
**When** they select another category
**Then** the service list updates to show only services in the selected category

---

## Epic 3: Schedule & Time Slot System

Admin sets operating hours. System generates available time slots.

### Story 3.1: Operating Hours Configuration

As a **salon owner**,
I want to set operating hours per day and mark days as closed,
So that customers only see available times.

**Acceptance Criteria:**

**Given** an admin navigates to Operating Hours page
**When** they set open time (09:00) and close time (19:00) for Monday
**Then** the operating hours are saved for that day

**Given** an admin marks Monday as closed
**When** they toggle the "closed" switch
**Then** Monday shows as closed and no slots are generated for Mondays

**Given** default operating hours are seeded (9 AM - 7 PM, Mon-Sat, Sunday closed)
**When** the server runs migrations
**Then** all 7 days have default operating hours configured

### Story 3.2: Time Slot Generation & Display

As a **customer**,
I want to see available time slots for a service on a specific date,
So that I can pick a convenient appointment time.

**Acceptance Criteria:**

**Given** a customer selects a service (30 min duration) and a date (Saturday)
**When** the available slots API is called
**Then** time slots are generated in 30-minute intervals within operating hours (e.g., 09:00, 09:30, 10:00...)
**And** already-booked slots are excluded from the results

**Given** a customer selects a date that is marked as closed
**When** the slots API is called
**Then** an empty list is returned with a message "Salon is closed on this day"

**Given** a customer selects today's date and it's currently 14:00
**When** the slots API is called
**Then** only future slots (14:30, 15:00...) are returned, not past ones

---

## Epic 4: Booking System

Customers book appointments. System prevents double bookings.

### Story 4.1: Booking Creation

As a **customer**,
I want to book an appointment by selecting a service, date, and time slot,
So that I can secure my salon visit.

**Acceptance Criteria:**

**Given** a customer has selected a service, date, and available time slot
**When** they confirm the booking
**Then** a booking is created with status "Pending"
**And** the customer sees a confirmation with booking details
**And** the booked slot is no longer available for others

**Given** a customer tries to book a slot that was just taken
**When** the booking request is processed
**Then** a 409 error is returned with message "This slot was just taken. Please select another time."
**And** the slot list refreshes automatically

### Story 4.2: Booking History & Cancellation

As a **customer**,
I want to view my bookings and cancel pending ones,
So that I can manage my appointments.

**Acceptance Criteria:**

**Given** an authenticated customer navigates to My Bookings
**When** the page loads
**Then** all their bookings are displayed sorted by date (newest first)
**And** each booking shows service name, date, time, status, and price

**Given** a customer has a booking with status "Pending"
**When** they click "Cancel"
**Then** the booking status changes to "Cancelled"
**And** the time slot becomes available for other customers again

**Given** a customer has a booking with status "Confirmed" or "Completed"
**When** they view the booking
**Then** no cancel button is shown

---

## Epic 5: Admin Booking Management

Admin manages all bookings and views daily schedule.

### Story 5.1: Admin Booking Dashboard

As a **salon owner**,
I want to view all bookings with filters,
So that I can manage my salon's schedule.

**Acceptance Criteria:**

**Given** an admin navigates to Manage Bookings
**When** the page loads
**Then** all bookings are displayed with customer name, service, date, time, and status

**Given** an admin filters by date
**When** a date is selected
**Then** only bookings for that date are shown

**Given** an admin filters by status (Pending/Confirmed/Completed/Cancelled)
**When** a status is selected
**Then** only bookings with that status are shown

### Story 5.2: Booking Status Management & Daily View

As a **salon owner**,
I want to update booking statuses and see today's schedule,
So that I can run daily operations smoothly.

**Acceptance Criteria:**

**Given** an admin views a Pending booking
**When** they click "Confirm"
**Then** the status changes to "Confirmed"

**Given** an admin views a Confirmed booking
**When** they click "Complete"
**Then** the status changes to "Completed"

**Given** an admin views any non-cancelled booking
**When** they click "Cancel"
**Then** the status changes to "Cancelled"

**Given** an admin opens the Dashboard page
**When** the page loads
**Then** today's bookings are shown in chronological order as a daily schedule view
**And** each entry shows time, customer name, service, and status

---

## Epic 6: White-Label & Branding

Custom branding and shareable booking links.

### Story 6.1: Branding Configuration & Display

As a **salon owner**,
I want my salon's name, logo, and colors displayed across the platform,
So that customers see my brand, not a generic system.

**Acceptance Criteria:**

**Given** `SALON_NAME`, `SALON_LOGO_URL`, `PRIMARY_COLOR`, `SECONDARY_COLOR` are set in `.env`
**When** any customer-facing page loads
**Then** the configured salon name appears in the Navbar and page title
**And** the logo is displayed in the Navbar
**And** CSS variables are set for primary/secondary colors used by Tailwind

**Given** the branding config API is called
**When** the response is returned
**Then** it contains salonName, logoUrl, primaryColor, secondaryColor

### Story 6.2: Shareable Booking Link & OG Tags

As a **salon owner**,
I want to share a booking link on WhatsApp with a branded preview,
So that my customers can easily find and book online.

**Acceptance Criteria:**

**Given** an admin views the Dashboard
**When** they click "Copy Booking Link"
**Then** the salon's public booking URL is copied to clipboard

**Given** a user shares the booking link on WhatsApp
**When** WhatsApp renders the link preview
**Then** Open Graph meta tags display the salon name, description, and logo

**Given** a customer opens the shared booking link
**When** the page loads
**Then** they land on the salon's branded home page with service categories
