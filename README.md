<div align="center">

<br/>

# NEXORA
### Operations OS — Enterprise ERP & CRM Platform

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://nexora-git-main-prajwalpatil23052743-8679s-projects.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://nexora-backend-1pl2.onrender.com)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E699?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

> **Nexora** is a full-stack, role-based Enterprise ERP and CRM platform built for real operational teams. Manage customers, inventory, sales challans, and warehouse operations — all from one connected workspace.

<br/>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [User Roles & Permissions](#-user-roles--permissions)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Security](#-security)

---

## 🚀 Overview

Nexora is a production-quality internal operations platform inspired by real enterprise ERP software. It was designed to replace fragmented spreadsheets and tools used by distribution, wholesale, and operations teams.

The system provides:

- A **CRM** for managing B2B customers and sales pipelines
- An **Inventory Engine** with real-time stock tracking
- A **Challan Workflow** (DRAFT → CONFIRMED) with atomic stock deduction
- **Role-Based Dashboards** tailored to Admin, Sales, Warehouse, and Accounts teams
- A **Global Search** that queries real database records across all entities

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend (Vercel)** | https://nexora-git-main-prajwalpatil23052743-8679s-projects.vercel.app |
| **Backend API (Render)** | https://nexora-backend-1pl2.onrender.com/api |
| **GitHub Repository** | https://github.com/PRAJWAL-MAX-GLITCH/NEXORA |

> ⚠️ The backend runs on Render's free tier. The first request after inactivity may take **15–30 seconds** to cold start.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with `Bearer` token
- Passwords hashed with `bcrypt` (salt rounds: 10)
- Protected API routes with server-side role validation
- Automatic token expiry and redirect to login on 401
- Role-based frontend route guards

### 👥 Customer CRM
- Create, edit, and manage B2B customers
- Three customer types: **Retail**, **Wholesale**, **Distributor**
- Status lifecycle: **Lead → Active → Inactive**
- Follow-up date scheduling with overdue detection
- Business name, address, GST number, notes
- Full-text search across name, mobile, email, and business name

### 📦 Inventory Management
- Product catalogue with SKU, category, unit price
- Real-time stock tracking (`currentStock` / `minimumStock`)
- Warehouse location mapping (A-01, B-02, etc.)
- Stock IN / Stock OUT movements with reason codes
- Low-stock and out-of-stock alerts on the warehouse dashboard
- Complete movement history with timestamps

### 📄 Sales Challans (Dispatch Orders)
- Customer-linked dispatch documents
- Multi-product line items per challan
- Auto-generated challan numbers (`CH-2026-XXXXX`)
- **DRAFT → CONFIRMED** transactional workflow
- Stock availability check before confirmation
- Atomic stock deduction on confirmation (Prisma transaction)
- Product name, SKU, and price **snapshots** at time of creation
- Prevents confirmation if any item has insufficient stock
- Cancelled challans do NOT affect stock

### 🔍 Global Search
- `Ctrl+K` or click search bar to open
- Real-time search across **customers**, **products**, and **challans**
- 280ms debounce for performance
- Role-aware results (only shows entities the user can access)
- Keyboard navigation: `↑↓` to move, `Enter` to open, `Esc` to close
- Status badges on every result (Active/Lead, stock level, CONFIRMED/DRAFT)
- Quick navigation links when search is empty

### 📊 Role-Specific Dashboards
Each role sees a dashboard tailored to their responsibilities — no clutter, no confusion.

| Dashboard | Shows |
|---|---|
| **Admin** | Total customers, products, challans, stock health overview, recent activity |
| **Sales** | Active customers, leads, overdue follow-ups, open challans, recent sales |
| **Warehouse** | Total stock units, low stock count, out-of-stock alerts, recent movements |
| **Accounts** | Total challans by status, recent challan ledger with customer names |

### 🔔 Notification Panel
- Bell icon in the top bar with unread badge
- Click to open notification dropdown
- Mark all as read functionality
- Smooth hover and transition effects

### ⏰ Dynamic Greeting
- Dashboard greeting changes based on time of day
- Good Morning / Good Afternoon / Good Evening

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | UI framework and dev server |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Icons** | Lucide React | Consistent icon set |
| **HTTP Client** | Axios | API communication |
| **Routing** | React Router v6 | Client-side navigation |
| **Backend** | Node.js + TypeScript | Server runtime |
| **API Framework** | Express.js | REST API routing |
| **ORM** | Prisma 5 | Type-safe database access |
| **Database** | PostgreSQL (Neon) | Primary data store |
| **Auth** | JWT + bcrypt | Stateless authentication |
| **Validation** | Zod | Input schema validation |
| **Frontend Deploy** | Vercel | CDN + CI/CD |
| **Backend Deploy** | Render | Managed Node.js server |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│            Browser (Vercel CDN)             │
│                                             │
│   React 18 + Vite + Tailwind CSS            │
│   ├── Role-Based Dashboards                 │
│   ├── Customer CRM Module                  │
│   ├── Inventory Module                     │
│   ├── Challan Module                       │
│   └── Global Search (Ctrl+K)               │
└────────────────────┬────────────────────────┘
                     │ HTTPS REST API
                     │ Authorization: Bearer <JWT>
┌────────────────────▼────────────────────────┐
│         Express.js API (Render)             │
│                                             │
│   ├── /api/auth      — Login / Me           │
│   ├── /api/customers — CRM CRUD            │
│   ├── /api/products  — Catalogue CRUD      │
│   ├── /api/inventory — Stock IN / OUT      │
│   └── /api/challans  — Challan Workflow    │
│                                             │
│   Middleware:                               │
│   ├── authenticate() — JWT verification    │
│   └── authorize()    — Role enforcement    │
└────────────────────┬────────────────────────┘
                     │ Prisma ORM
┌────────────────────▼────────────────────────┐
│         Neon PostgreSQL (Cloud)             │
│                                             │
│   Tables: User, Customer, Product,          │
│           StockMovement, Challan,           │
│           ChallanItem                       │
└─────────────────────────────────────────────┘
```

---

## 🗄 Database Schema

```
User
 ├── id, name, email, password (hashed), role
 └── roles: ADMIN | SALES | WAREHOUSE | ACCOUNTS

Customer
 ├── id, name, mobile, email, businessName
 ├── gstNumber, address, notes, followUpDate
 ├── customerType: RETAIL | WHOLESALE | DISTRIBUTOR
 ├── status: LEAD | ACTIVE | INACTIVE
 └── → has many Challans

Product
 ├── id, name, sku (unique), category
 ├── unitPrice, currentStock, minimumStock
 ├── warehouseLocation
 ├── → has many StockMovements
 └── → has many ChallanItems

StockMovement
 ├── id, productId → Product
 ├── quantity, type: IN | OUT
 ├── reason, createdBy (userId), createdAt
 └── (created automatically on challan CONFIRM)

Challan
 ├── id, challanNumber (unique, auto-gen)
 ├── customerId → Customer
 ├── totalQuantity, status: DRAFT | CONFIRMED | CANCELLED
 ├── createdBy (userId), createdAt
 └── → has many ChallanItems

ChallanItem
 ├── id, challanId → Challan
 ├── productId → Product
 ├── productNameSnapshot, skuSnapshot, unitPriceSnapshot
 └── quantity
```

---

## 👤 User Roles & Permissions

All permissions are enforced on the **server side** — the frontend reflects them but does not control them.

| Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|:---:|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Customers | ✅ | ✅ | ✅ | ✅ |
| Create / Edit Customers | ✅ | ✅ | ❌ | ❌ |
| Delete Customers | ✅ | ❌ | ❌ | ❌ |
| View Products | ✅ | ✅ | ✅ | ✅ |
| Create / Edit Products | ✅ | ❌ | ✅ | ❌ |
| Delete Products | ✅ | ❌ | ❌ | ❌ |
| Stock IN / OUT | ✅ | ❌ | ✅ | ❌ |
| View Challans | ✅ | ✅ | ✅ | ✅ |
| Create Challans | ✅ | ✅ | ❌ | ❌ |
| Confirm Challans | ✅ | ❌ | ✅ | ❌ |
| Cancel Challans | ✅ | ❌ | ❌ | ❌ |

---

## 🔑 Demo Credentials

Use these to log in and explore the system with different role perspectives:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@erp.com` | `password123` |
| **Sales Manager** | `sales@erp.com` | `password123` |
| **Warehouse** | `warehouse@erp.com` | `password123` |
| **Accounts** | `accounts@erp.com` | `password123` |

> The demo database contains **20 customers**, **22 products**, **19 challans**, and **56 stock movements** — enough data to make every dashboard meaningful.

---

## 📁 Project Structure

```
nexora/
│
├── frontend/                    # React + Vite application
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── CommandPalette.jsx   # Global search (Ctrl+K)
│       │   ├── Badge.jsx
│       │   └── ...
│       ├── context/
│       │   ├── AuthContext.jsx      # JWT auth state
│       │   └── ToastContext.jsx
│       ├── layouts/
│       │   ├── AdminLayout.jsx      # Protected layout wrapper
│       │   ├── Sidebar.jsx
│       │   └── TopBar.jsx           # Search bar + notifications
│       ├── pages/
│       │   ├── LoginPage.jsx        # Premium split-screen login
│       │   ├── dashboard/           # Role-specific dashboards
│       │   ├── customers/           # CRM pages
│       │   ├── products/            # Product catalogue
│       │   ├── inventory/           # Stock movements
│       │   └── challans/            # Challan workflow
│       ├── services/
│       │   └── api.js               # Axios instance + interceptors
│       └── utils/
│           └── helpers.js           # Time-based greeting, formatters
│
├── backend/                     # Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── seed.ts                  # Realistic demo dataset
│   │   └── migrations/
│   └── src/
│       ├── config/
│       │   └── db.ts                # Prisma client singleton
│       ├── middleware/
│       │   └── auth.middleware.ts   # JWT verify + role guard
│       ├── modules/
│       │   ├── auth/                # Login, JWT generation
│       │   ├── customers/           # CRM CRUD + search
│       │   ├── products/            # Product CRUD + search
│       │   ├── inventory/           # Stock IN/OUT + movements
│       │   └── challans/            # Challan workflow + confirm
│       ├── utils/
│       │   └── asyncHandler.ts
│       └── server.ts                # Express app entry point
│
└── README.md
```

---

## 💻 Local Development

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A PostgreSQL database (local or [Neon](https://neon.tech) cloud)

### 1. Clone the Repository

```bash
git clone https://github.com/PRAJWAL-MAX-GLITCH/NEXORA.git
cd NEXORA/mini-erp-crm
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your-strong-random-secret"
PORT=5000
```

Run Prisma setup:

```bash
npx prisma generate
npx prisma db push        # For local dev only
npx prisma db seed        # Load realistic demo data
```

Start the backend:

```bash
npm run dev
```

Backend will run at `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

### 4. Open in Browser

Navigate to `http://localhost:5173` and log in with any of the demo credentials above.

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | Pooled PostgreSQL connection string |
| `DIRECT_URL` | ✅ | Direct PostgreSQL connection (for migrations) |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `PORT` | ❌ | API server port (default: `5000`) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|:---:|---|
| `VITE_API_URL` | ✅ | Backend API base URL |

> **Production note:** Set `VITE_API_URL=https://nexora-backend-1pl2.onrender.com/api` in your Vercel project's environment variables.

---

## 🚢 Deployment

### Frontend → Vercel

1. Connect the GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL = https://nexora-backend-1pl2.onrender.com/api
   ```
4. Vercel auto-detects Vite and builds with `npm run build`

### Backend → Render

1. Create a new **Web Service** on Render
2. Set **Root Directory** to `backend`
3. **Build Command:** `npm install && npx prisma generate && npm run build`
4. **Start Command:** `node dist/server.js`
5. Add environment variables: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`

### Database → Neon PostgreSQL

1. Create a project on [neon.tech](https://neon.tech)
2. Copy the **pooled** connection string → `DATABASE_URL`
3. Copy the **direct** connection string → `DIRECT_URL`
4. Run migrations: `npx prisma migrate deploy`
5. Seed the database: `npx prisma db seed`

> ⚠️ **Never run** `prisma migrate reset` on a production database. It will drop all tables.

---

## 📡 API Reference

All endpoints require `Authorization: Bearer <token>` except `/api/auth/login`.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile |

### Customers

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/customers` | All roles | List + search customers |
| `GET` | `/api/customers/:id` | All roles | Get single customer |
| `POST` | `/api/customers` | Admin, Sales | Create customer |
| `PUT` | `/api/customers/:id` | Admin, Sales | Update customer |
| `DELETE` | `/api/customers/:id` | Admin | Delete customer |

**Search params:** `?search=name&status=ACTIVE&customerType=WHOLESALE&page=1&limit=20`

### Products

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | All roles | List + search products |
| `GET` | `/api/products/:id` | All roles | Get single product |
| `POST` | `/api/products` | Admin, Warehouse | Create product |
| `PUT` | `/api/products/:id` | Admin, Warehouse | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |

**Search params:** `?search=sku_or_name&category=Storage&page=1&limit=20`

### Inventory

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/inventory/in` | Admin, Warehouse | Record stock IN |
| `POST` | `/api/inventory/out` | Admin, Warehouse | Record stock OUT |
| `GET` | `/api/inventory/movements` | All roles | List stock movements |
| `GET` | `/api/inventory/low-stock` | All roles | Products below minimum stock |

### Challans

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/challans` | All roles | List + search challans |
| `GET` | `/api/challans/:id` | All roles | Get challan with items |
| `POST` | `/api/challans` | Admin, Sales | Create draft challan |
| `PUT` | `/api/challans/:id` | Admin, Sales | Update draft challan |
| `PATCH` | `/api/challans/:id/confirm` | Admin, Warehouse | Confirm challan (deducts stock) |
| `PATCH` | `/api/challans/:id/cancel` | Admin | Cancel challan |

**Search params:** `?search=CH-2026&status=CONFIRMED&customerId=uuid&page=1&limit=20`

---

## 🔒 Security

- **Passwords** are never stored in plaintext — bcrypt with 10 salt rounds
- **JWT tokens** are verified on every protected request server-side
- **Role checks** happen in `auth.middleware.ts` before any controller runs
- **`.env` files** are in `.gitignore` and never committed
- **Zod validation** rejects malformed request bodies before they reach the database
- **CORS** is configured to allow only trusted origins
- **Helmet.js** sets secure HTTP headers on all responses

---

## 🧪 Seed Data Summary

The `prisma/seed.ts` script loads a production-quality demo dataset:

| Entity | Count | Details |
|---|---|---|
| Users | 7 | Across all 4 roles |
| Customers | 20 | 11 Active, 6 Leads, 3 Inactive — realistic Indian B2B names |
| Products | 22 | 8 categories, realistic SKUs and prices |
| Stock Movements | 56 | Audits, deliveries, adjustments, and challan OUTs |
| Challans | 19 | 12 Confirmed, 4 Draft, 3 Cancelled |
| Low Stock Products | 5 | `currentStock ≤ minimumStock` |
| Out-of-Stock Products | 2 | `currentStock = 0` |
| Follow-up Dates | 11 | Overdue, today, and upcoming |

> All stock math is verified: `currentStock = totalIN − totalOUT` for every product.

To reset the demo data:
```bash
cd backend
npx prisma db seed
```

---

## 🗺 Roadmap

- [ ] Invoice generation with PDF export
- [ ] Advanced reporting and analytics charts
- [ ] Email notifications for follow-ups and low stock
- [ ] Docker Compose setup for local development
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Pagination improvements and infinite scroll
- [ ] GST-compliant tax invoice module
- [ ] Multi-warehouse support

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Built with ❤️ by [Prajwal Patil](https://github.com/PRAJWAL-MAX-GLITCH)**

*Nexora — One workspace. Every operation.*

</div>
