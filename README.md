# Mercatrix - Multi-Vendor E-Commerce Platform

Mercatrix is a complete, full-stack multi-vendor e-commerce platform. It provides distinct workflows for customers (shopping, checkout, tracking), vendors (product management, sub-order fulfillment), and super admins (category management, vendor approval, analytics). 

Built with scalability in mind, Mercatrix implements enterprise-grade patterns such as **automated split payments** via Razorpay Route and **database row-level locking** to safely handle concurrent high-volume checkouts.

## 🚀 Key Implemented Features

- **Role-Based Access Control (RBAC)**: Secure routing and API endpoints isolated for `SUPER_ADMIN`, `VENDOR`, and `CUSTOMER` profiles.
- **Automated Split Payments (Razorpay Route)**: Automatically calculates platform commission based on category rates and distributes the remaining funds directly to the vendor's linked Razorpay account during checkout.
- **Concurrency & Inventory Safety**: Implements PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) via Prisma transactions to prevent inventory race conditions and overselling during simultaneous checkout attempts.
- **Hierarchical Categories & Commissions**: Categories support parent-child relationships and dictate platform commission rates on a per-category basis.
- **Real-Time Analytics Dashboard**: Employs a Redis write-through caching strategy for `O(1)` fetch times on admin and vendor dashboards, backed by nightly database reconciliation.
- **Sub-Order Architecture**: Splits a primary customer order into multiple vendor-specific sub-orders, allowing independent tracking, fulfillment, and refunds for different vendors within the same cart.
- **Returns & Automated Refunds**: Handles partial order cancellations and returns by interacting directly with the Razorpay Refund API to claw back funds dynamically from the platform and vendor.

## 🏗️ Tech Stack

### Frontend (`mercatrix-web/`)
- **Core Framework**: Next.js (React 19, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion, `shadcn/ui`
- **State Management & Data**: Zustand, React Query (`@tanstack/react-query`)
- **Forms**: React Hook Form, Zod

### Backend API (`mercatrix-api/`)
- **Core Framework**: Node.js with Express.js
- **Language**: TypeScript (using `tsx` for execution)
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Caching & Rate Limiting**: Redis (`ioredis`)
- **Authentication**: JWT (Access & Refresh Tokens), bcrypt
- **Payments**: Razorpay Node SDK
- **Validation**: Zod

## ⚙️ Setup and Run Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or remote)
- Redis Server (running locally or remote)
- Razorpay API Keys (Key ID & Key Secret)

### 1. Backend Setup (`mercatrix-api/`)
Navigate to the backend directory:
```bash
cd mercatrix-api
npm install
```

Configure your `.env` file based on the required Prisma and application secrets:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mercatrix?schema=public"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
RAZORPAY_KEY_ID="your_razorpay_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
REDIS_URL="redis://localhost:6379"
```

Run database migrations and seed default data (e.g., Super Admin, categories):
```bash
npx prisma generate
npx prisma db push
npm run seed
```

Start the API development server:
```bash
npm run dev
```

### 2. Frontend Setup (`mercatrix-web/`)
In a new terminal, navigate to the frontend directory:
```bash
cd mercatrix-web
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

## 🧠 Architecture Deep-Dive

### Split-Payment Architecture
Mercatrix leverages **Razorpay Route** to automate vendor payouts. When a customer checks out, the backend calculates the platform commission based on the category of each item in the cart. It then constructs a `transfers` array mapping each vendor's sub-total (minus commission) to their `razorpay_account_id`. The Razorpay API processes the full amount from the customer, deposits the platform fee into the main account, and directly routes the sub-totals to the respective vendors, keeping funds on hold until the return window expires.

### Concurrency Handling
In high-traffic events, multiple users might attempt to purchase the last remaining stock of a product variant simultaneously. To ensure data integrity, Mercatrix utilizes PostgreSQL's **row-level locking** (`SELECT ... FOR UPDATE`) within a Prisma `$transaction`. 

When a successful payment webhook is received, or a checkout is finalized, the system locks the specific `ProductVariant` row before validating the `stock_quantity`. This forces concurrent transactions targeting the same variant to queue up sequentially. If the stock drops below the required quantity for a queued transaction, the system gracefully aborts the deduction, marks the sub-order as cancelled due to stockout, and triggers an automated refund for that specific item.