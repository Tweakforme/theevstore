// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get wishlist items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ items: [] });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ items: wishlistItems });

  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: session.user.id,
        productId: productId
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 400 }
      );
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId: productId
      },
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

    return NextResponse.json({ item: wishlistItem });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// app/api/wishlist/remove/route.ts
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
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

    // Verify the wishlist item belongs to the user
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id
      }
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    // Remove the item
    await prisma.wishlistItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}