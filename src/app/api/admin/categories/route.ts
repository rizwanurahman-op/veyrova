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

// POST /api/admin/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = createSlug(body.name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: finalSlug,
        description: body.description || null,
        parentId: body.parentId || null,
        sortOrder: body.sortOrder || 0,
        status: body.status || "ACTIVE",
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
