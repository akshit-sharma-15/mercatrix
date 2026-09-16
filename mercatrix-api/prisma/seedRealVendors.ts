import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function seedRealVendors() {
  console.log('🚀 Seeding authentic luxury vendors and products...\n');

  const passwordHash = await hashPassword('Password1!');

  // 1. Ensure Categories Exist
  const catHorology = await prisma.category.upsert({
    where: { id: 'cat-horology' },
    update: { name: 'Horology & Watches', commission_rate: 10.0 },
    create: { id: 'cat-horology', name: 'Horology & Watches', commission_rate: 10.0 }
  });

  const catAudio = await prisma.category.upsert({
    where: { id: 'cat-audio' },
    update: { name: 'Tech & Audio', commission_rate: 8.0 },
    create: { id: 'cat-audio', name: 'Tech & Audio', commission_rate: 8.0 }
  });

  const catLeather = await prisma.category.upsert({
    where: { id: 'cat-leather' },
    update: { name: 'Leather & Luggage', commission_rate: 12.0 },
    create: { id: 'cat-leather', name: 'Leather & Luggage', commission_rate: 12.0 }
  });

  const catLiving = await prisma.category.upsert({
    where: { id: 'cat-living' },
    update: { name: 'Home & Living', commission_rate: 10.0 },
    create: { id: 'cat-living', name: 'Home & Living', commission_rate: 10.0 }
  });

  console.log('✓ Categories verified');

  // 2. Real Luxury Vendors
  const vendorsData = [
    {
      email: 'aurawatch@mercatrix.com',
      name: 'Aura Horlogerie Studio',
      business_name: 'Aura Horlogerie',
      gst_vat_number: '27AABCA1234F1Z1',
      products: [
        {
          title: 'Aura Minimalist Mechanical Watch',
          description: 'Precision Japanese automatic movement encased in sapphire crystal and brushed 316L stainless steel with genuine leather strap.',
          base_price: 18500,
          average_rating: 4.9,
          category_id: catHorology.id,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
          variants: [
            { sku: 'AURA-BLK-42', attributes: { Color: 'Obsidian Black', Size: '42mm' }, price: 18500, stock_quantity: 30 },
            { sku: 'AURA-SLV-40', attributes: { Color: 'Brushed Titanium', Size: '40mm' }, price: 18500, stock_quantity: 25 },
            { sku: 'AURA-GLD-40', attributes: { Color: 'Rose Gold', Size: '40mm' }, price: 19900, stock_quantity: 15 },
          ]
        },
        {
          title: 'Chrono Classic Skeleton Edition',
          description: 'Hand-assembled open-heart skeleton dial showcasing 21-jewel escapement, anti-reflective domed crystal, and 50m water resistance.',
          base_price: 32000,
          average_rating: 5.0,
          category_id: catHorology.id,
          image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
          variants: [
            { sku: 'CHRONO-SLV-44', attributes: { Color: 'Silver Steel', Size: '44mm' }, price: 32000, stock_quantity: 15 },
            { sku: 'CHRONO-CBN-44', attributes: { Color: 'Stealth Carbon', Size: '44mm' }, price: 34500, stock_quantity: 10 },
          ]
        }
      ]
    },
    {
      email: 'zenithaudio@mercatrix.com',
      name: 'Zenith Acoustics Lab',
      business_name: 'Zenith Acoustics',
      gst_vat_number: '29AABCB5678G2Z2',
      products: [
        {
          title: 'Studio Titanium Wireless ANC Headphones',
          description: 'Bespoke 40mm beryllium drivers delivering ultra-linear frequency response with adaptive active noise cancelling and 38-hour battery.',
          base_price: 24900,
          average_rating: 4.8,
          category_id: catAudio.id,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          variants: [
            { sku: 'ZEN-ANC-BLK', attributes: { Color: 'Matte Obsidian' }, price: 24900, stock_quantity: 40 },
            { sku: 'ZEN-ANC-SLV', attributes: { Color: 'Silver & Tan Leather' }, price: 24900, stock_quantity: 25 },
          ]
        },
        {
          title: 'Bespoke Audiophile In-Ear Monitors',
          description: 'Quad-balanced armature drivers with detachable silver-plated MMCX cable for unmatched spatial depth and vocal transparency.',
          base_price: 14500,
          average_rating: 4.9,
          category_id: catAudio.id,
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
          variants: [
            { sku: 'ZEN-IEM-BLU', attributes: { Color: 'Cosmic Blue', Fit: 'Custom Molded' }, price: 14500, stock_quantity: 35 },
            { sku: 'ZEN-IEM-CLR', attributes: { Color: 'Crystal Clear', Fit: 'Universal Foam' }, price: 14500, stock_quantity: 28 },
          ]
        }
      ]
    },
    {
      email: 'tuscanleather@mercatrix.com',
      name: 'Tuscan Leatherworks Atelier',
      business_name: 'Tuscan Leather Atelier',
      gst_vat_number: '07AABCC9012H3Z3',
      products: [
        {
          title: 'Heritage Full-Grain Leather Weekender',
          description: 'Vegetable-tanned Tuscan cowhide with hand-burnished edges, YKK Excella brass zippers, and reinforced waterproof canvas lining.',
          base_price: 14200,
          average_rating: 5.0,
          category_id: catLeather.id,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
          variants: [
            { sku: 'TUS-WK-BRN', attributes: { Color: 'Cognac Brown', Size: '45L' }, price: 14200, stock_quantity: 20 },
            { sku: 'TUS-WK-ESP', attributes: { Color: 'Deep Espresso', Size: '45L' }, price: 14200, stock_quantity: 18 },
          ]
        },
        {
          title: 'Slim Cardholder & Bifold Wallet Set',
          description: 'Ultra-slim profile crafted from Italian Buttero leather with RFID-blocking sleeves and embossed monogram detailing.',
          base_price: 3800,
          average_rating: 4.7,
          category_id: catLeather.id,
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
          variants: [
            { sku: 'TUS-WLT-TAN', attributes: { Color: 'Caramel Tan' }, price: 3800, stock_quantity: 50 },
            { sku: 'TUS-WLT-BLK', attributes: { Color: 'Jet Black' }, price: 3800, stock_quantity: 45 },
          ]
        }
      ]
    },
    {
      email: 'nordichome@mercatrix.com',
      name: 'Nordic Living Ceramics',
      business_name: 'Nordic Living Ceramics',
      gst_vat_number: '19AABCD3456I4Z4',
      products: [
        {
          title: 'Monolith Ceramic Table Lamp',
          description: 'Sculptural stoneware body with textured matte glaze and warm diffused ambient LED illumination with touch dimmer.',
          base_price: 8900,
          average_rating: 4.7,
          category_id: catLiving.id,
          image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
          variants: [
            { sku: 'NOR-LMP-TER', attributes: { Color: 'Terracotta Matte' }, price: 8900, stock_quantity: 22 },
            { sku: 'NOR-LMP-WHT', attributes: { Color: 'Sand Chalk White' }, price: 8900, stock_quantity: 25 },
          ]
        },
        {
          title: 'Handcrafted Minimalist Dinnerware Set',
          description: '16-piece artisan stoneware set including dinner plates, bowls, and mugs. Microwave and dishwasher safe with raw tactile rim.',
          base_price: 6400,
          average_rating: 4.8,
          category_id: catLiving.id,
          image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80',
          variants: [
            { sku: 'NOR-DIN-GRY', attributes: { Color: 'Slate Grey', Size: '16-Piece' }, price: 6400, stock_quantity: 20 },
            { sku: 'NOR-DIN-CHR', attributes: { Color: 'Speckled Charcoal', Size: '16-Piece' }, price: 6400, stock_quantity: 18 },
          ]
        }
      ]
    }
  ];

  for (const vData of vendorsData) {
    // 1. Create/Update User
    const user = await prisma.user.upsert({
      where: { email: vData.email },
      update: {
        name: vData.name,
        role: 'VENDOR',
        is_active: true,
      } as any,
      create: {
        email: vData.email,
        name: vData.name,
        password_hash: passwordHash,
        role: 'VENDOR',
        is_active: true,
      } as any
    });

    // 2. Create/Update VendorProfile
    const profile = await prisma.vendorProfile.upsert({
      where: { user_id: user.id },
      update: {
        business_name: vData.business_name,
        gst_vat_number: vData.gst_vat_number,
        is_approved: true,
        is_blocked: false,
      },
      create: {
        user_id: user.id,
        business_name: vData.business_name,
        gst_vat_number: vData.gst_vat_number,
        documents_urls: ['https://example.com/gst-certificate.pdf'],
        razorpay_account_id: `acc_${vData.business_name.toLowerCase().replace(/\s+/g, '_')}`,
        is_approved: true,
        is_blocked: false,
      }
    });

    console.log(`✓ Vendor active: ${vData.business_name} (${vData.email})`);

    // 3. Create Products and Variants
    for (const prod of vData.products) {
      const existingProduct = await prisma.product.findFirst({
        where: { vendor_id: profile.id, title: prod.title }
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            vendor_id: profile.id,
            category_id: prod.category_id,
            title: prod.title,
            description: prod.description,
            base_price: prod.base_price,
            average_rating: prod.average_rating,
            images: {
              create: {
                image_url: prod.image,
                is_primary: true
              }
            },
            variants: {
              create: prod.variants.map(v => ({
                sku: v.sku,
                attributes: v.attributes,
                price: v.price,
                stock_quantity: v.stock_quantity,
              }))
            }
          }
        });
        console.log(`   + Added product: ${prod.title}`);
      }
    }
  }

  console.log('\n✨ All real vendors and flagship products seeded successfully!');
}

seedRealVendors()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
