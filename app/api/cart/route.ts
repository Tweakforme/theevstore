// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route'; // ADD authOptions import

const prisma = new PrismaClient();

// Get cart items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // ADD authOptions here
    
    if (!session?.user?.id) {
      // For guest users, return empty cart (frontend will handle localStorage)
      return NextResponse.json({ items: [] });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
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

    return NextResponse.json({ items: cartItems });

  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // ADD authOptions here
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Cart clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}