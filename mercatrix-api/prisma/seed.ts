import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ──────────────────────────────────────────
  // 0. Clean slate
  // ──────────────────────────────────────────
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.subOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✓ Cleaned existing data');

  // ──────────────────────────────────────────
  // 1. Users
  // ──────────────────────────────────────────
  const hashedPassword = await hashPassword('Password1!');

  await prisma.user.create({
    data: {
      id: 'mock-user-id',
      email: 'customer@mercatrix.com',
      password_hash: hashedPassword,
      role: 'CUSTOMER',
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      email: 'vendor1@mercatrix.com',
      password_hash: hashedPassword,
      role: 'VENDOR',
      vendorProfile: {
        create: {
          business_name: 'TechVault Electronics',
          is_approved: true,
          documents_urls: [],
          razorpay_account_id: 'acc_techvault_mock',
        },
      },
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      email: 'vendor2@mercatrix.com',
      password_hash: hashedPassword,
      role: 'VENDOR',
      vendorProfile: {
        create: {
          business_name: 'Urban Thread Co.',
          is_approved: true,
          documents_urls: [],
          razorpay_account_id: 'acc_urbanthread_mock',
        },
      },
    },
  });

  const vendorUser3 = await prisma.user.create({
    data: {
      email: 'vendor3@mercatrix.com',
      password_hash: hashedPassword,
      role: 'VENDOR',
      vendorProfile: {
        create: {
          business_name: 'HomeNest Living',
          is_approved: true,
          documents_urls: [],
          razorpay_account_id: 'acc_homenest_mock',
        },
      },
    },
  });

  const vendorUser4 = await prisma.user.create({
    data: {
      email: 'vendor4@mercatrix.com',
      password_hash: hashedPassword,
      role: 'VENDOR',
      vendorProfile: {
        create: {
          business_name: 'FitPeak Sports',
          is_approved: true,
          documents_urls: [],
          razorpay_account_id: 'acc_fitpeak_mock',
        },
      },
    },
  });

  const vendorUser5 = await prisma.user.create({
    data: {
      email: 'vendor5@mercatrix.com',
      password_hash: hashedPassword,
      role: 'VENDOR',
      vendorProfile: {
        create: {
          business_name: 'Glow Beauty Co.',
          is_approved: true,
          documents_urls: [],
          razorpay_account_id: 'acc_glowbeauty_mock',
        },
      },
    },
  });

  const vendorUser6 = await prisma.user.create({
    data: {
      email: 'vendor6@mercatrix.com',
      password_hash: hashedPassword,
      role: 'VENDOR',
      vendorProfile: {
        create: {
          business_name: 'PageTurner Books',
          is_approved: true,
          documents_urls: [],
          razorpay_account_id: 'acc_pageturner_mock',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@mercatrix.com',
      password_hash: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  const vendor1 = await prisma.vendorProfile.findUnique({ where: { user_id: vendorUser1.id } });
  const vendor2 = await prisma.vendorProfile.findUnique({ where: { user_id: vendorUser2.id } });
  const vendor3 = await prisma.vendorProfile.findUnique({ where: { user_id: vendorUser3.id } });
  const vendor4 = await prisma.vendorProfile.findUnique({ where: { user_id: vendorUser4.id } });
  const vendor5 = await prisma.vendorProfile.findUnique({ where: { user_id: vendorUser5.id } });
  const vendor6 = await prisma.vendorProfile.findUnique({ where: { user_id: vendorUser6.id } });

  if (!vendor1 || !vendor2 || !vendor3 || !vendor4 || !vendor5 || !vendor6)
    throw new Error('Vendor profiles not created');

  console.log('  ✓ Created users & vendor profiles');

  // ──────────────────────────────────────────
  // 2. Categories (6 diverse categories)
  // ──────────────────────────────────────────
  const catElectronics = await prisma.category.create({ data: { name: 'Electronics & Gadgets', commission_rate: 8.0 } });
  const catFashion = await prisma.category.create({ data: { name: 'Fashion & Apparel', commission_rate: 12.0 } });
  const catHome = await prisma.category.create({ data: { name: 'Home & Kitchen', commission_rate: 10.0 } });
  const catSports = await prisma.category.create({ data: { name: 'Sports & Fitness', commission_rate: 9.0 } });
  const catBeauty = await prisma.category.create({ data: { name: 'Beauty & Personal Care', commission_rate: 15.0 } });
  const catBooks = await prisma.category.create({ data: { name: 'Books & Stationery', commission_rate: 5.0 } });

  console.log('  ✓ Created 6 categories');

  // ──────────────────────────────────────────
  // Helper
  // ──────────────────────────────────────────
  async function createProduct(
    vendorId: string, categoryId: string, title: string, description: string,
    basePrice: number, rating: number, imageUrl: string,
    variants: { sku: string; attributes: Record<string, string>; price: number; stock: number }[],
  ) {
    return prisma.product.create({
      data: {
        vendor_id: vendorId, category_id: categoryId, title, description,
        base_price: basePrice, average_rating: rating,
        images: { create: { image_url: imageUrl, is_primary: true } },
        variants: { create: variants.map(v => ({ sku: v.sku, attributes: v.attributes, price: v.price, stock_quantity: v.stock })) },
      },
    });
  }

  // ══════════════════════════════════════════
  // 3. ELECTRONICS & GADGETS (10)
  // ══════════════════════════════════════════
  await createProduct(vendor1.id, catElectronics.id,
    'Wireless ANC Headphones',
    'Industry-leading active noise cancellation with 30-hour battery life, Hi-Res Audio, and multipoint Bluetooth.',
    19999, 4.8,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    [
      { sku: 'HP-BLK', attributes: { color: 'Midnight Black' }, price: 19999, stock: 25 },
      { sku: 'HP-WHT', attributes: { color: 'Pearl White' }, price: 19999, stock: 18 },
    ],
  );

  await createProduct(vendor1.id, catElectronics.id,
    'Mechanical Gaming Keyboard',
    'Low-profile mechanical switches with per-key RGB, aircraft-grade aluminium body, wireless tri-mode.',
    8499, 4.6,
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    [
      { sku: 'KB-GRY', attributes: { color: 'Space Grey', layout: '75%' }, price: 8499, stock: 30 },
      { sku: 'KB-BLK', attributes: { color: 'Black', layout: 'Full' }, price: 8999, stock: 20 },
    ],
  );

  await createProduct(vendor1.id, catElectronics.id,
    'Smartwatch Series X',
    'Always-on AMOLED display, GPS, heart rate & SpO2 monitoring, 7-day battery, 5ATM water resistance.',
    24999, 4.9,
    'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80',
    [
      { sku: 'SW-BLK', attributes: { color: 'Black', size: '44mm' }, price: 24999, stock: 15 },
      { sku: 'SW-SLV', attributes: { color: 'Silver', size: '40mm' }, price: 22999, stock: 12 },
    ],
  );

  await createProduct(vendor1.id, catElectronics.id,
    'Portable Bluetooth Speaker',
    '360° surround sound, IP67 waterproof, 24-hour battery, built-in power bank, and daisy-chain pairing.',
    4999, 4.7,
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
    [
      { sku: 'SPK-BLK', attributes: { color: 'Black' }, price: 4999, stock: 50 },
      { sku: 'SPK-RED', attributes: { color: 'Red' }, price: 4999, stock: 35 },
    ],
  );

  await createProduct(vendor1.id, catElectronics.id,
    'True Wireless Earbuds',
    'Hybrid ANC, spatial audio, IPX5 sweat resistance, 8-hour playback, and wireless charging case.',
    7999, 4.7,
    'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&q=80',
    [
      { sku: 'EB-BLK', attributes: { color: 'Black' }, price: 7999, stock: 35 },
      { sku: 'EB-WHT', attributes: { color: 'White' }, price: 7999, stock: 28 },
    ],
  );

  await createProduct(vendor1.id, catElectronics.id,
    '4K Webcam with Ring Light',
    '4K resolution, auto-focus, AI-powered framing, built-in ring light, and noise-cancelling dual mics.',
    6999, 4.5,
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    [
      { sku: 'WC-4K', attributes: { resolution: '4K' }, price: 6999, stock: 40 },
    ],
  );

  await createProduct(vendor1.id, catElectronics.id,
    'Wireless Charging Pad',
    'Qi-certified 15W fast wireless charger with LED indicator, anti-slip surface, foreign object detection.',
    1499, 4.3,
    'https://images.unsplash.com/photo-1622782914767-404fb9ab3f57?w=800&q=80',
    [
      { sku: 'CHG-BLK', attributes: { color: 'Black' }, price: 1499, stock: 100 },
      { sku: 'CHG-WHT', attributes: { color: 'White' }, price: 1499, stock: 80 },
    ],
  );

  await createProduct(vendor1.id, catElectronics.id,
    'USB-C Docking Station',
    'Premium 8-in-1 hub with 4K HDMI, 100W PD, SD/MicroSD, Gigabit Ethernet, and 3× USB-A 3.0 ports.',
    2999, 4.6,
    'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80',
    [
      { sku: 'HUB-GRY', attributes: { color: 'Space Grey' }, price: 2999, stock: 55 },
    ],
  );

  await createProduct(vendor1.id, catElectronics.id,
    'Portable Power Bank 20000mAh',
    '65W fast charging, triple output, digital display, airline-approved, charges a laptop in under 1 hour.',
    2499, 4.5,
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
    [
      { sku: 'PB-BLK', attributes: { color: 'Black' }, price: 2499, stock: 70 },
      { sku: 'PB-WHT', attributes: { color: 'White' }, price: 2499, stock: 45 },
    ],
  );

  await createProduct(vendor1.id, catElectronics.id,
    'Smart Fitness Tracker Band',
    'AMOLED display, SpO2 monitoring, 14-day battery, 110+ sports modes, sleep tracking, 5ATM waterproof.',
    3499, 4.4,
    'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
    [
      { sku: 'FB-BLK', attributes: { color: 'Black' }, price: 3499, stock: 45 },
      { sku: 'FB-GRN', attributes: { color: 'Olive Green' }, price: 3499, stock: 30 },
    ],
  );

  console.log('  ✓ Created 10 Electronics & Gadgets products');

  // ══════════════════════════════════════════
  // 4. FASHION & APPAREL (10)
  // ══════════════════════════════════════════
  await createProduct(vendor2.id, catFashion.id,
    'Premium Cotton T-Shirt',
    'Heavyweight 220GSM organic cotton tee with relaxed fit, ribbed collar, and pre-shrunk fabric.',
    1299, 4.6,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    [
      { sku: 'TS-BLK-M', attributes: { color: 'Black', size: 'M' }, price: 1299, stock: 50 },
      { sku: 'TS-WHT-L', attributes: { color: 'White', size: 'L' }, price: 1299, stock: 40 },
    ],
  );

  await createProduct(vendor2.id, catFashion.id,
    'Slim Fit Chino Trousers',
    'Stretch cotton-blend chinos with tapered leg, YKK zipper, and wrinkle-resistant finish.',
    2499, 4.5,
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    [
      { sku: 'CH-KHK-32', attributes: { color: 'Khaki', size: '32' }, price: 2499, stock: 25 },
      { sku: 'CH-NVY-34', attributes: { color: 'Navy', size: '34' }, price: 2499, stock: 20 },
    ],
  );

  await createProduct(vendor2.id, catFashion.id,
    'Classic Aviator Sunglasses',
    'Polarised UV400 lenses with titanium frame, spring hinges, and premium leather case.',
    3499, 4.9,
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    [
      { sku: 'SG-GLD', attributes: { frame: 'Gold', lens: 'Green' }, price: 3499, stock: 20 },
      { sku: 'SG-SLV', attributes: { frame: 'Silver', lens: 'Grey' }, price: 3499, stock: 18 },
    ],
  );

  await createProduct(vendor2.id, catFashion.id,
    'Oversized Fleece Hoodie',
    'Premium fleece-lined oversized hoodie with kangaroo pocket, dropped shoulders, and brushed interior.',
    2999, 4.7,
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    [
      { sku: 'HD-GRY-M', attributes: { color: 'Heather Grey', size: 'M' }, price: 2999, stock: 30 },
      { sku: 'HD-BLK-L', attributes: { color: 'Black', size: 'L' }, price: 2999, stock: 25 },
    ],
  );

  await createProduct(vendor2.id, catFashion.id,
    'Leather Minimalist Wallet',
    'Full-grain Italian leather bifold wallet with RFID blocking, 8 card slots, and slim profile.',
    1999, 4.8,
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
    [
      { sku: 'WL-BRN', attributes: { color: 'Tan Brown' }, price: 1999, stock: 60 },
      { sku: 'WL-BLK', attributes: { color: 'Black' }, price: 1999, stock: 55 },
    ],
  );

  await createProduct(vendor2.id, catFashion.id,
    'Denim Jacket – Washed Indigo',
    'Classic trucker denim jacket in medium-wash indigo, 100% cotton, brass buttons, two chest pockets.',
    3999, 4.6,
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
    [
      { sku: 'DJ-IND-M', attributes: { color: 'Indigo', size: 'M' }, price: 3999, stock: 15 },
      { sku: 'DJ-IND-L', attributes: { color: 'Indigo', size: 'L' }, price: 3999, stock: 12 },
    ],
  );

  await createProduct(vendor2.id, catFashion.id,
    'Running Sneakers',
    'Lightweight mesh upper with responsive foam midsole, rubber outsole, reflective accents, 245g.',
    5999, 4.7,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    [
      { sku: 'SN-WHT-9', attributes: { color: 'White/Red', size: 'UK 9' }, price: 5999, stock: 22 },
      { sku: 'SN-BLK-10', attributes: { color: 'Black', size: 'UK 10' }, price: 5999, stock: 18 },
    ],
  );

  await createProduct(vendor2.id, catFashion.id,
    'Merino Wool Beanie',
    '100% superfine merino wool, double-layered for warmth, breathable, and itch-free.',
    899, 4.5,
    'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80',
    [
      { sku: 'BN-CHR', attributes: { color: 'Charcoal' }, price: 899, stock: 40 },
      { sku: 'BN-CML', attributes: { color: 'Camel' }, price: 899, stock: 35 },
    ],
  );

  await createProduct(vendor2.id, catFashion.id,
    'Leather Crossbody Bag',
    'Handcrafted full-grain leather crossbody with adjustable strap, brass hardware, and zip closure.',
    4499, 4.6,
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    [
      { sku: 'CB-BRN', attributes: { color: 'Cognac Brown' }, price: 4499, stock: 16 },
      { sku: 'CB-BLK', attributes: { color: 'Black' }, price: 4499, stock: 14 },
    ],
  );

  await createProduct(vendor2.id, catFashion.id,
    'Linen Summer Shirt',
    'Relaxed-fit linen-cotton blend, breathable, Mandarin collar, mother-of-pearl buttons.',
    2199, 4.5,
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    [
      { sku: 'LS-SKY-M', attributes: { color: 'Sky Blue', size: 'M' }, price: 2199, stock: 20 },
      { sku: 'LS-OLV-L', attributes: { color: 'Olive', size: 'L' }, price: 2199, stock: 18 },
    ],
  );

  console.log('  ✓ Created 10 Fashion & Apparel products');

  // ══════════════════════════════════════════
  // 5. HOME & KITCHEN (10)
  // ══════════════════════════════════════════
  await createProduct(vendor3.id, catHome.id,
    'Minimalist LED Desk Lamp',
    'Adjustable LED desk lamp with touch dimmer, 5 colour temperatures, wireless charging base, aluminium arm.',
    3499, 4.7,
    'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&q=80',
    [
      { sku: 'DL-BLK', attributes: { color: 'Matte Black' }, price: 3499, stock: 20 },
      { sku: 'DL-WHT', attributes: { color: 'Matte White' }, price: 3499, stock: 18 },
    ],
  );

  await createProduct(vendor3.id, catHome.id,
    'Ceramic Pour-Over Coffee Set',
    'Artisanal stoneware dripper with borosilicate carafe, reusable stainless steel filter, serves 2–4 cups.',
    1999, 4.6,
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    [
      { sku: 'CF-WHT', attributes: { color: 'White' }, price: 1999, stock: 30 },
      { sku: 'CF-BLK', attributes: { color: 'Charcoal' }, price: 1999, stock: 22 },
    ],
  );

  await createProduct(vendor3.id, catHome.id,
    'Cast Iron Skillet 12"',
    'Pre-seasoned cast iron skillet, oven safe to 260°C, dual pour spouts, ergonomic handle.',
    2799, 4.8,
    'https://images.unsplash.com/photo-1585442231090-67c5c8fd0b0d?w=800&q=80',
    [
      { sku: 'CI-12', attributes: { size: '12 inch' }, price: 2799, stock: 25 },
    ],
  );

  await createProduct(vendor3.id, catHome.id,
    'Scented Soy Candle Set',
    'Hand-poured soy wax candles in cedar, lavender, and vanilla. Cotton wicks, 40-hour burn time each.',
    1299, 4.7,
    'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&q=80',
    [
      { sku: 'SC-SET3', attributes: { scent: 'Cedar / Lavender / Vanilla' }, price: 1299, stock: 50 },
    ],
  );

  await createProduct(vendor3.id, catHome.id,
    'Stainless Steel Water Bottle',
    'Triple-wall vacuum insulated, keeps cold 24h / hot 12h, leak-proof cap, BPA-free, 750ml.',
    999, 4.5,
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    [
      { sku: 'WB-BLK', attributes: { color: 'Matte Black' }, price: 999, stock: 70 },
      { sku: 'WB-WHT', attributes: { color: 'White' }, price: 999, stock: 55 },
    ],
  );

  await createProduct(vendor3.id, catHome.id,
    'Wooden Cutting Board',
    'End-grain acacia wood board, food-safe mineral oil finish, juice groove, leather hanging strap.',
    1399, 4.8,
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    [
      { sku: 'CB-LRG', attributes: { size: 'Large (45cm)' }, price: 1399, stock: 20 },
      { sku: 'CB-MED', attributes: { size: 'Medium (30cm)' }, price: 999, stock: 30 },
    ],
  );

  await createProduct(vendor3.id, catHome.id,
    'Modern Wall Clock',
    'Scandinavian silent wall clock with solid walnut frame, quartz movement, minimalist face.',
    2299, 4.5,
    'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80',
    [
      { sku: 'WC-WLN', attributes: { material: 'Walnut' }, price: 2299, stock: 15 },
      { sku: 'WC-OAK', attributes: { material: 'White Oak' }, price: 2299, stock: 12 },
    ],
  );

  await createProduct(vendor3.id, catHome.id,
    'Linen Cushion Covers (Pair)',
    'Stonewashed French linen covers, hidden zipper, fits 45×45cm inserts. Machine washable.',
    1599, 4.6,
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
    [
      { sku: 'CC-OAT', attributes: { color: 'Oatmeal' }, price: 1599, stock: 40 },
      { sku: 'CC-SGE', attributes: { color: 'Sage Green' }, price: 1599, stock: 30 },
    ],
  );

  await createProduct(vendor3.id, catHome.id,
    'Indoor Herb Garden Kit',
    'Self-watering planter for 3 herbs with basil, mint & cilantro seed pods, LED grow light, and timer.',
    2799, 4.3,
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80',
    [
      { sku: 'HG-WHT', attributes: { color: 'White' }, price: 2799, stock: 18 },
    ],
  );

  await createProduct(vendor3.id, catHome.id,
    'Handwoven Cotton Throw Blanket',
    'Artisan handwoven cotton throw with herringbone pattern, pre-washed for softness, OEKO-TEX certified.',
    2499, 4.8,
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    [
      { sku: 'TB-IVR', attributes: { color: 'Ivory' }, price: 2499, stock: 25 },
      { sku: 'TB-SLT', attributes: { color: 'Slate Grey' }, price: 2499, stock: 20 },
    ],
  );

  console.log('  ✓ Created 10 Home & Kitchen products');

  // ══════════════════════════════════════════
  // 6. SPORTS & FITNESS (10)
  // ══════════════════════════════════════════
  await createProduct(vendor4.id, catSports.id,
    'Yoga Mat – Extra Thick 6mm',
    'Non-slip TPE yoga mat with alignment lines, eco-friendly material, carrying strap, 183×61cm.',
    1999, 4.7,
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
    [
      { sku: 'YM-PRP', attributes: { color: 'Purple' }, price: 1999, stock: 40 },
      { sku: 'YM-BLK', attributes: { color: 'Black' }, price: 1999, stock: 35 },
    ],
  );

  await createProduct(vendor4.id, catSports.id,
    'Adjustable Dumbbell Set 24kg',
    'Space-saving adjustable dumbbells, 2.5–24kg each, quick-change selector, rubberised grip.',
    12999, 4.8,
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    [
      { sku: 'DB-24-BLK', attributes: { weight: '24kg' }, price: 12999, stock: 10 },
    ],
  );

  await createProduct(vendor4.id, catSports.id,
    'Resistance Band Set (5-Pack)',
    'Latex-free TPE bands in 5 resistance levels, includes door anchor, handles, and ankle straps.',
    1499, 4.5,
    'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80',
    [
      { sku: 'RB-SET5', attributes: { type: 'Full Set' }, price: 1499, stock: 60 },
    ],
  );

  await createProduct(vendor4.id, catSports.id,
    'Jump Rope – Speed Pro',
    'Ball-bearing steel cable jump rope with aluminium handles, adjustable length, anti-tangle design.',
    699, 4.3,
    'https://images.unsplash.com/photo-1517130038641-a774d04afb3c?w=800&q=80',
    [
      { sku: 'JR-BLK', attributes: { color: 'Black' }, price: 699, stock: 50 },
    ],
  );

  await createProduct(vendor4.id, catSports.id,
    'Foam Roller – Deep Tissue',
    'High-density EVA foam roller with textured grooves for trigger point therapy, 45cm length.',
    999, 4.5,
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    [
      { sku: 'FR-BLK', attributes: { color: 'Black' }, price: 999, stock: 45 },
      { sku: 'FR-BLU', attributes: { color: 'Blue' }, price: 999, stock: 35 },
    ],
  );

  await createProduct(vendor4.id, catSports.id,
    'Hiking Backpack 40L',
    'Ergonomic hiking backpack with rain cover, hydration slot, ventilated back panel, and hip belt.',
    4999, 4.7,
    'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&q=80',
    [
      { sku: 'HB-OLV', attributes: { color: 'Olive Green' }, price: 4999, stock: 18 },
      { sku: 'HB-NVY', attributes: { color: 'Navy' }, price: 4999, stock: 14 },
    ],
  );

  await createProduct(vendor4.id, catSports.id,
    'Insulated Sports Water Bottle',
    'Double-wall stainless steel, keeps cold 24h, squeeze cap, 750ml, BPA-free.',
    799, 4.4,
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
    [
      { sku: 'SWB-BLK', attributes: { color: 'Black' }, price: 799, stock: 80 },
      { sku: 'SWB-BLU', attributes: { color: 'Blue' }, price: 799, stock: 60 },
    ],
  );

  await createProduct(vendor4.id, catSports.id,
    'Tennis Racket Pro',
    'Graphite composite frame, 100 sq in head, 27" length, pre-strung, includes carrying case.',
    6999, 4.6,
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
    [
      { sku: 'TR-BLK', attributes: { grip: 'G3' }, price: 6999, stock: 12 },
    ],
  );

  await createProduct(vendor4.id, catSports.id,
    'Cycling Gloves – Half Finger',
    'Gel-padded cycling gloves with breathable mesh, anti-slip silicone grip, pull-off tabs.',
    899, 4.4,
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    [
      { sku: 'CG-BLK-M', attributes: { color: 'Black', size: 'M' }, price: 899, stock: 25 },
      { sku: 'CG-BLK-L', attributes: { color: 'Black', size: 'L' }, price: 899, stock: 20 },
    ],
  );

  await createProduct(vendor4.id, catSports.id,
    'Camping Headlamp 1200 Lumens',
    'Rechargeable headlamp with red-light mode, IPX6 waterproof, motion sensor, 8-hour runtime.',
    1299, 4.6,
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    [
      { sku: 'HL-BLK', attributes: { color: 'Black' }, price: 1299, stock: 30 },
    ],
  );

  console.log('  ✓ Created 10 Sports & Fitness products');

  // ══════════════════════════════════════════
  // 7. BEAUTY & PERSONAL CARE (10)
  // ══════════════════════════════════════════
  await createProduct(vendor5.id, catBeauty.id,
    'Vitamin C Brightening Serum',
    '20% Vitamin C + Hyaluronic Acid serum for radiant, even-toned skin. Vegan, 30ml dropper bottle.',
    1299, 4.8,
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    [
      { sku: 'VC-30ML', attributes: { size: '30ml' }, price: 1299, stock: 60 },
    ],
  );

  await createProduct(vendor5.id, catBeauty.id,
    'Jade Facial Roller',
    'Genuine jade dual-ended roller for face and eye area. Promotes circulation, reduces puffiness.',
    799, 4.5,
    'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800&q=80',
    [
      { sku: 'JR-GRN', attributes: { stone: 'Jade Green' }, price: 799, stock: 45 },
      { sku: 'JR-RSQ', attributes: { stone: 'Rose Quartz' }, price: 899, stock: 35 },
    ],
  );

  await createProduct(vendor5.id, catBeauty.id,
    'Natural Bristle Hair Brush',
    'Boar bristle paddle brush with bamboo handle. Reduces frizz, distributes natural oils evenly.',
    599, 4.4,
    'https://images.unsplash.com/photo-1522338242992-e1a54571b7a0?w=800&q=80',
    [
      { sku: 'HB-NAT', attributes: { type: 'Paddle' }, price: 599, stock: 50 },
    ],
  );

  await createProduct(vendor5.id, catBeauty.id,
    'Matte Liquid Lipstick Set',
    'Long-wear matte liquid lipstick set of 6 shades. Transfer-proof, vegan, cruelty-free formula.',
    1499, 4.7,
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
    [
      { sku: 'LL-SET6', attributes: { shades: '6 Everyday Nudes' }, price: 1499, stock: 40 },
    ],
  );

  await createProduct(vendor5.id, catBeauty.id,
    'Organic Shea Body Butter',
    'Whipped raw shea butter with coconut oil & vitamin E. Deeply nourishing, no parabens, 200ml.',
    899, 4.6,
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
    [
      { sku: 'SB-UNS', attributes: { scent: 'Unscented' }, price: 899, stock: 55 },
      { sku: 'SB-LAV', attributes: { scent: 'Lavender' }, price: 899, stock: 40 },
    ],
  );

  await createProduct(vendor5.id, catBeauty.id,
    'Charcoal Face Wash',
    'Activated charcoal deep cleansing face wash with tea tree oil. Unclogs pores, oil-free formula, 150ml.',
    499, 4.5,
    'https://images.unsplash.com/photo-1556228720-195a672e68b0?w=800&q=80',
    [
      { sku: 'FW-CHR', attributes: { size: '150ml' }, price: 499, stock: 80 },
    ],
  );

  await createProduct(vendor5.id, catBeauty.id,
    'Perfume – Oud & Amber',
    'Luxury Eau de Parfum with oud, amber, and sandalwood notes. Long-lasting 8h+ fragrance, 50ml.',
    3999, 4.9,
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    [
      { sku: 'PF-OUD-50', attributes: { size: '50ml' }, price: 3999, stock: 20 },
      { sku: 'PF-OUD-100', attributes: { size: '100ml' }, price: 6499, stock: 12 },
    ],
  );

  await createProduct(vendor5.id, catBeauty.id,
    'Bamboo Makeup Brush Set',
    '12-piece professional makeup brush set with bamboo handles and vegan synthetic bristles.',
    1799, 4.6,
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    [
      { sku: 'MB-SET12', attributes: { pieces: '12' }, price: 1799, stock: 30 },
    ],
  );

  await createProduct(vendor5.id, catBeauty.id,
    'Sunscreen SPF 50+ Gel',
    'Lightweight gel sunscreen with PA+++, non-greasy, no white cast, suitable for all skin types, 50ml.',
    699, 4.7,
    'https://images.unsplash.com/photo-1532947974358-a218b0219492?w=800&q=80',
    [
      { sku: 'SS-50ML', attributes: { spf: 'SPF 50+' }, price: 699, stock: 90 },
    ],
  );

  await createProduct(vendor5.id, catBeauty.id,
    'Essential Oil Diffuser',
    'Ultrasonic aromatherapy diffuser with 7-colour LED, auto shut-off, whisper-quiet, 300ml capacity.',
    1999, 4.5,
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    [
      { sku: 'ED-WHT', attributes: { color: 'White' }, price: 1999, stock: 25 },
      { sku: 'ED-WD', attributes: { color: 'Wood Grain' }, price: 1999, stock: 20 },
    ],
  );

  console.log('  ✓ Created 10 Beauty & Personal Care products');

  // ══════════════════════════════════════════
  // 8. BOOKS & STATIONERY (10)
  // ══════════════════════════════════════════
  await createProduct(vendor6.id, catBooks.id,
    'Atomic Habits – James Clear',
    'The #1 bestseller on building good habits and breaking bad ones. Paperback, 320 pages.',
    499, 4.9,
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    [
      { sku: 'BK-AH-PB', attributes: { format: 'Paperback' }, price: 499, stock: 100 },
      { sku: 'BK-AH-HC', attributes: { format: 'Hardcover' }, price: 799, stock: 50 },
    ],
  );

  await createProduct(vendor6.id, catBooks.id,
    'Premium Leather Journal',
    'A5 genuine leather journal with 240 pages of 100GSM ivory paper, lay-flat binding, ribbon bookmark.',
    1299, 4.7,
    'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80',
    [
      { sku: 'JRNL-BRN', attributes: { color: 'Brown' }, price: 1299, stock: 35 },
      { sku: 'JRNL-BLK', attributes: { color: 'Black' }, price: 1299, stock: 30 },
    ],
  );

  await createProduct(vendor6.id, catBooks.id,
    'Japanese Gel Pen Set (10-Pack)',
    'Ultra-smooth 0.5mm gel pens in 10 colours with quick-dry ink. Perfect for journaling and note-taking.',
    399, 4.6,
    'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80',
    [
      { sku: 'GP-SET10', attributes: { tip: '0.5mm', count: '10' }, price: 399, stock: 80 },
    ],
  );

  await createProduct(vendor6.id, catBooks.id,
    'The Psychology of Money',
    'Morgan Housel\'s timeless lessons on wealth, greed, and happiness. Paperback, 256 pages.',
    399, 4.8,
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    [
      { sku: 'BK-PM-PB', attributes: { format: 'Paperback' }, price: 399, stock: 90 },
    ],
  );

  await createProduct(vendor6.id, catBooks.id,
    'Dot Grid Notebook – A5',
    'Premium 160GSM dot-grid notebook, fountain pen friendly, numbered pages, index, and lay-flat spine.',
    599, 4.7,
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80',
    [
      { sku: 'DN-BLK', attributes: { color: 'Black', pages: '192' }, price: 599, stock: 50 },
      { sku: 'DN-NVY', attributes: { color: 'Navy', pages: '192' }, price: 599, stock: 40 },
    ],
  );

  await createProduct(vendor6.id, catBooks.id,
    'Sapiens – Yuval Noah Harari',
    'A brief history of humankind. The groundbreaking international bestseller. Paperback, 498 pages.',
    549, 4.8,
    'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&q=80',
    [
      { sku: 'BK-SP-PB', attributes: { format: 'Paperback' }, price: 549, stock: 70 },
    ],
  );

  await createProduct(vendor6.id, catBooks.id,
    'Washi Tape Collection (12 Rolls)',
    'Decorative Japanese washi tape set in pastel & floral patterns. 15mm × 5m each, acid-free.',
    499, 4.4,
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80',
    [
      { sku: 'WT-PAS12', attributes: { style: 'Pastel Florals' }, price: 499, stock: 55 },
    ],
  );

  await createProduct(vendor6.id, catBooks.id,
    'Desk Organiser – Wooden',
    'Multi-compartment bamboo desk organiser for pens, phones, cards, and stationery. Minimalist design.',
    999, 4.5,
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    [
      { sku: 'DO-NAT', attributes: { material: 'Bamboo' }, price: 999, stock: 30 },
    ],
  );

  await createProduct(vendor6.id, catBooks.id,
    'Deep Work – Cal Newport',
    'Rules for focused success in a distracted world. Essential reading for productivity. Paperback, 296 pages.',
    449, 4.7,
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
    [
      { sku: 'BK-DW-PB', attributes: { format: 'Paperback' }, price: 449, stock: 65 },
    ],
  );

  await createProduct(vendor6.id, catBooks.id,
    'Fountain Pen – Classic',
    'Stainless steel fountain pen with medium nib, converter included, smooth ink flow, weighted barrel.',
    1499, 4.6,
    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80',
    [
      { sku: 'FP-BLK', attributes: { color: 'Black', nib: 'Medium' }, price: 1499, stock: 20 },
      { sku: 'FP-BLU', attributes: { color: 'Navy Blue', nib: 'Fine' }, price: 1499, stock: 15 },
    ],
  );

  console.log('  ✓ Created 10 Books & Stationery products');

  // ──────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────
  const totalProducts = await prisma.product.count();
  const totalVariants = await prisma.productVariant.count();
  const totalCategories = await prisma.category.count();
  console.log(`\n🎉 Seeding complete! ${totalProducts} products with ${totalVariants} variants across ${totalCategories} categories.\n`);

  console.log('  📋 Test Accounts (password: Password1!)');
  console.log('  ─────────────────────────────────────');
  console.log('  Customer : customer@mercatrix.com');
  console.log('  Vendor 1 : vendor1@mercatrix.com  (TechVault Electronics)');
  console.log('  Vendor 2 : vendor2@mercatrix.com  (Urban Thread Co.)');
  console.log('  Vendor 3 : vendor3@mercatrix.com  (HomeNest Living)');
  console.log('  Vendor 4 : vendor4@mercatrix.com  (FitPeak Sports)');
  console.log('  Vendor 5 : vendor5@mercatrix.com  (Glow Beauty Co.)');
  console.log('  Vendor 6 : vendor6@mercatrix.com  (PageTurner Books)');
  console.log('  Admin    : admin@mercatrix.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
