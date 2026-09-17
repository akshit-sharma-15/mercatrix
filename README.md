# Mercatrix - Multi-Vendor E-Commerce Platform

Mercatrix is a full-stack, multi-vendor e-commerce platform designed to support customers, vendors, and super admins. It features a modern tech stack, real-time analytics, and automated split payments.

## 🏗️ Project Architecture & Tech Stack

The workspace is structured into two main applications and a documentation directory.

### 1. Frontend (`mercatrix-web/`)
A highly responsive and interactive web application.
- **Framework**: Next.js (React 19, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion, `shadcn/ui` components
- **State Management & Data Fetching**: Zustand, React Query (@tanstack/react-query)
- **Forms & Validation**: React Hook Form, Zod

### 2. Backend API (`mercatrix-api/`)
A robust RESTful API built to handle multi-vendor business logic, payments, and concurrent transactions.
- **Framework**: Node.js with Express.js
- **Language**: TypeScript (running via `tsx`)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens) & bcrypt
- **Payments**: Razorpay (with Razorpay Route for automated split payments to vendors)
- **Validation**: Zod

### 3. Documentation (`docs/`)
Contains critical project documentation:
- **`lld.md`**: Complete Low Level Design, including the database schema, core workflows (Checkout, Webhooks, Inventory Control), and API endpoints architecture.
- **`Credentials.md`**: Platform credentials and configurations.
- **`Vendors list.md`**: Vendor information.
- **`mercatrix_audit.md`**: Security and project audit logs.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL
- Razorpay API Keys

### 1. Setup Backend (`mercatrix-api`)
```bash
cd mercatrix-api
npm install
```
Configure your `.env` variables (Database URL, JWT Secret, Razorpay Keys, etc.) based on the Prisma schema.
Run the database migrations and seed data:
```bash
npx prisma generate
npx prisma db push
npm run seed
```
Start the API development server:
```bash
npm run dev
```

### 2. Setup Frontend (`mercatrix-web`)
The web application is placed inside `mercatrix-web` (npm package names cannot use uppercase letters).
```bash
cd mercatrix-web
npm install
```
Start the web development server:
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Key Features
- **Role-Based Access Control**: Support for `CUSTOMER`, `VENDOR`, and `SUPER_ADMIN` workflows.
- **Automated Split Payments**: Uses Razorpay Route to automatically separate platform commission from vendor payouts.
- **Concurrency Control**: Implements database-level row locking (`FOR UPDATE` in PostgreSQL) to prevent inventory race conditions during high-traffic checkouts.
- **Centralized Dashboarding**: Data models designed for comprehensive admin and vendor dashboards, enabling order tracking, block/ban management, and real-time revenue analytics.