import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runConcurrencyTest() {
  console.log('--- Starting Concurrency & Reliability Test ---');
  
  // 1. Setup Test Data
  const user = await prisma.user.upsert({
    where: { email: 'test_concurrency@example.com' },
    update: {},
    create: {
      email: 'test_concurrency@example.com',
      password_hash: 'dummy',
      name: 'Concurrency Tester',
      role: 'CUSTOMER'
    }
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor_concurrency@example.com' },
    update: {},
    create: {
      email: 'vendor_concurrency@example.com',
      password_hash: 'dummy',
      name: 'Vendor Concurrency',
      role: 'VENDOR'
    }
  });

  const vendor = await prisma.vendorProfile.upsert({
    where: { user_id: vendorUser.id },
    update: {},
    create: {
      user_id: vendorUser.id,
      business_name: 'Concurrency Vendor',
      documents_urls: "{}",
      is_approved: true
    }
  });

  let category = await prisma.category.findFirst({ where: { name: 'Test Category' } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Test Category',
        commission_rate: 10
      }
    });
  }

  const product = await prisma.product.create({
    data: {
      vendor_id: vendor.id,
      category_id: category.id,
      title: 'Limited Edition Concurrency Item',
      description: 'Test item for row-level locking',
      base_price: 1000
    }
  });

  // Set stock strictly to 5
  const variant = await prisma.productVariant.create({
    data: {
      product_id: product.id,
      sku: `TEST-SKU-${Date.now()}`,
      price: 1000,
      stock_quantity: 5,
      attributes: "{}"
    }
  });

  console.log(`[Setup] Created product variant ${variant.id} with stock: 5`);

  // 2. Simulate Concurrent Purchases
  // We will try to purchase 1 unit, 10 times concurrently.
  const CONCURRENT_REQUESTS = 10;
  let successes = 0;
  let failures = 0;

  console.log(`[Test] Launching ${CONCURRENT_REQUESTS} concurrent purchase attempts...`);

  // Simulate the core locking logic from checkout.controller.ts and webhooks.controller.ts
  const purchaseAttempt = async (attemptNum: number) => {
    try {
      await prisma.$transaction(async (tx) => {
        // ROW-LEVEL LOCK: SELECT ... FOR UPDATE
        const variantLock = await tx.$queryRaw<Array<{ stock_quantity: number }>>`
          SELECT stock_quantity FROM "ProductVariant" 
          WHERE id = ${variant.id} FOR UPDATE
        `;

        if (variantLock.length === 0 || variantLock[0].stock_quantity < 1) {
          throw new Error('Insufficient stock');
        }

        // Simulate some processing delay to guarantee race conditions occur if not locked
        await new Promise(resolve => setTimeout(resolve, 50));

        // Deduct stock safely
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock_quantity: { decrement: 1 } }
        });
      }, {
        isolationLevel: 'ReadCommitted', // standard isolation level, lock is required
        maxWait: 5000,
        timeout: 10000
      });
      successes++;
      console.log(`[Attempt ${attemptNum}] Success - Stock decremented`);
    } catch (err: any) {
      failures++;
      console.log(`[Attempt ${attemptNum}] Failed - ${err.message}`);
    }
  };

  const promises = [];
  for (let i = 1; i <= CONCURRENT_REQUESTS; i++) {
    promises.push(purchaseAttempt(i));
  }

  await Promise.all(promises);

  // 3. Verify Final State
  const finalVariant = await prisma.productVariant.findUnique({
    where: { id: variant.id }
  });

  console.log('\n--- Test Results ---');
  console.log(`Initial Stock: 5`);
  console.log(`Concurrent Attempts: ${CONCURRENT_REQUESTS}`);
  console.log(`Successful Purchases: ${successes} (Expected: 5)`);
  console.log(`Failed Purchases (Oversell Prevented): ${failures} (Expected: 5)`);
  console.log(`Final Stock in DB: ${finalVariant?.stock_quantity} (Expected: 0)`);
  
  if (successes === 5 && failures === 5 && finalVariant?.stock_quantity === 0) {
    console.log('\n✅ TEST PASSED: Row-level locking successfully prevented overselling.');
  } else {
    console.log('\n❌ TEST FAILED: Concurrency race condition detected or logic error.');
  }

  // Cleanup
  await prisma.productVariant.delete({ where: { id: variant.id } });
  await prisma.product.delete({ where: { id: product.id } });
  await prisma.$disconnect();
}

runConcurrencyTest().catch(console.error);
