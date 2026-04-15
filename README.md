# 📅 Calendly Clone — Full-Stack Scheduling Platform

A feature-rich scheduling platform that replicates Calendly's core functionality and visual design. Built with Next.js, Express.js, and PostgreSQL (Supabase).

## 🚀 Live Demo

- **Frontend**: [Vercel Deployment URL]
- **Backend API**: [Render Deployment URL]

## 📸 Screenshots

### Event Types Dashboard
Manage your event types with color-coded cards, active toggles, copy link, edit, and delete actions.

### Availability Settings
Configure weekly hours with day-level toggles, start/end time pickers, and timezone selection.

### Meetings
View upcoming and past meetings with date badges, attendee info, and cancel functionality.

### Public Booking Page
Calendly-matching 3-step booking flow: Calendar → Time Slots → Booking Form → Confirmation.

## ✨ Features

- **Event Types CRUD** — Create, edit, delete, and toggle event types with custom colors
- **Weekly Availability** — Set available hours per day with timezone support
- **Public Booking Flow** — 3-step Calendly-style booking experience
- **Time Slot Generation** — 15-minute interval slots with smart availability calculation
- **Double-Booking Prevention** — Server-side overlap detection
- **Meetings Dashboard** — Upcoming/Past tabs with cancel functionality
- **Responsive Design** — 900+ line CSS design system matching Calendly aesthetics
- **Toast Notifications** — Success/error feedback on all actions

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router, React 19) |
| Backend | Express.js (Node.js) |
| Database | PostgreSQL on Supabase |
| ORM | Prisma 6 |
| Styling | Vanilla CSS (Custom Design System) |

## 📁 Project Structure

```
calendly-clone/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # 6-table database schema
│   │   └── seed.js          # Sample data seeder
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Error handling
│   │   └── index.js         # Express server
│   ├── Dockerfile           # Production container
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/     # Dashboard pages
│   │   │   ├── booking/     # Public booking page
│   │   │   ├── globals.css  # Design system
│   │   │   └── layout.js    # Root layout
│   │   ├── components/      # Reusable components
│   │   └── lib/api.js       # API client
│   └── next.config.mjs
└── docs/                    # Assignment specification
```

## 🗄️ Database Schema

```
Users ──┬── EventTypes ──── Bookings
        └── AvailabilitySchedules ──┬── AvailabilityRules
                                    └── DateOverrides
```

6 tables: `users`, `event_types`, `availability_schedules`, `availability_rules`, `date_overrides`, `bookings`

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)

### 1. Clone the repository
```bash
git clone https://github.com/The-Harsh-Vardhan/calendly-clone.git
cd calendly-clone
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env from template
cp .env.example .env
# Edit .env with your Supabase connection strings

# Push schema to database
npx prisma db push

# Seed sample data
node prisma/seed.js

# Start development server
npm run dev   # Runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start development server
npm run dev   # Runs on http://localhost:3000
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/event-types` | List all event types |
| GET | `/api/event-types/:slug` | Get event type by slug |
| POST | `/api/event-types` | Create event type |
| PUT | `/api/event-types/:id` | Update event type |
| DELETE | `/api/event-types/:id` | Delete event type |
| GET | `/api/availability` | Get availability schedule |
| PUT | `/api/availability` | Update availability |
| GET | `/api/availability/:slug/:date` | Get available time slots |
| GET | `/api/bookings` | List bookings (upcoming/past) |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |

## 🚢 Deployment

### Backend → Render
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install && npx prisma generate`
5. Set **Start Command**: `node src/index.js`
6. Add environment variables from `.env.example`

### Frontend → Vercel
1. Import your GitHub repo on Vercel
2. Set **Root Directory**: `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your Render URL + `/api`

## 📝 Key Design Decisions

- **Timezone Handling**: All timestamps stored in UTC; conversion on client side
- **Single User**: Hardcoded default user (`00000000-0000-0000-0000-000000000001`) per assignment constraints
- **Slot Generation**: 15-minute intervals, filters out booked slots server-side
- **Calendar Widget**: Monday-first grid matching Calendly, only highlights available weekdays

## 👤 Author

**Harsh Agrawal** — [GitHub](https://github.com/The-Harsh-Vardhan)

---

Built as part of the Scaler SDE Intern Full-Stack Assignment.
