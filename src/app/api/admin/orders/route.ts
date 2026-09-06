import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/orders — list all orders
export async function GET() {
  try {
    const orders = await prisma.orderEnquiry.findMany({
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/admin/orders — create a new order enquiry manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate next order number: VR-1001, VR-1002, ...
    const lastOrder = await prisma.orderEnquiry.findFirst({
      orderBy: { createdAt: "desc" },
    });
    const lastNum = lastOrder
      ? parseInt(lastOrder.orderNumber.replace("VR-", "")) + 1
      : 1001;
    const orderNumber = `VR-${lastNum}`;

    // Calculate total from items
    const items: { productId: string; quantity: number; price: number }[] =
      body.items || [];
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.orderEnquiry.create({
      data: {
        orderNumber,
        source: body.source || "WHATSAPP",
        status: "NEW",
        totalAmount,
        customerName: body.customerName || null,
        customerPhone: body.customerPhone || null,
        customerEmail: body.customerEmail || null,
        customerAddress: body.customerAddress || null,
        notes: body.notes || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
