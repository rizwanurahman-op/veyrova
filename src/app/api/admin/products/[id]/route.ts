import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        shortDescription: body.shortDescription || null,
        price: body.price,
        comparePrice: body.comparePrice || null,
        sku: body.sku || null,
        stock: body.stock || 0,
        categoryId: body.categoryId || null,
        status: body.status,
        isFeatured: body.isFeatured || false,
        isNewArrival: body.isNewArrival || false,
        isBestSeller: body.isBestSeller || false,
        specifications: body.specifications || null,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        dispatchDays: body.dispatchDays || 0,
      },
    });

    // Update images: delete existing, create new
    if (body.images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (body.images.length > 0) {
        await prisma.productImage.createMany({
          data: body.images.map((img: { url: string; altText: string; sortOrder: number; isPrimary: boolean }) => ({
            productId: id,
            url: img.url,
            altText: img.altText || product.name,
            sortOrder: img.sortOrder || 0,
            isPrimary: img.isPrimary || false,
          })),
        });
      }
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete images first
    await prisma.productImage.deleteMany({ where: { productId: id } });
    // Delete the product
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
