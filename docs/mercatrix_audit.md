# Mercatrix Resume Claims Audit

This document provides a clear, evidence-based audit of the claims made about the Mercatrix project on the resume compared to the actual codebase implementation.

## Summary of Findings

| Claim | Status | Evidence in Codebase |
| :--- | :--- | :--- |
| **Split Payments** | ✅ Fully Implemented | `checkout.controller.ts` accurately computes platform commissions vs. vendor cuts and structures a `transfers` array used to create a split order via the Razorpay API. It also handles vendor-specific `SubOrders` in the database. |
| **Refunds** | ⚠️ Partially Implemented | There is an automated partial refund mechanism inside `webhooks.controller.ts` triggered specifically when an out-of-stock race condition occurs after payment. However, there are no endpoints or general flows for customers or vendors to request/initiate standard refunds. |
| **Inventory Tracking** | ✅ Fully Implemented | Inventory is tracked and safely decremented inside the `payment.captured` webhook event within a Prisma transaction (`webhooks.controller.ts`), preventing overselling. |
| **Webhook Payment Verification** | ✅ Fully Implemented | Cryptographic signature verification (`x-razorpay-signature`) using `crypto.createHmac` is correctly implemented in `webhooks.controller.ts` to ensure requests authentically originate from Razorpay. |
| **Row-Level Locking** | ✅ Fully Implemented | The codebase utilizes explicit Postgres row-level locking (`SELECT ... FOR UPDATE` via `tx.$queryRaw`) during inventory deduction in `webhooks.controller.ts` to prevent concurrency issues and race conditions. |
| **40%+ Reliability** | ⚠️ Partially Implemented | While the application implements strong foundational reliability patterns (Prisma transactions, row-level locking, webhook verification), there are no advanced reliability mechanisms (like Dead Letter Queues for webhooks, automated retries, or circuit breakers). The "40%" metric is unverifiable strictly via code. |
| **50% Effort Reduction** | ⚠️ Partially Implemented | Features that drive effort reduction (automated vendor split payouts, automated inventory synchronization) are fully built. However, like the reliability metric, a strict "50%" reduction is a qualitative business metric that cannot be definitively proven by static code analysis alone. |

## Detailed Breakdown

### 1. Split Payments
- **Status:** ✅ Fully Implemented
- **File:** `mercatrix-api/src/controllers/checkout.controller.ts`
- **Details:** The controller iterates over cart items, isolates the product's category commission rate, and calculates the `platformCut` and `vendorCut`. It constructs a Razorpay `transfers` payload, holding funds for 7 days (`on_hold_until`), and creates explicit `SubOrder` records per vendor.

### 2. Refunds
- **Status:** ⚠️ Partially Implemented
- **File:** `mercatrix-api/src/controllers/webhooks.controller.ts`
- **Details:** A very specific refund scenario is handled: if a user pays but the item goes out of stock milliseconds prior (race condition), the system automatically triggers `razorpay.payments.refund`. However, general business logic for standard refunds is absent (no API routes or admin/vendor dashboards to process regular refunds).

### 3. Inventory Tracking
- **Status:** ✅ Fully Implemented
- **File:** `mercatrix-api/src/controllers/webhooks.controller.ts`
- **Details:** Inventory isn't just a static number; it is actively decremented inside a transaction upon successful payment capture, accurately reflecting current stock limits.

### 4. Webhook Payment Verification
- **Status:** ✅ Fully Implemented
- **File:** `mercatrix-api/src/controllers/webhooks.controller.ts`
- **Details:** The webhook endpoint intercepts the `x-razorpay-signature` header, computes an expected HMAC SHA256 signature using the `RAZORPAY_WEBHOOK_SECRET`, and rigorously compares it to prevent spoofed payment confirmations.

### 5. Row-Level Locking
- **Status:** ✅ Fully Implemented
- **File:** `mercatrix-api/src/controllers/webhooks.controller.ts`
- **Details:** To avoid the classic e-commerce double-spend inventory problem, the code utilizes a raw SQL query inside a Prisma transaction: `SELECT stock_quantity FROM "ProductVariant" WHERE id = ${item.variant_id} FOR UPDATE`. This ensures the database locks the specific row until the inventory is safely decremented.

### 6. 40%+ Reliability
- **Status:** ⚠️ Partially Implemented (Metric Unverifiable)
- **Details:** The code demonstrates excellent concurrency control (row-level locking) and transactional integrity, which contributes to reliability. However, true high-reliability event-driven architectures typically utilize queues (e.g., SQS/RabbitMQ) for webhooks to handle downtime or external API rate limits. Currently, webhooks fail synchronously if the DB is down or Razorpay's API hiccups. 

### 7. 50% Effort Reduction
- **Status:** ⚠️ Partially Implemented (Metric Unverifiable)
- **Details:** The implementation of Razorpay Route for automated vendor payouts drastically reduces the manual accounting and administrative effort typically required for multi-vendor marketplaces. While the code supports this automation, the exact "50%" figure is subjective without historical baseline data.
