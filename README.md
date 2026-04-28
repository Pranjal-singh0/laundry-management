# Laundry Management System

A full-stack laundry management application with:
- **Backend:** Node.js, Express, MongoDB, JWT, HTTP-only cookies
- **Frontend:** React (Vite), JavaScript, React Router

This project supports customer and admin/staff workflows for managing laundry orders and payment/status updates.

---

## Setup Instructions

### 1) Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Git

### 2) Clone and install
```bash
git clone <your-repo-url>
cd laundry-management
npm install
cd frontend
npm install
```

### 3) Environment configuration

Create backend `.env` in project root:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/laundry_management
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
ADMIN_SETUP_KEY=replace_with_admin_setup_key
```

Create frontend `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

---

## How to run the project

### Backend
From project root:
```bash
npm run dev
```
Backend runs at: `http://localhost:5000`

### Frontend
From `frontend` folder:
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173` (or `http://127.0.0.1:5173`)

---

## Features Implemented

## Authentication
- Register and login with hashed passwords (`bcryptjs`)
- JWT auth stored in secure HTTP-only cookie
- Logout support
- Current user API (`/api/auth/me`)
- Role model: `customer`, `staff`, `admin`
- Admin/staff creation protected by `ADMIN_SETUP_KEY`

## Order Management
- Create order with items, dates, address, notes
- Auto-calculated `totalAmount`
- View all own orders (customer)
- View all orders (admin/staff)
- View single order details
- Delete order (owner/admin/staff)
- Update order `status` + `paymentStatus` (admin/staff only)

## Frontend UI
- Professional simple layout and card-based pages
- Login / register pages
- Dashboard page (summary + recent orders)
- Customer orders page (create + list + delete)
- Order details page
- Admin orders page (status/payment update controls)
- Protected routes and admin-only route guards

## Testing / Verification
- Backend API test scripts:
  - `npm run test-api`
  - `npm run test-orders`
- Frontend quality checks:
  - `npm run lint`
  - `npm run build`

---

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `DELETE /api/orders/:id`

---

## AI Usage Report

AI tools were used as development assistants for **planning**, **debugging**, and **code iteration support**, while implementation decisions and final fixes were validated in-project.

### Tools used
- ChatGPT-style assistant in IDE for:
  - backend/frontend planning breakdown
  - route and data-flow reviews
  - debugging hypotheses and fix suggestions

### Prompt style used (high-level, not exact prompts)
- **Planning prompts**
  - "Design a minimal full-stack structure for auth + role-based order management."
  - "Suggest a simple professional React page flow for customer and admin users."
- **Debugging prompts**
  - "Login/register returns `Failed to fetch` from browser. Help isolate CORS/cookie issues."
  - "Protected routes return `Unauthorized: token missing` after login; identify cookie handling mismatch."
  - "Order form input loses typed text after one character; find React state/key issue."

### What AI got wrong/incomplete
- Initial CORS setup assumed a single frontend origin and missed `localhost` vs `127.0.0.1` mismatch.
- Order item input keys were unstable, causing remount behavior and text reset while typing.
- Numeric input UX initially forced `0` values, making manual entry awkward.

### What was improved after AI suggestions
- CORS was updated to correctly allow both local dev origins.
- Frontend API host handling was aligned with current browser hostname to preserve cookie flow.
- Order form state logic was corrected with stable row IDs and better number-input behavior.
- UI was polished with cleaner backgrounds and improved form focus styling.

### API error examples and resolutions
- **Error:** `Failed to fetch.`  
  **Cause:** CORS/host mismatch (`localhost` vs `127.0.0.1`)  
  **Resolution:** Allow both origins in backend CORS and align the frontend API host.

- **Error:** `Unauthorized: token missing.`  
  **Cause:** Auth cookie not sent due to cross-host mismatch  
  **Resolution:** Use matching frontend/backend host pairing and `credentials: include`.

- **Error:** `Invalid order id`  
  **Cause:** Non-ObjectId passed in route param  
  **Resolution:** Use `_id` from `GET /api/orders` response.

- **Error:** JSON parse syntax error while creating order  
  **Cause:** Invalid request body JSON formatting  
  **Resolution:** Validate raw JSON body and remove trailing commas.

---

## Tradeoffs

### What was skipped
- Password reset / email verification
- Refresh-token rotation and token revocation strategy
- Advanced validation library integration
- Full audit logging and activity history
- Deployment pipeline and production hardening docs
- Automated frontend E2E tests

### What to improve with more time
- Add comprehensive form validation and inline field-level error messages
- Add pagination/filtering/sorting for orders
- Add admin analytics dashboard (counts, revenue trends, SLA metrics)
- Add stronger security controls (rate limits, helmet config, stricter cookie policies per env)
- Add Docker setup and CI workflows for build/test automation
- Expand test coverage (unit + integration + browser E2E)

---

## Quick Start Commands

From root:
```bash
npm install
npm run dev
```

From `frontend`:
```bash
npm install
npm run dev
```

Then open:
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

