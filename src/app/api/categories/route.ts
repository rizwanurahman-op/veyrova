import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categories - Get all categories with hierarchy
export async function GET() {
  try {
    // Fetch top-level categories with their children
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        status: "ACTIVE",
      },
      include: {
        children: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
