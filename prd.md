# Product Requirements Document (PRD)

**Product Name:** OneClick — HR Management System
**Version:** 1.0.0
**Date:** 2026-04-15
**Status:** In Development

---

## 1. Product Overview

**OneClick** is a clean, modern, and fully integrated HR Management System designed to simplify how organizations manage their people. The platform provides HR managers and employees with a single, unified workspace to handle day-to-day operations — from clocking in to tracking leaves — all in one click.

The system is built as a full-stack web application using **React** on the frontend and **Node.js + Express** on the backend, with **MongoDB** as the cloud database.

---

## 2. Goals & Objectives

- Provide a frictionless login/signup experience with email verification.
- Give HR managers real-time visibility into employee attendance and working hours.
- Enable employees to apply for leaves and track their status.
- Visualize overall workforce analytics through graphs and summary cards.
- Build a scalable, secure, and maintainable MERN-stack architecture.

---

## 3. Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js (Vite)                     |
| Routing     | React Router v6                     |
| Backend     | Node.js + Express.js                |
| Database    | MongoDB (Atlas Cloud via Mongoose)  |
| Auth        | JWT + Bcrypt + Nodemailer (Email Verify) |
| Google SSO  | @react-oauth/google                 |
| Dev Server  | Vite (port 5173) + Nodemon (port 5000) |
| Environment | `.env` file for secrets             |

---

## 4. Core Pages & Features

### 4.1 Authentication (Login & Signup)

**Design:** UI will be provided by the developer as a **JSON Design System** and implemented precisely.

**Login Page:**
- Email and password fields
- "Sign in with Google" button (OAuth 2.0)
- Link to the Signup page
- Error messaging for invalid credentials

**Signup Page:**
- Name, email, and password fields
- "Sign up with Google" button
- On submit: account is created, a **verification link** is emailed via Nodemailer + Gmail SMTP
- User sees a "Check your email" confirmation screen

**Email Verification:**
- Clicking the link in the email takes the user to `/verify?token=...`
- Backend validates the token in MongoDB and sets `isVerified = true`
- User is redirected to login

**Security Rules:**
- Passwords hashed with `bcryptjs` before saving
- JWT issued on successful login and stored in `localStorage`
- Unverified users cannot log in

---

### 4.2 HR Dashboard (Post-Login Interface)

The main workspace of the application. Composed of a **persistent top header**, a **left sidebar**, and a **dynamic main content area**.

---

#### 4.2.1 Header Bar
- **OneClick.** branding logo + tagline
- Live clock (real-time, updates every second)
- Current logged-in user avatar + name + role
- Logout button

---

#### 4.2.2 Left Sidebar Navigation
Five main sections:

| Icon | Section       | Description                              |
|------|---------------|------------------------------------------|
| ▦    | Overview      | Dashboard KPIs and summary               |
| ⏱    | Attendance    | Employee-wise attendance records         |
| 👥   | Team Directory | Full employee list and profile details  |
| 📅   | Leave Hub     | Apply and manage leaves                  |
| 📊   | Analytics     | Graphs and organization-wide reporting   |

- Active tab is highlighted in **solid black** with white text
- Pending leave badge counter on the "Leave Hub" tab

---

#### 4.2.3 Overview Tab (Dashboard Home)
- **Welcome header** with the logged-in admin's name
- **Session Tracker Card:**
  - "Start Session" / "Stop Session" toggle button
  - Displays check-in time once clicked
  - Live counter showing hours and minutes worked (updates in real time)
- **KPI Stat Cards (4 cards):**
  - Total Team Members
  - Active Employees (currently checked in)
  - Employees on Leave
  - Pending Leave Approvals
- **Weekly Overview panel:** Shows each day of the week with attendance status (Present / Absent / Late / Weekend)
- **Team Distribution panel:** Progress bars visualizing department-wise attendance health scores

---

#### 4.2.4 Attendance Tab
- Table listing all employees with columns:
  - Employee Name + Department
  - Present / Absent / Late day counts
  - Total Tracked Hours
- Expandable rows for day-by-day breakdown per employee
- Export Dataset button

---

#### 4.2.5 Team Directory Tab
- Full searchable employee directory
- Each row displays:
  - Avatar with color-coded initials
  - Employee Name, Role, Department
  - Status badge (Active / On Leave)
  - Join date
- Add New Employee button (modal form)
- Delete / Edit employee actions

---

#### 4.2.6 Leave Hub Tab
- Table of all submitted leave requests with:
  - Employee name
  - Leave type (Sick / Casual / Annual / Other)
  - From / To date range
  - Status badge (Pending / Approved / Rejected)
- "Apply for Leave" button opens a modal:
  - Leave Type selector
  - From Date / To Date date pickers
  - Reason text area
  - Submit / Cancel actions
- Admin can Approve or Reject pending requests

---

#### 4.2.7 Analytics Tab
- **Attendance Rate Graph** — Bar or line chart for monthly trends
- **Leave Distribution Pie Chart** — Breakdown by leave type
- **Department Activity Heatmap** — Comparative team performance grid
- Summary stats: Average work hours, attendance %, leave utilization

---

## 5. Data Models (MongoDB)

### User
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "role": "admin | employee",
  "isVerified": "boolean",
  "verificationToken": "string",
  "createdAt": "Date"
}
```

### Employee
```json
{
  "_id": "ObjectId",
  "name": "string",
  "role": "string",
  "department": "string",
  "email": "string",
  "avatar": "string",
  "joinDate": "Date",
  "status": "Active | On Leave"
}
```

### Attendance
```json
{
  "_id": "ObjectId",
  "employeeId": "ObjectId (ref: Employee)",
  "date": "Date",
  "checkIn": "Date",
  "checkOut": "Date",
  "hoursWorked": "number",
  "status": "Present | Absent | Late"
}
```

### Leave Request
```json
{
  "_id": "ObjectId",
  "employeeId": "ObjectId (ref: Employee)",
  "type": "Sick | Casual | Annual | Other",
  "from": "Date",
  "to": "Date",
  "reason": "string",
  "status": "Pending | Approved | Rejected",
  "createdAt": "Date"
}
```

---

## 6. Backend API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/register`           | Create new user, send verify email |
| GET    | `/verify/:token`      | Verify email via token             |
| POST   | `/login`              | Authenticate and return JWT        |

### Employee Routes (`/api/employees`)
| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/`                   | Get all employees                  |
| POST   | `/`                   | Add a new employee                 |
| PUT    | `/:id`                | Update employee details            |
| DELETE | `/:id`                | Remove an employee                 |

### Attendance Routes (`/api/attendance`)
| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/`                   | Get all attendance records         |
| POST   | `/checkin`            | Log a check-in event               |
| POST   | `/checkout`           | Log a check-out event              |

### Leave Routes (`/api/leaves`)
| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/`                   | Get all leave requests             |
| POST   | `/`                   | Submit a new leave request         |
| PUT    | `/:id/status`         | Approve or Reject a leave request  |

---

## 7. Design System (to be implemented from JSON)

The UI design will be provided by the developer as a JSON file. Key tokens to be strictly followed:

```json
{
  "fontFamily": "Inter, sans-serif",
  "primary": "#000000",
  "background": "#F5F6F8",
  "surface": "#FFFFFF",
  "border": "#E5E7EB",
  "muted": "#6B7280",
  "accent": "#111827",
  "borderRadius": "8px",
  "inputHeight": "44px",
  "buttonHeight": "44px"
}
```

---

## 8. Future Scope (v2.0)

- Role-based access (Admin vs. Employee self-service portal)
- Mobile-responsive layout / PWA support
- Payroll summary reports (salary slips, deductions)
- Calendar view for leave and attendance
- Real-time notifications (WebSockets)
- Dark mode toggle
