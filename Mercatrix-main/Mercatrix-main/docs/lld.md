# Mercatrix - Complete Low Level Design (LLD)

## 1. Architectural Stack
*   **Frontend**: Next.js (React), TailwindCSS, Redux Toolkit / React Query.
*   **Backend**: Node.js, Express.js (or NestJS for strict OOP structure).
*   **Database**: PostgreSQL (via Prisma ORM).
*   **Caching & Rate Limiting**: Redis (OTP storage, rate limiting, real-time analytics caching).
*   **Storage**: AWS S3 or Cloudinary (Images/Documents).
*   **Payment**: Razorpay Route (for automated split payouts to vendors).
*   **Real-time / Notifications**: Socket.io (optional for live tracking/dashboards) + Nodemailer/SendGrid.

---

## 2. Database Schema Design (PostgreSQL + Prisma)

We normalize the database to ensure data integrity, using `Decimal` for currency to avoid floating-point errors, and setting up cascading deletes where appropriate.

### Exact `schema.prisma` Implementation

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  SUPER_ADMIN
  VENDOR
  CUSTOMER
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  CANCELLED_BY_ADMIN
  RETURN_REQUESTED
  RETURNED
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  phone         String?        @unique
  password_hash String
  role          Role           @default(CUSTOMER)
  is_active     Boolean        @default(true)
  created_at    DateTime       @default(now())
  updated_at    DateTime       @updatedAt

  vendorProfile VendorProfile?
  addresses     Address[]
  carts         CartItem[]
  orders        Order[]        // Primary orders placed by customer
  reviews       Review[]
}

model VendorProfile {
  id                     String    @id @default(uuid())
  user_id                String    @unique
  business_name          String
  gst_vat_number         String?
  tax_id                 String?
  documents_urls         Json      // S3/Cloudinary links
  razorpay_account_id    String?   // REQUIRED FOR RAZORPAY ROUTE SPLIT PAYMENTS
  is_approved            Boolean   @default(false)
  is_blocked             Boolean   @default(false)
  block_reason           String?
  
  user                   User      @relation(fields:[user_id], references: [id], onDelete: Cascade)
  products               Product[]
  subOrders              SubOrder[] 
}

model Address {
  id         String  @id @default(uuid())
  user_id    String
  street     String
  city       String
  state      String
  zip        String
  country    String
  is_default Boolean @default(false)

  user       User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model Category {
  id              String     @id @default(uuid())
  name            String
  parent_id       String?
  commission_rate Decimal    @default(10.00) // e.g., 10.00%
  
  parent          Category?  @relation("CategoryHierarchy", fields:[parent_id], references:[id])
  children        Category[] @relation("CategoryHierarchy")
  products        Product[]
}

model Product {
  id             String           @id @default(uuid())
  vendor_id      String
  category_id    String
  title          String
  description    String
  base_price     Decimal
  average_rating Decimal          @default(0.0)
  created_at     DateTime         @default(now())

  vendor         VendorProfile    @relation(fields: [vendor_id], references:[id])
  category       Category         @relation(fields: [category_id], references: [id])
  variants       ProductVariant[]
  images         ProductImage[]
  reviews        Review[]
}

model ProductVariant {
  id             String       @id @default(uuid())
  product_id     String
  sku            String       @unique
  attributes     Json         // e.g., {"color": "Red", "size": "L"}
  price          Decimal      
  stock_quantity Int          @default(0)

  product        Product      @relation(fields: [product_id], references: [id], onDelete: Cascade)
  cartItems      CartItem[]
  orderItems     OrderItem[]
}

model ProductImage {
  id         String  @id @default(uuid())
  product_id String
  image_url  String
  is_primary Boolean @default(false)

  product    Product @relation(fields:[product_id], references: [id], onDelete: Cascade)
}

model CartItem {
  id         String         @id @default(uuid())
  user_id    String
  variant_id String
  quantity   Int
  added_at   DateTime       @default(now())

  user       User           @relation(fields: [user_id], references:[id], onDelete: Cascade)
  variant    ProductVariant @relation(fields: [variant_id], references:[id], onDelete: Cascade)
}

// PRIMARY ORDER (Customer Facing)
model Order {
  id                    String        @id @default(uuid())
  customer_id           String
  total_amount          Decimal
  platform_shipping_fee Decimal
  razorpay_order_id     String?       @unique
  payment_status        PaymentStatus @default(PENDING)
  created_at            DateTime      @default(now())

  customer              User          @relation(fields:[customer_id], references: [id])
  subOrders             SubOrder[]
}

// VENDOR SPECIFIC ORDER (Split from Primary Order)
model SubOrder {
  id                  String      @id @default(uuid())
  order_id            String
  vendor_id           String
  sub_total           Decimal     // Total for this vendor's items
  commission_deducted Decimal     // Platform's cut
  status              OrderStatus @default(PENDING)
  tracking_id         String?
  delivery_partner    String?

  order               Order       @relation(fields: [order_id], references: [id], onDelete: Cascade)
  vendor              VendorProfile @relation(fields: [vendor_id], references:[id])
  orderItems          OrderItem[]
}

model OrderItem {
  id                      String         @id @default(uuid())
  sub_order_id            String
  variant_id              String
  quantity                Int
  price_at_purchase       Decimal
  commission_rate_applied Decimal

  subOrder                SubOrder       @relation(fields: [sub_order_id], references: [id], onDelete: Cascade)
  variant                 ProductVariant @relation(fields: [variant_id], references: [id])
  reviews                 Review[]       
}

model Review {
  id            String     @id @default(uuid())
  user_id       String
  product_id    String
  order_item_id String     @unique // Ensures 1 review per purchased item (Verified Buyer)
  rating        Int
  comment       String?
  created_at    DateTime   @default(now())

  user          User       @relation(fields:[user_id], references: [id], onDelete: Cascade)
  product       Product    @relation(fields: [product_id], references: [id], onDelete: Cascade)
  orderItem     OrderItem  @relation(fields: [order_item_id], references: [id])
}
```

---

## 3. Core System Logic & Workflows

### 3.1. Checkout & Automated Split Payments (Razorpay Route)
To do split payments automatically, we create an order and attach a `transfers` array. Razorpay automatically takes the customer's full payment, keeps the platform fee in your main account, and transfers the remaining balances directly to the vendors' linked accounts.

#### Checkout Controller (`POST /api/checkout`)
```javascript
const Razorpay = require('razorpay');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { userId } = req.user; 
  
  try {
    // 1. Fetch user's cart
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: userId },
      include: {
        variant: { include: { product: { include: { category: true, vendor: true } } } }
      }
    });

    if (cartItems.length === 0) return res.status(400).json({ error: "Cart is empty" });

    let totalOrderAmount = 0;
    const platformShippingFee = 50; 
    const vendorPayouts = {}; 

    // 2. Calculate Totals and Category-based Commissions
    cartItems.forEach(item => {
      const price = parseFloat(item.variant.price);
      const itemTotal = price * item.quantity;
      const commissionRate = parseFloat(item.variant.product.category.commission_rate);
      
      const platformCut = itemTotal * (commissionRate / 100);
      const vendorCut = itemTotal - platformCut;

      totalOrderAmount += itemTotal;

      const vendorId = item.variant.product.vendor_id;
      const razorpayAccountId = item.variant.product.vendor.razorpay_account_id;

      if (!vendorPayouts[vendorId]) {
        vendorPayouts[vendorId] = { accountId: razorpayAccountId, payoutAmount: 0, commissionDeducted: 0, subTotal: 0 };
      }
      vendorPayouts[vendorId].payoutAmount += vendorCut;
      vendorPayouts[vendorId].commissionDeducted += platformCut;
      vendorPayouts[vendorId].subTotal += itemTotal;
    });

    totalOrderAmount += platformShippingFee;

    // 3. Create Transfers Array for Razorpay Route
    const transfers = Object.values(vendorPayouts).map(vendor => ({
      account: vendor.accountId, 
      amount: Math.round(vendor.payoutAmount * 100), // convert to paise
      currency: "INR",
      notes: { note: "Vendor Payout" },
      on_hold: 1, 
      on_hold_until: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // Hold 7 days
    }));

    // 4. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalOrderAmount * 100),
      currency: "INR",
      transfers: transfers 
    });

    // 5. Save Order & SubOrders in DB using Prisma Transaction
    const dbOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customer_id: userId,
          total_amount: totalOrderAmount,
          platform_shipping_fee: platformShippingFee,
          razorpay_order_id: razorpayOrder.id,
        }
      });

      for (const[vendorId, data] of Object.entries(vendorPayouts)) {
        const subOrder = await tx.subOrder.create({
          data: {
            order_id: order.id,
            vendor_id: vendorId,
            sub_total: data.subTotal,
            commission_deducted: data.commissionDeducted,
          }
        });

        const vendorCartItems = cartItems.filter(ci => ci.variant.product.vendor_id === vendorId);
        
        await tx.orderItem.createMany({
          data: vendorCartItems.map(vci => ({
            sub_order_id: subOrder.id,
            variant_id: vci.variant_id,
            quantity: vci.quantity,
            price_at_purchase: vci.variant.price,
            commission_rate_applied: vci.variant.product.category.commission_rate
          }))
        });
      }

      await tx.cartItem.deleteMany({ where: { user_id: userId } });
      return order;
    });

    res.status(200).json({ razorpayOrderId: razorpayOrder.id, amount: totalOrderAmount });

  } catch (error) {
    res.status(500).json({ error: "Failed to initialize checkout" });
  }
};
```

### 3.2. Inventory Concurrency Control & Webhooks
Since inventory is deducted on *Successful Payment*, we handle edge cases where two people buy the exact same item concurrently. We use PostgreSQL row-level locks (`FOR UPDATE`).

#### Webhook Handler (`POST /api/webhooks/razorpay`)
```javascript
const crypto = require('crypto');

exports.razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto.createHmac('sha256', secret)
                                  .update(JSON.stringify(req.body)).digest('hex');

  if (expectedSignature !== signature) return res.status(400).json({ error: "Invalid signature" });

  const event = req.body.event;

  if (event === 'payment.captured' || event === 'order.paid') {
    const razorpayOrderId = req.body.payload.payment.entity.order_id;

    try {
      await prisma.$transaction(async (tx) => {
        // Update Primary Order Status
        const order = await tx.order.update({
          where: { razorpay_order_id: razorpayOrderId },
          data: { payment_status: 'SUCCESS' },
          include: { subOrders: { include: { orderItems: true } } }
        });

        // Loop through items to Deduct Inventory safely
        for (const subOrder of order.subOrders) {
          for (const item of subOrder.orderItems) {
            
            // Raw Query for Row-Level Locking (Prevents Race Conditions)
            const variantLock = await tx.$queryRaw`
              SELECT stock_quantity FROM "ProductVariant" 
              WHERE id = ${item.variant_id} FOR UPDATE
            `;

            if (variantLock[0].stock_quantity < item.quantity) {
              // EDGE CASE: Out of stock! (Someone else bought it a millisecond ago)
              await tx.subOrder.update({
                where: { id: subOrder.id },
                data: { status: 'CANCELLED' } // Will be mapped to CANCELLED_OUT_OF_STOCK
              });
              
              // Trigger Partial Refund directly to Razorpay
              await razorpay.payments.refund(req.body.payload.payment.entity.id, {
                amount: Math.round(item.price_at_purchase * item.quantity * 100),
                notes: { reason: "Out of stock concurrency race condition" }
              });
              continue;
            }

            // Deduct Stock Safely
            await tx.productVariant.update({
              where: { id: item.variant_id },
              data: { stock_quantity: { decrement: item.quantity } }
            });
          }
        }
      });
      res.status(200).send("Webhook Processed Successfully");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(200).send("Event ignored");
  }
};
```

### 3.3. Vendor Ban / Block Logic
When Super Admin blocks a vendor:
1.  Update `VendorProfile.is_blocked = true` and save `block_reason`.
2.  Send an automated email via Nodemailer (with the block reason and an appeal link).
3.  **Transaction**: Find all `SubOrders` for this vendor where status is `PENDING` or `PROCESSING`.
4.  Mark them as `CANCELLED_BY_ADMIN`.
5.  Trigger **Payment Gateway Refund API** for those specific sub-order amounts back to the respective customers.

### 3.4. Order Cancellation (Partial)
If Vendor A cancels their SubOrder:
1.  Vendor triggers cancellation.
2.  System initiates a refund for Vendor A's `sub_total` using Stripe/Razorpay Refund API.
3.  Vendor B's SubOrder remains unaffected. Primary `Order` remains `PARTIALLY_DELIVERED`.

---

## 4. API Endpoint Architecture (REST)

### 4.1. Auth & Users (Rate Limited)
*   `POST /api/auth/send-otp` -> Generates OTP, stores in Redis (`SETEX otp:phone 300 value`). Limits to 3 per 5 mins using Redis sliding window.
*   `POST /api/auth/verify-otp` -> Verifies OTP, returns JWT (Access + Refresh Token).
*   `POST /api/vendor/apply` -> Auth required. Uploads docs to S3, creates `VendorProfile` (Status: Pending).

### 4.2. Admin Endpoints
*   `GET /api/admin/vendors` -> View all vendors (Pagination/Filters).
*   `PUT /api/admin/vendors/:id/approve` -> Approves profile. Updates role to `VENDOR`.
*   `PUT /api/admin/vendors/:id/block` -> Blocks vendor, fires cancellation/refund workflow.
*   `POST /api/admin/categories` -> Creates hierarchical categories with commission limits.

### 4.3. Vendor Endpoints
*   `POST /api/vendor/products` -> Create product & variants.
*   `GET /api/vendor/orders` -> Get `SubOrders` assigned to this vendor.
*   `PUT /api/vendor/orders/:subOrderId/status` -> Update status (e.g., PENDING -> SHIPPED). Send Tracking ID.

### 4.4. Customer Endpoints
*   `GET /api/products` -> Search, Filter, Sort (using Indexed columns).
*   `GET /api/cart`, `POST /api/cart` -> Blocked by Auth Middleware (No Guest Cart).
*   `POST /api/checkout` -> Initializes Razorpay split payment.
*   `GET /api/orders` -> Retrieves user's primary Orders and nested SubOrders.
*   `POST /api/reviews` -> Validates if `user_id` exists in `OrderItem` with status `DELIVERED`.

---

## 5. Security & Middlewares

*   **Authentication Middleware**: Extracts JWT from headers. Fails if invalid/expired.
*   **RBAC Middleware**: 
    *   `requireRole('SUPER_ADMIN')`
    *   `requireRole('VENDOR')` - *Also checks if `VendorProfile.is_blocked == true`. If true, rejects request.*
*   **Rate Limiting Middleware**: Specifically on `/send-otp` using Redis:
    *   Key: `rate_limit:otp:user_ip_or_phone`
    *   Logic: Max 3 requests, Time window 300 seconds.

---

## 6. Real-Time Analytics Design

To ensure the Admin/Vendor dashboards are 100% real-time without querying heavy aggregates on the Postgres DB:
1.  **Event-Driven Updates**: Every time an order is successfully placed, a webhook fires.
2.  **Redis Write-Through Cache**:
    *   Increment Redis Key: `admin:total_revenue` by Order Amount.
    *   Increment Redis Key: `admin:total_orders` by 1.
    *   Increment Redis Key: `vendor:{id}:total_sales` by SubOrder Amount.
3.  **Dashboard API**: 
    *   When Admin/Vendor opens the dashboard, it fetches data instantly from Redis (`O(1)` time complexity).
    *   A Cron Job runs nightly to sync/reconcile the Redis counters with the actual PostgreSQL database aggregations to ensure permanent accuracy.

---

## 7. Delivery & Returns Workflow

1.  **Request**: Customer clicks "Return" (Only visible if SubOrder status is `DELIVERED` and within return window).
2.  Status updates to `RETURN_REQUESTED`.
3.  **Verification**: Delivery partner picks up item -> Vendor / Admin verifies condition upon receipt.
4.  **Action**: Admin/Vendor clicks "Approve Return" on Dashboard.
5.  Status updates to `RETURNED`. System triggers Razorpay Refund API for that specific variant cost, which dynamically pulls funds back from the vendor and platform accordingly.