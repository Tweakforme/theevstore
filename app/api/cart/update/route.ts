// app/api/cart/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { itemId, quantity } = await request.json();

    if (!itemId || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid item ID or quantity' },
        { status: 400 }
      );
    }

    // Check if cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id
      },
      include: { product: true }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Check stock availability
    if (quantity > cartItem.product.stockQuantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: {
            category: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1
            }
          }
        }
      }
    });

    return NextResponse.json({ item: updatedItem });

  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}