import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// POST /api/admin/products - Create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = createSlug(body.name);

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: finalSlug,
        description: body.description || null,
        shortDescription: body.shortDescription || null,
        price: body.price,
        comparePrice: body.comparePrice || null,
        sku: body.sku || null,
        stock: body.stock || 0,
        categoryId: body.categoryId || null,
        status: body.status || "DRAFT",
        isFeatured: body.isFeatured || false,
        isNewArrival: body.isNewArrival || false,
        isBestSeller: body.isBestSeller || false,
        specifications: body.specifications || null,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        dispatchDays: body.dispatchDays || 0,
      },
    });

    // Create images
    if (body.images && body.images.length > 0) {
      await prisma.productImage.createMany({
        data: body.images.map((img: { url: string; altText: string; sortOrder: number; isPrimary: boolean }) => ({
          productId: product.id,
          url: img.url,
          altText: img.altText || product.name,
          sortOrder: img.sortOrder || 0,
          isPrimary: img.isPrimary || false,
        })),
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
