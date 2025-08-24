// app/api/cart/remove/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Add this import
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // Add authOptions
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID required' },
        { status: 400 }
      );
    }

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Remove the item
    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Cart remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}