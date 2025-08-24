// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all orders (both guest and user orders)
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match the admin interface expectations
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      total: Number(order.total),
      shippingFirstName: order.shippingFirstName || '',
      shippingLastName: order.shippingLastName || '',
      shippingEmail: order.shippingEmail || order.user?.email || '',
      isGuest: order.isGuest,
      createdAt: order.createdAt.toISOString(),
      trackingNumber: order.trackingNumber,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price)
      }))
    }));

    return NextResponse.json({ orders: transformedOrders });

  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// PUT method to update order status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { orderId, status, trackingNumber, adminNotes } = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status }),
        ...(trackingNumber && { trackingNumber }),
        ...(adminNotes && { adminNotes }),
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() })
      }
    });

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}