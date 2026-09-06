import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const HERO_KEY = "hero_slides";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  imageUrl: string;
  imageAlt?: string;
  active: boolean;
  sortOrder: number;
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    title: "Exclusive Deals",
    subtitle: "Up to 60% Off",
    tagline: "Best Quality • Fast Delivery",
    description: "Discover amazing deals on phone cases, smart watches, earbuds, and much more. Premium quality guaranteed.",
    ctaText: "Shop Now",
    ctaLink: "/products?filter=featured",
    ctaSecondaryText: "Shop on WhatsApp",
    ctaSecondaryLink: "https://wa.me/919876543210",
    imageUrl: "",
    imageAlt: "Featured products",
    active: true,
    sortOrder: 0,
  },
  {
    id: "slide-2",
    title: "New Arrivals",
    subtitle: "Just Dropped",
    tagline: "Fresh • Trendy • Premium",
    description: "Be the first to grab our latest collection. Trending products handpicked for you.",
    ctaText: "View New Arrivals",
    ctaLink: "/products?filter=new",
    ctaSecondaryText: "DM on Instagram",
    ctaSecondaryLink: "https://instagram.com/veyrova.store_",
    imageUrl: "",
    imageAlt: "New arrivals",
    active: true,
    sortOrder: 1,
  },
];

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: HERO_KEY },
    });

    if (!setting) {
      return NextResponse.json({ slides: DEFAULT_SLIDES });
    }

    const slides = JSON.parse(setting.value) as HeroSlide[];
    return NextResponse.json({ slides });
  } catch {
    return NextResponse.json({ slides: DEFAULT_SLIDES });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slides } = await request.json();

    await prisma.storeSetting.upsert({
      where: { key: HERO_KEY },
      update: { value: JSON.stringify(slides) },
      create: { key: HERO_KEY, value: JSON.stringify(slides) },
    });

    return NextResponse.json({ success: true, slides });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save hero slides" }, { status: 500 });
  }
}
