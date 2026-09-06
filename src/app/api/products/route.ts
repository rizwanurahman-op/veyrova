import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products - Get products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const filter = searchParams.get("filter"); // featured, new, bestseller
    const sort = searchParams.get("sort"); // price-asc, price-desc, newest
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (category) {
      // Find the category and all its subcategories
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        include: { children: true },
      });

      if (cat) {
        const categoryIds = [cat.id, ...cat.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    if (filter === "featured") where.isFeatured = true;
    if (filter === "new") where.isNewArrival = true;
    if (filter === "bestseller") where.isBestSeller = true;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { shortDescription: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };
    if (sort === "newest") orderBy = { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
