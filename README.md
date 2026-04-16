# OneClick. — HR Intelligence Platform

**A full-stack HR management system with role-based dashboards, real-time attendance tracking, leave management, and workforce analytics.**

Built with React 19 · Express 5 · MongoDB · Forest & Amber Design System

---

[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)]()

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Design System](#-design-system)
- [Role-Based Access](#-role-based-access)
- [Screenshots](#-screenshots)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**OneClick** is a modern, full-stack HR management platform designed for small to mid-size organizations. It features two distinct dashboards — an **Admin Dashboard** for HR managers and an **Employee Portal** for team members — both sharing the same backend API but offering role-specific views and functionality.

The platform handles the complete HR lifecycle: employee onboarding, daily attendance tracking with live session timers, leave request workflows with admin approval, and real-time workforce analytics — all wrapped in a hand-crafted **Forest & Amber** design system that prioritizes clarity and editorial aesthetics over generic UI frameworks.

---

## ✨ Features

### 🔐 Authentication & Security
- **Email/password registration** with email verification via Nodemailer
- **Google OAuth 2.0** sign-in with one-click access
- **JWT-based authentication** with 30-day token expiry
- **Password confirmation** flow on signup (set password + confirm)
- **Auto-login** after email verification — zero friction onboarding
- **Premium verification email** matching the app's Forest & Amber design

### 👨‍💼 Admin Dashboard (`/`)
| Page | Features |
|------|----------|
| **Overview** | 4 KPI cards (Total/Active/On Leave/Pending), live session tracker, real weekly attendance grid, department health bars, recent leave requests |
| **Attendance** | All-employee attendance table with expandable day-by-day breakdown, attendance rate progress bars, CSV export with check-in/out timestamps |
| **Team Directory** | Full CRUD — add, edit, delete employees. Search by name/email/role. Department filter tabs. Color-coded initials avatars |
| **Leave Hub** | View all leave requests. Filter by status. Approve/Reject with one click. Auto-calculates days. Toast notifications |
| **Analytics** | Real-time charts — weekly attendance trend (bar), leave type distribution (donut), department breakdown cards with progress bars. All data aggregated from the database |

### 👤 Employee Portal (`/emp`)
| Page | Features |
|------|----------|
| **My Overview** | Personalized welcome banner, session tracker, this-week attendance grid, personal KPIs, recent leave requests |
| **My Attendance** | Personal attendance history grouped by month, check-in/out times, status badges, CSV export, attendance rate |
| **My Leaves** | Apply for leave, view own requests as cards, filter by status, days counter, validation warnings |
| **My Profile** | Linked employee information, account details, status badge, join date |

### 📊 Real-Time Data
- **Zero static data** — every number, chart, and status badge comes from live MongoDB queries
- **Session tracker** with real-time elapsed timer and auto Late detection (after 09:30 AM)
- **Weekly attendance grid** calculated server-side via the `/attendance/my-week` endpoint
- **Analytics aggregation** — weekly trends, leave distributions, department health — all computed on the fly

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2 | UI framework with hooks & context |
| **Vite** | 8.0 | Build tool & dev server (HMR) |
| **React Router** | 7.14 | Client-side routing with nested layouts |
| **Recharts** | 3.8 | Composable chart components |
| **Lucide React** | 1.8 | Icon library (tree-shakeable) |
| **date-fns** | 4.1 | Date formatting & manipulation |
| **Axios** | 1.15 | HTTP client with interceptors |
| **@react-oauth/google** | 0.13 | Google Sign-In integration |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express** | 5.2 | HTTP server & REST API |
| **Mongoose** | 9.4 | MongoDB ODM with schema validation |
| **jsonwebtoken** | 9.0 | JWT token generation & verification |
| **bcryptjs** | 3.0 | Password hashing (10 salt rounds) |
| **Nodemailer** | 8.0 | SMTP email delivery via Gmail |
| **cors** | 2.8 | Cross-origin resource sharing |
| **dotenv** | 17.4 | Environment variable management |
| **nodemon** | 3.1 | Auto-restart on file changes (dev) |

### Database
| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐│
│  │ AuthCtx  │  │  Admin Routes │  │   Employee Routes       ││
│  │ (JWT)    │──│  /  /att /dir │  │   /emp  /emp/att /emp/l ││
│  └──────────┘  │  /leaves /ana│  │   /emp/profile           ││
│                └──────┬───────┘  └──────────┬──────────────┘│
│                       │                     │                │
│                ┌──────┴─────────────────────┴───────┐        │
│                │     Axios Instance (api.js)         │        │
│                │  Base: http://localhost:5000/api     │        │
│                │  Auto-injects: Bearer <JWT>         │        │
│                └─────────────────┬───────────────────┘        │
└──────────────────────────────────┼────────────────────────────┘
                                   │ HTTP
┌──────────────────────────────────┼────────────────────────────┐
│                        SERVER (Express 5)                     │
│  ┌─────────────┐  ┌─────────────┴───────────────┐            │
│  │ authMiddle-  │  │         API Routes          │            │
│  │ ware (JWT)  │──│  /api/auth                   │            │
│  └─────────────┘  │  /api/employees              │            │
│                   │  /api/attendance              │            │
│                   │  /api/leaves                  │            │
│                   └──────────────┬───────────────┘            │
│                                  │                            │
│                   ┌──────────────┴───────────────┐            │
│                   │    Mongoose Models           │            │
│                   │  User │ Employee │ Attendance│            │
│                   │  LeaveRequest                │            │
│                   └──────────────┬───────────────┘            │
└──────────────────────────────────┼────────────────────────────┘
                                   │
                        ┌──────────┴──────────┐
                        │   MongoDB Atlas      │
                        │   (Cloud Database)   │
                        └─────────────────────┘
```

---

## 📁 Project Structure

```
HrManager/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Sticky header with live clock & user pill
│   │   │   ├── Sidebar.jsx          # Admin sidebar (forest green)
│   │   │   └── EmployeeSidebar.jsx  # Employee sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state (JWT + user object)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Admin shell (sidebar + spacer + outlet)
│   │   │   ├── EmployeeDashboard.jsx# Employee shell
│   │   │   ├── Overview.jsx         # Admin overview (KPIs, session, health)
│   │   │   ├── Attendance.jsx       # All-team attendance records
│   │   │   ├── TeamDirectory.jsx    # Employee CRUD
│   │   │   ├── LeaveHub.jsx         # Leave management + approve/reject
│   │   │   ├── Analytics.jsx        # Charts & workforce insights
│   │   │   ├── Login.jsx            # Split-screen login
│   │   │   ├── Signup.jsx           # Split-screen signup + confirm password
│   │   │   ├── VerificationSent.jsx # "Check your email" page
│   │   │   ├── VerificationSuccess.jsx # Auto-login after verify
│   │   │   └── emp/                 # Employee-only pages
│   │   │       ├── EmpOverview.jsx  # Personalized dashboard
│   │   │       ├── EmpAttendance.jsx# Personal attendance history
│   │   │       ├── EmpLeaves.jsx    # Apply & track own leaves
│   │   │       └── EmpProfile.jsx   # Profile & account info
│   │   ├── utils/
│   │   │   └── api.js               # Axios instance with JWT interceptor
│   │   ├── App.jsx                  # Router with role-based guards
│   │   ├── index.css                # Design system (Forest & Amber)
│   │   └── main.jsx                 # Entry point (AuthProvider wrapping)
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, verify, login, Google OAuth
│   │   ├── attendanceController.js  # Check-in, check-out, my-week
│   │   ├── employeeController.js    # CRUD operations
│   │   └── leaveController.js       # Leave CRUD + analytics aggregation
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verify + attach user to req
│   ├── models/
│   │   ├── User.js                  # Auth user (email, password, role)
│   │   ├── Employee.js              # Employee profile (name, dept, status)
│   │   ├── Attendance.js            # Daily attendance (check-in/out, hours)
│   │   └── LeaveRequest.js          # Leave requests (type, dates, status)
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── attendanceRoutes.js      # /api/attendance/*
│   │   ├── employeeRoutes.js        # /api/employees/*
│   │   └── leaveRoutes.js           # /api/leaves/*
│   ├── utils/
│   │   └── email.js                 # Nodemailer transporter
│   ├── .env                         # Environment variables (not committed)
│   ├── index.js                     # Server entry point
│   └── package.json
│
├── .env.example                     # Template for server environment vars
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (recommended: 22+)
- **npm** ≥ 9
- **MongoDB Atlas** account ([free tier](https://www.mongodb.com/atlas/database))
- **Gmail account** with an [App Password](https://myaccount.google.com/apppasswords) (for email verification)
- **Google Cloud Console** project with OAuth 2.0 Client ID (optional, for Google Sign-In)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/HrManager.git
cd HrManager
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

Create `server/.env` from the template:

```bash
cp .env.example server/.env
```

Then edit `server/.env` with your actual credentials (see [Environment Variables](#-environment-variables) below).

### 4. Start Development Servers

Open **two terminal windows**:

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

### 5. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables

All environment variables go in `server/.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/oneclick` |
| `JWT_SECRET` | Secret key for JWT signing (use a strong random string) | `my-super-secret-key-2026` |
| `GMAIL_USER` | Gmail address for sending verification emails | `yourapp@gmail.com` |
| `GMAIL_PASS` | Gmail **App Password** (NOT your regular password) | `abcd efgh ijkl mnop` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (from Cloud Console) | `123456789.apps.googleusercontent.com` |

> **⚠️ Important:**
> - For `GMAIL_PASS`, you must use a [Google App Password](https://myaccount.google.com/apppasswords), not your Gmail login password. Enable 2FA on the Gmail account first.
> - For `GOOGLE_CLIENT_ID`, set `http://localhost:5173` as an **Authorized JavaScript Origin** in Google Cloud Console.
> - For MongoDB Atlas, whitelist your IP address (or set `0.0.0.0/0` for development).

---

## 📡 API Reference

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | No | Register with name, email, password. Sends verification email. |
| `GET` | `/verify/:token` | No | Verify email. Redirects to `/verify-success` with auto-login data. |
| `POST` | `/login` | No | Login with email + password. Returns JWT + user object. |
| `POST` | `/google-login` | No | Login/register via Google OAuth. Returns JWT + user object. |

### Employees (`/api/employees`) — 🔒 Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all employees |
| `POST` | `/` | Add new employee |
| `PUT` | `/:id` | Update employee |
| `DELETE` | `/:id` | Delete employee |

### Attendance (`/api/attendance`) — 🔒 Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all attendance records (populated with employee name/dept) |
| `GET` | `/my-week` | Get current user's Mon–Fri attendance for this week |
| `POST` | `/checkin` | Check in for today. Auto-marks Late if after 09:30. Body: `{ date }` |
| `POST` | `/checkout` | Check out. Calculates hours worked. Body: `{ date }` |

### Leaves (`/api/leaves`) — 🔒 Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all leave requests (sorted newest first) |
| `GET` | `/analytics` | Aggregated analytics: weekly trend, leave by type, dept breakdown, KPIs |
| `POST` | `/` | Apply for leave. Body: `{ employeeId, type, from, to, reason }` |
| `PUT` | `/:id/status` | Update leave status. Body: `{ status: 'Approved' | 'Rejected' }` |

**Authentication:** All protected routes require a `Bearer` token in the `Authorization` header.

---

## 🗄 Database Schema

### User
```javascript
{
  name:              String (required),
  email:             String (required, unique),
  password:          String,                    // bcrypt hashed
  role:              'admin' | 'employee',      // default: 'employee'
  isVerified:        Boolean (default: false),
  verificationToken: String,                    // cleared after verification
  googleId:          String                     // for Google OAuth users
}
```

### Employee
```javascript
{
  name:       String (required),
  role:       String (required),      // job title, e.g. "Senior Engineer"
  department: String (required),      // e.g. "Engineering", "Design"
  email:      String (required, unique),
  avatar:     String,
  joinDate:   Date (default: now),
  status:     'Active' | 'On Leave'   // auto-updated when leave is approved
}
```

### Attendance
```javascript
{
  employeeId:  ObjectId → Employee (required),
  date:        String (required),     // format: "YYYY-MM-DD"
  checkIn:     Date,
  checkOut:    Date,
  hoursWorked: Number (default: 0),   // auto-calculated on checkout
  status:      'Present' | 'Absent' | 'Late'
}
```

### LeaveRequest
```javascript
{
  employeeId: ObjectId → Employee (required),
  type:       'Sick' | 'Casual' | 'Annual' | 'Other',
  from:       Date (required),
  to:         Date (required),
  reason:     String (required),
  status:     'Pending' | 'Approved' | 'Rejected'
}
```

---

## 🎨 Design System

OneClick uses a custom **Forest & Amber** design system — no CSS frameworks, no Tailwind, all hand-crafted vanilla CSS in `index.css`.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--forest` | `#1B4332` | Primary brand, sidebar, headings |
| `--forest-mid` | `#2D6A4F` | Secondary green, hover states |
| `--amber` | `#D97706` | Primary CTAs, accent, active states |
| `--amber-pale` | `#FEF3C7` | Warning backgrounds |
| `--cream` | `#FFFBF5` | App background |
| `--surface` | `#FFFFFF` | Card surfaces |
| `--charcoal` | `#1C1917` | Headless text |
| `--stone-*` | `#F5F5F4` → `#44403C` | Neutral scale |

### Typography

- **Font:** Inter (Google Fonts)
- **Hierarchy:**
  - `page-title`: 1.45rem / 800 weight
  - `page-subtitle`: 0.82rem / muted
  - Body: 0.9rem / 400 weight
  - Labels: 0.75rem / uppercase / 0.06em tracking

### Component Classes

| Class | Purpose |
|-------|---------|
| `.card` | Surface card with shadow + border + hover lift |
| `.btn .btn-primary` | Amber CTA button with warm shadow |
| `.btn .btn-secondary` | Ghost/outline button |
| `.input` | Rectangular input with forest-green focus ring |
| `.badge .badge-success` | Status pill (green, red, amber, purple) |
| `.modal-backdrop` / `.modal-box` | Centered modal with backdrop blur |
| `.progress-track` / `.progress-fill` | Animated progress bars |
| `.sidebar` / `.sidebar-link` | Fixed sidebar navigation |

### Layout Pattern

The app uses a **Spacer Pattern** for the fixed sidebar layout:

```
┌──────────────────────────────────────────┐
│  <Sidebar />      (position: fixed)      │
│  <Spacer />       (width: 228px)         │
│  <Content />      (flex: 1, minWidth: 0) │
│    <Header />     (position: sticky)     │
│    <main />       (flex: 1, padding)     │
└──────────────────────────────────────────┘
```

---

## 🔒 Role-Based Access

| Email | Role | Dashboard | Access |
|-------|------|-----------|--------|
| `pratik792584@gmail.com` | `admin` | `/` | Full HR dashboard — all employees, all leaves, approve/reject, analytics, team CRUD |
| Any other email | `employee` | `/emp` | Personal portal — own attendance, own leaves, own profile |

### How it works:

1. **On registration**, the server checks the email:
   - If `pratik792584@gmail.com` → role is set to `admin`
   - All other emails → role is `employee`
2. **On login**, the JWT token + role is stored in `localStorage`
3. **On the client**, `AdminRoute` and `EmployeeRoute` guards check `user.role`:
   - Admin trying to visit `/emp` → redirected to `/`
   - Employee trying to visit `/` → redirected to `/emp`

### Employee ↔ User Linking

The `User` model (auth) and `Employee` model (HR data) are linked by **email address**:

1. User signs up with `alice@company.com`
2. Admin adds an employee with email `alice@company.com` via Team Directory
3. The system automatically links them — Alice can now check in, view her attendance, apply for leave

If no employee profile exists with the user's email, the employee portal shows a clear warning message.

---

## 🖼 Screenshots

### Login Page
> Split-screen design with forest green branding panel and cream-white login form with Google OAuth.

### Admin Overview
> 4-column KPI grid, real-time session tracker, weekly attendance grid, department health progress bars, recent leave requests feed.

### Employee Portal
> Personalized welcome banner, session tracker with Late detection, this-week breakdown, leave request cards.

### Verification Email
> Forest green header bar, amber accent stripe, personalized greeting, amber gradient CTA button, expiration warning, fallback link.

---

## 🔧 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| **`SSL alert number 80`** on MongoDB connection | Whitelist your IP in MongoDB Atlas → Network Access. Use `0.0.0.0/0` for dev. |
| **Verification email not sending** | Ensure `GMAIL_PASS` is a Google **App Password** (16 chars, spaces included). 2FA must be enabled on the Gmail account. |
| **Google Sign-In fails** | Add `http://localhost:5173` to **Authorized JavaScript Origins** in Google Cloud Console. |
| **Employee can't check in** | Admin must first add an employee in Team Directory with the **same email** as the user's signup email. |
| **"Not authorized" on API calls** | JWT may have expired (30d). Clear localStorage and log in again. |
| **Pages show empty space on the right** | Hard refresh (`Ctrl+Shift+R`). The layout uses a spacer pattern that requires the latest CSS. |
| **Sessions always marked "Late"** | Check-in after 09:30 AM server time is auto-marked Late. This is intentional behavior. |

### Resetting a User's Role

If you need to change a user's role directly in MongoDB:

```javascript
// In MongoDB Atlas → Collections → users
db.users.updateOne(
  { email: "user@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

### Code Conventions

- **React:** Functional components with hooks. Context for global state.
- **CSS:** Vanilla CSS with CSS custom properties. No utility frameworks.
- **API:** RESTful routes. Controllers handle business logic. Mongoose for data access.
- **Auth:** JWT in `Authorization: Bearer <token>` header. Middleware validates on every protected route.

---

## 📄 License

This project is licensed under the **ISC License**.

---

**Built with ❤️ by Pratik Kumar** · OneClick. HR Intelligence Platform
