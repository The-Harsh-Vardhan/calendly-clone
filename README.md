# Calendly Clone — Scheduling Platform

A full-featured scheduling and booking web application that replicates [Calendly's](https://calendly.com) design and user experience. Built as a fullstack application with a modern tech stack.

## 🖥️ Live Demo

- **Frontend:** [Deployed URL here]
- **Backend API:** [Deployed URL here]

## 📸 Screenshots

_Screenshots will be added after deployment._

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router, React 19) |
| **Styling** | Vanilla CSS with CSS Custom Properties |
| **Backend** | Express.js on Node.js |
| **Database** | PostgreSQL (hosted on Supabase) |
| **ORM** | Prisma |
| **Deployment** | Vercel (frontend) + Render (backend) |

## 🏗️ Architecture

```
┌─────────────────┐     ┌────────────────────┐     ┌──────────────┐
│   Next.js App   │────▶│  Express.js API     │────▶│  PostgreSQL  │
│   (Vercel)      │     │  (Render)           │     │  (Supabase)  │
└─────────────────┘     └────────────────────┘     └──────────────┘
```

- **Frontend** communicates with the backend via REST API calls
- **Backend** handles all business logic, validation, and database operations
- **Database** stores users, event types, availability, and bookings
- All timestamps stored in **UTC**; timezone conversion happens on the client

## 🗄️ Database Schema

### Tables
- **users** — Default user profile (name, email, timezone)
- **event_types** — Meeting templates (name, slug, duration, color, description)
- **availability_schedules** — Named availability configurations per user
- **availability_rules** — Day-of-week + time range rules within a schedule
- **date_overrides** — Date-specific availability overrides
- **bookings** — Confirmed/cancelled meeting instances

### Key Design Decisions
- UUIDs as primary keys for security and distribution-readiness
- Unique slug on event types enables clean public booking URLs
- Cascade deletes for referential integrity
- Status field on bookings (confirmed/cancelled) instead of soft delete

## ✨ Features

### Core Features
- ✅ **Event Types CRUD** — Create, edit, delete, and toggle event types with unique booking links
- ✅ **Availability Settings** — Toggle days on/off, set start/end times, choose timezone
- ✅ **Public Booking Page** — Calendar date picker → time slot selection → booking form → confirmation
- ✅ **Double-booking Prevention** — Server-side validation prevents overlapping bookings
- ✅ **Meetings Dashboard** — View upcoming and past meetings with cancel functionality

### Bonus Features
- ✅ **Responsive Design** — Mobile, tablet, and desktop layouts
- ✅ **Timezone Support** — Automatic browser timezone detection with manual override
- ✅ **Date-specific Overrides** — Override availability for specific dates (schema ready)

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/calendly-clone.git
cd calendly-clone
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your Supabase connection strings:
# DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@..."
# DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@..."

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed the database with sample data
npm run db:seed

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start the dev server
npm run dev
```

### 4. Open the app
- **Admin Dashboard:** http://localhost:3000
- **Public Booking Page:** http://localhost:3000/booking/30-min-meeting

## 📁 Project Structure

```
calendly-clone/
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/        # Admin pages (sidebar layout)
│   │   │   │   ├── page.js     # Event Types dashboard
│   │   │   │   ├── availability/
│   │   │   │   ├── meetings/
│   │   │   │   └── event-types/
│   │   │   ├── booking/[slug]/ # Public booking page
│   │   │   └── layout.js
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   ├── CalendarWidget.js
│   │   │   ├── Modal.js
│   │   │   └── Toast.js
│   │   └── lib/
│   │       └── api.js
│   └── package.json
│
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middleware/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── package.json
│
└── README.md
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/event-types` | List all event types |
| `GET` | `/api/event-types/:slug` | Get event type by slug |
| `POST` | `/api/event-types` | Create event type |
| `PUT` | `/api/event-types/:id` | Update event type |
| `DELETE` | `/api/event-types/:id` | Delete event type |
| `GET` | `/api/availability` | Get availability schedule |
| `PUT` | `/api/availability` | Update availability |
| `GET` | `/api/availability/:slug/:date` | Get available time slots |
| `POST` | `/api/bookings` | Create booking |
| `GET` | `/api/bookings?type=upcoming\|past` | List meetings |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel booking |

## 💡 Assumptions

1. **No authentication** — A single default user is assumed to be logged in on the admin side
2. **15-minute intervals** — Time slots are generated at 15-minute intervals within available hours
3. **No email service** — Booking confirmations are shown on-screen (email integration can be added)
4. **Monday-first calendar** — The calendar widget uses Monday as the first day of the week, matching Calendly

## 👨‍💻 Author

Harsh Agrawal
