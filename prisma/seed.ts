import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding VEYROVA database...");

  // ── Create Admin User ──
  const passwordHash = await bcrypt.hash("VeyrovaAdmin@2026", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@veyrova.com" },
    update: {},
    create: {
      name: "VEYROVA Admin",
      email: "admin@veyrova.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ── Create Categories (with subcategories) ──
  const categories = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Explore the latest gadgets and tech accessories",
      sortOrder: 1,
      children: [
        { name: "Phone Cases & Covers", slug: "phone-cases-covers", description: "Premium protection for your smartphone", sortOrder: 1 },
        { name: "Earbuds & Headphones", slug: "earbuds-headphones", description: "Immersive audio experience", sortOrder: 2 },
        { name: "Smart Watches", slug: "smart-watches", description: "Stay connected on your wrist", sortOrder: 3 },
        { name: "Chargers & Cables", slug: "chargers-cables", description: "Power up your devices", sortOrder: 4 },
      ],
    },
    {
      name: "Fashion",
      slug: "fashion",
      description: "Trendy styles for every occasion",
      sortOrder: 2,
      children: [
        { name: "Men's Fashion", slug: "mens-fashion", description: "Style essentials for men", sortOrder: 1 },
        { name: "Women's Fashion", slug: "womens-fashion", description: "Elegant fashion for women", sortOrder: 2 },
        { name: "Sunglasses", slug: "sunglasses", description: "UV protection with style", sortOrder: 3 },
        { name: "Bags & Wallets", slug: "bags-wallets", description: "Carry in style", sortOrder: 4 },
      ],
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Upgrade your living space",
      sortOrder: 3,
      children: [
        { name: "Kitchen Appliances", slug: "kitchen-appliances", description: "Essential kitchen gadgets", sortOrder: 1 },
        { name: "Home Decor", slug: "home-decor", description: "Beautify your space", sortOrder: 2 },
        { name: "Lighting", slug: "lighting", description: "Set the perfect ambiance", sortOrder: 3 },
      ],
    },
    {
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
      description: "Look and feel your best",
      sortOrder: 4,
      children: [
        { name: "Skincare", slug: "skincare", description: "Nourish your skin", sortOrder: 1 },
        { name: "Hair Care", slug: "hair-care", description: "Healthy, beautiful hair", sortOrder: 2 },
        { name: "Grooming", slug: "grooming", description: "Personal grooming essentials", sortOrder: 3 },
      ],
    },
    {
      name: "Fitness & Sports",
      slug: "fitness-sports",
      description: "Gear up for an active lifestyle",
      sortOrder: 5,
      children: [
        { name: "Fitness Accessories", slug: "fitness-accessories", description: "Essential workout gear", sortOrder: 1 },
        { name: "Sports Equipment", slug: "sports-equipment", description: "Play like a pro", sortOrder: 2 },
      ],
    },
    {
      name: "Gifts & Accessories",
      slug: "gifts-accessories",
      description: "Perfect gifts for every occasion",
      sortOrder: 6,
      children: [
        { name: "Gift Sets", slug: "gift-sets", description: "Curated gift collections", sortOrder: 1 },
        { name: "Accessories", slug: "accessories", description: "Complete your look", sortOrder: 2 },
      ],
    },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        status: "ACTIVE",
      },
    });
    categoryMap[cat.slug] = parent.id;
    console.log(`📁 Category: ${cat.name}`);

    if (cat.children) {
      for (const sub of cat.children) {
        const child = await prisma.category.upsert({
          where: { slug: sub.slug },
          update: {},
          create: {
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            sortOrder: sub.sortOrder,
            parentId: parent.id,
            status: "ACTIVE",
          },
        });
        categoryMap[sub.slug] = child.id;
        console.log(`  └─ ${sub.name}`);
      }
    }
  }

  // ── Create Sample Products ──
  const products = [
    {
      name: "iPhone 15 Plus 3D Hologram Designer Case",
      slug: "iphone-15-plus-3d-hologram-designer-case",
      description:
        "Experience premium protection with magnetic perfection. This transparent TPU case features 3D hologram design, magnetic absorption for MagSafe accessories, shockproof protection, and precise cutouts for a perfect fit. The case supports wireless charging and provides all-round lens and screen protection.",
      shortDescription: "Premium TPU case with magnetic absorption & 3D hologram design",
      price: 299,
      comparePrice: 499,
      sku: "VR-PC-001",
      stock: 50,
      categorySlug: "phone-cases-covers",
      isFeatured: true,
      isNewArrival: true,
      dispatchDays: 0,
      specifications: JSON.stringify({
        "Compatible Model": "iPhone 15 Plus",
        Material: "Thermoplastic Polyurethane (TPU)",
        Color: "Transparent",
        Theme: "3D / Hologram",
        Type: "Designer",
        "Net Quantity": "1",
      }),
      images: ["/images/products/iphone-15-plus-case-1.jpg"],
    },
    {
      name: "iPhone 15 Pro Premium PU Designer Case",
      slug: "iphone-15-pro-premium-pu-designer-case",
      description:
        "Elevate your iPhone 15 Pro with this premium PU material designer case. Features magnetic absorption, shockproof protection, wireless charging support, and precision cutouts. Comfortable grip with a lightweight and durable build for all-round protection.",
      shortDescription: "Premium PU case with magnetic absorption & comfortable grip",
      price: 449,
      comparePrice: 699,
      sku: "VR-PC-002",
      stock: 40,
      categorySlug: "phone-cases-covers",
      isFeatured: true,
      isNewArrival: true,
      dispatchDays: 0,
      specifications: JSON.stringify({
        "Compatible Model": "iPhone 15 Pro",
        Material: "PU (Premium Quality)",
        Color: "Product Dependent",
        Theme: "3D / Hologram",
        Type: "Designer",
        "Net Quantity": "1",
      }),
      images: ["/images/products/iphone-15-pro-case-1.jpg"],
    },
    {
      name: "TWS Wireless Earbuds Pro",
      slug: "tws-wireless-earbuds-pro",
      description:
        "Premium true wireless earbuds with active noise cancellation, 30-hour battery life, IPX5 water resistance, and crystal-clear sound. Perfect for music, calls, and workouts.",
      shortDescription: "ANC earbuds with 30hr battery & IPX5 water resistance",
      price: 1299,
      comparePrice: 2499,
      sku: "VR-EB-001",
      stock: 30,
      categorySlug: "earbuds-headphones",
      isFeatured: true,
      isBestSeller: true,
      dispatchDays: 1,
      specifications: JSON.stringify({
        Connectivity: "Bluetooth 5.3",
        "Battery Life": "30 Hours (with case)",
        "Water Resistance": "IPX5",
        "Noise Cancellation": "Active (ANC)",
        Driver: "13mm Dynamic",
      }),
      images: ["/images/products/tws-earbuds-1.jpg"],
    },
    {
      name: "Smart Fitness Watch Ultra",
      slug: "smart-fitness-watch-ultra",
      description:
        "Track your fitness journey with this premium smartwatch featuring AMOLED display, heart rate monitoring, SpO2, sleep tracking, 100+ sports modes, and 7-day battery life. Water-resistant and stylish.",
      shortDescription: "AMOLED smartwatch with health tracking & 7-day battery",
      price: 1999,
      comparePrice: 3999,
      sku: "VR-SW-001",
      stock: 25,
      categorySlug: "smart-watches",
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      dispatchDays: 1,
      specifications: JSON.stringify({
        Display: "1.85\" AMOLED",
        "Battery Life": "7 Days",
        "Water Resistance": "IP68",
        Sensors: "Heart Rate, SpO2, Accelerometer",
        "Sports Modes": "100+",
        Compatibility: "Android & iOS",
      }),
      images: ["/images/products/smart-watch-1.jpg"],
    },
    {
      name: "LED Desk Lamp with Wireless Charger",
      slug: "led-desk-lamp-wireless-charger",
      description:
        "Modern LED desk lamp with built-in wireless charging pad. Features 3 color temperatures, adjustable brightness, touch controls, and a sleek minimalist design. Perfect for your desk or bedside.",
      shortDescription: "Modern desk lamp with wireless charging & adjustable light",
      price: 899,
      comparePrice: 1499,
      sku: "VR-HK-001",
      stock: 20,
      categorySlug: "lighting",
      isFeatured: false,
      isNewArrival: true,
      dispatchDays: 2,
      specifications: JSON.stringify({
        "Light Source": "LED",
        "Color Temperature": "3 Modes (Warm/Natural/Cool)",
        "Wireless Charging": "15W Qi",
        Material: "ABS + Aluminum",
        Power: "USB-C",
      }),
      images: ["/images/products/desk-lamp-1.jpg"],
    },
    {
      name: "Portable Bluetooth Speaker",
      slug: "portable-bluetooth-speaker",
      description:
        "Powerful portable Bluetooth speaker with 360° surround sound, 12-hour battery, IPX7 waterproof, built-in microphone, and RGB lighting effects. Take your music anywhere.",
      shortDescription: "360° surround sound speaker with 12hr battery & IPX7",
      price: 799,
      comparePrice: 1599,
      sku: "VR-SP-001",
      stock: 35,
      categorySlug: "electronics",
      isBestSeller: true,
      dispatchDays: 1,
      specifications: JSON.stringify({
        Connectivity: "Bluetooth 5.0",
        "Battery Life": "12 Hours",
        "Water Resistance": "IPX7",
        "Output Power": "10W",
        "Special Features": "RGB Lighting, Built-in Mic",
      }),
      images: ["/images/products/bluetooth-speaker-1.jpg"],
    },
    {
      name: "Premium Sunglasses UV400",
      slug: "premium-sunglasses-uv400",
      description:
        "Stylish polarized sunglasses with UV400 protection. Lightweight metal frame with anti-glare lenses. Comes with a premium hard case and cleaning cloth.",
      shortDescription: "Polarized UV400 sunglasses with metal frame",
      price: 599,
      comparePrice: 999,
      sku: "VR-SG-001",
      stock: 45,
      categorySlug: "sunglasses",
      isNewArrival: true,
      dispatchDays: 1,
      specifications: JSON.stringify({
        "Lens Type": "Polarized",
        "UV Protection": "UV400",
        Frame: "Lightweight Metal",
        Includes: "Hard Case, Cleaning Cloth",
      }),
      images: ["/images/products/sunglasses-1.jpg"],
    },
    {
      name: "Resistance Bands Set (5 Pack)",
      slug: "resistance-bands-set-5-pack",
      description:
        "Complete set of 5 resistance bands with different tension levels. Made from premium natural latex. Includes carry bag, door anchor, and exercise guide. Perfect for home workouts.",
      shortDescription: "5 resistance levels with carry bag & exercise guide",
      price: 449,
      comparePrice: 799,
      sku: "VR-FA-001",
      stock: 60,
      categorySlug: "fitness-accessories",
      isBestSeller: true,
      dispatchDays: 1,
      specifications: JSON.stringify({
        Material: "Natural Latex",
        "Resistance Levels": "5 (X-Light to X-Heavy)",
        Includes: "5 Bands, Carry Bag, Door Anchor, Guide",
      }),
      images: ["/images/products/resistance-bands-1.jpg"],
    },
  ];

  for (const prod of products) {
    const categoryId = categoryMap[prod.categorySlug];
    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        comparePrice: prod.comparePrice,
        sku: prod.sku,
        stock: prod.stock,
        categoryId: categoryId || null,
        status: "ACTIVE",
        isFeatured: prod.isFeatured || false,
        isNewArrival: prod.isNewArrival || false,
        isBestSeller: prod.isBestSeller || false,
        specifications: prod.specifications,
        dispatchDays: prod.dispatchDays,
        seoTitle: `${prod.name} - Buy Online at VEYROVA`,
        seoDescription: prod.shortDescription,
      },
    });

    // Create product images
    for (let i = 0; i < prod.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: prod.images[i],
          altText: prod.name,
          sortOrder: i,
          isPrimary: i === 0,
        },
      });
    }

    console.log(`📦 Product: ${prod.name} (${prod.sku})`);
  }

  // ── Store Settings ──
  const settings = [
    { key: "store_name", value: "VEYROVA" },
    { key: "store_tagline", value: "All Products. All For You." },
    { key: "whatsapp_number", value: "919876543210" },
    { key: "instagram_handle", value: "veyrova.store_" },
    { key: "store_email", value: "contact@veyrova.com" },
    { key: "currency", value: "INR" },
    { key: "currency_symbol", value: "₹" },
  ];

  for (const setting of settings) {
    await prisma.storeSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("⚙️  Store settings configured");

  // ── Seed Hero Slides ──
  const heroSlides = [
    {
      id: "slide-1",
      title: "Exclusive Deals",
      subtitle: "Up to 60% Off",
      tagline: "Best Quality • Fast Delivery",
      description: "Discover amazing deals on phone cases, smart watches, earbuds, and much more. Premium quality guaranteed.",
      ctaText: "Shop Now",
      ctaLink: "/products?filter=featured",
      ctaSecondaryText: "Shop on WhatsApp",
      ctaSecondaryLink: `https://wa.me/917558002009`,
      imageUrl: "/images/products/smart-watch-1.jpg",
      imageAlt: "Featured products collection",
      active: true,
      sortOrder: 0,
    },
    {
      id: "slide-2",
      title: "New Arrivals",
      subtitle: "Just Dropped",
      tagline: "Fresh • Trendy • Premium",
      description: "Be the first to grab our latest collection. Trending products handpicked just for you — limited stock.",
      ctaText: "View New Arrivals",
      ctaLink: "/products?filter=new",
      ctaSecondaryText: "DM on Instagram",
      ctaSecondaryLink: "https://instagram.com/veyrova.store_",
      imageUrl: "/images/products/tws-earbuds-1.jpg",
      imageAlt: "New arrivals collection",
      active: true,
      sortOrder: 1,
    },
    {
      id: "slide-3",
      title: "Premium Quality",
      subtitle: "For Every Lifestyle",
      tagline: "Shop • Discover • Enjoy",
      description: "Your one-stop destination for the best products at unbeatable prices. From electronics to fashion — we have it all.",
      ctaText: "Explore All Products",
      ctaLink: "/products",
      ctaSecondaryText: "Shop on WhatsApp",
      ctaSecondaryLink: `https://wa.me/917558002009`,
      imageUrl: "/images/products/iphone-15-plus-case-1.jpg",
      imageAlt: "Premium product collection",
      active: true,
      sortOrder: 2,
    },
  ];

  await prisma.storeSetting.upsert({
    where: { key: "hero_slides" },
    update: { value: JSON.stringify(heroSlides) },
    create: { key: "hero_slides", value: JSON.stringify(heroSlides) },
  });
  console.log("🎬 Hero slides seeded (3 slides — add images from Admin → Hero Slides)");

  console.log("\n✨ Seeding complete!");
  console.log("📧 Admin login: admin@veyrova.com");
  console.log("🔑 Admin password: VeyrovaAdmin@2026");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
