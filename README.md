# MINI ERP + CRM

MINI ERP + CRM is a full-stack operations management platform for managing customers, products, inventory and sales challans through role-based access.

## Overview

The application centralizes core business workflows:
- Customer CRM (leads, active customers, follow-ups)
- Inventory management (stock IN/OUT, movement history)
- Sales Challans (order drafting, confirmation, stock validation)
- Operational workflows tailored to specific employee roles

## Key Features

### Authentication & Authorization
- JWT authentication
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Protected API routes and frontend views
- Role-specific dashboard redirection

### Customer CRM
- Customer creation and editing
- Customer search and filtering
- Follow-up dates and notes
- Categorization (Retail, Wholesale, Distributor)
- Status tracking (Lead, Active, Inactive)

### Inventory
- Product catalog with SKU, Category, and Unit Price
- Current stock and minimum stock tracking
- Warehouse/Location fields
- Stock IN / Stock OUT movements
- Movement history tracking

### Sales Challans
- Customer selection and multiple product items
- Automatic challan numbering
- Draft status and confirmation workflow
- Stock validation (prevents negative stock)
- Stock deduction upon confirmation (transactional workflow)
- Snapshotting of product names and prices at the time of challan creation

## User Roles

Permissions are enforced server-side through role-based authorization.

| Role | Responsibility |
|------|----------------|
| ADMIN | System-wide administration, full access |
| SALES | Customer CRM and sales challans (create/view) |
| WAREHOUSE | Product inventory, stock movements, and challan fulfillment |
| ACCOUNTS | Operational/challan record review (view-only access to operations) |

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React + JavaScript + Vite |
| Backend | Node.js + TypeScript |
| API | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcrypt |
| Styling | Tailwind CSS |

## Architecture

```text
Browser
   |
   v
React Frontend
   |
   | REST API
   v
Express + TypeScript Backend
   |
   +---- Authentication / RBAC
   |
   +---- CRM
   |
   +---- Inventory
   |
   +---- Challans
   |
   v
Prisma ORM
   |
   v
PostgreSQL
```

## Project Structure

```
mini-erp-crm/
+-- frontend/
¦   +-- src/
¦   +-- public/
¦   +-- package.json
¦   +-- vite.config.js
¦   +-- ...
¦
+-- backend/
¦   +-- src/
¦   +-- prisma/
¦   +-- package.json
¦   +-- tsconfig.json
¦   +-- ...
¦
+-- README.md
+-- .gitignore
+-- ...
```

## Database Design

- **User**: Stores authenticated accounts and roles.
- **Customer**: CRM entity with status, follow-up dates, and contact details. Has many Challans.
- **Product**: Inventory entity with current stock, min stock, and pricing. References StockMovements.
- **StockMovement**: Records every inventory increment/decrement with a reason and timestamp.
- **Challan**: The core sales document connecting a Customer to Products. Follows DRAFT -> CONFIRMED workflow.
- **ChallanItem**: Individual line items on a Challan, storing quantity and a snapshot of the product price/name at the time of creation.

## Authentication Flow

Email + Password -> Backend validation -> Password verification (bcrypt) -> JWT generation -> Authenticated requests (Bearer token) -> JWT verification -> Role authorization -> Protected resource access.

## Local Development Setup

Prerequisites:
- Node.js (v18+)
- PostgreSQL
- npm

### 1. Clone repository
```bash
git clone https://github.com/PRAJWAL-MAX-GLITCH/NEXORA.git
cd NEXORA
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file based on `.env.example`:
```
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/minierp?schema=public"
JWT_SECRET="your_jwt_secret"
NODE_ENV="development"
```
Initialize the database and seed demo data:
```bash
npx prisma db push
npm run seed
```
Start the backend dev server:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

## Assumptions
- JWT authentication is used for application access and tokens are stored in `localStorage`.
- Challans are operational dispatch documents rather than financial invoices.
- Stock is maintained as a current quantity per product, globally across the system.
- Seeded demo users exist for evaluation purposes.

## Known Limitations
- No advanced accounting or tax invoicing module.
- No CI/CD pipelines currently configured.
- No Docker containerization yet.
- Image storage for products is not supported.

## Security Notes
- Secrets are strictly read from environment variables; `.env` is ignored by Git.
- Passwords are unconditionally hashed via `bcrypt` before storage.
- Authorization relies on server-side stateless JWT decoding.

## Manual Verification Checklist
- Login as ADMIN, SALES, WAREHOUSE, ACCOUNTS
- Create and edit a customer
- Create a product
- Adjust stock IN and OUT
- Create a Sales Challan (DRAFT)
- Confirm a Challan and verify stock deduction
- Attempt to confirm a Challan with insufficient stock (should fail)
- Verify Dashboard layout differences between roles

