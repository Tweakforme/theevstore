// app/api/wishlist/toggle/route.ts
// This is a cleaner API route that handles both add and remove in one endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
      where: { id: productId },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        }
      }
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
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id }
      });

      return NextResponse.json({ 
        action: 'removed',
        message: 'Item removed from wishlist'
      });
    } else {
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

      return NextResponse.json({ 
        action: 'added',
        message: 'Item added to wishlist',
        item: wishlistItem
      });
    }

  } catch (error) {
    console.error('Wishlist toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle wishlist item' },
      { status: 500 }
    );
  }
}