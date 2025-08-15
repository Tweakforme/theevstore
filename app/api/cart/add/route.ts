// app/api/cart/add/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
    }

    // Verify product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        id: true, 
        name: true, 
        price: true, 
        stockQuantity: true,
        isActive: true 
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json({ error: 'Product is not available' }, { status: 400 });
    }

    if (product.stockQuantity < quantity) {
      return NextResponse.json({ 
        error: `Only ${product.stockQuantity} items available` 
      }, { status: 400 });
    }

    // For now, we'll just return success without persisting to database
    // In a real implementation, you'd save to cart table or session
    if (session?.user?.id) {
      // Authenticated user - save to database cart
      // Implementation depends on your cart schema
      
      // Example cart logic:
      // const existingCartItem = await prisma.cartItem.findFirst({
      //   where: {
      //     userId: session.user.id,
      //     productId: productId
      //   }
      // });

      // if (existingCartItem) {
      //   await prisma.cartItem.update({
      //     where: { id: existingCartItem.id },
      //     data: { quantity: existingCartItem.quantity + quantity }
      //   });
      // } else {
      //   await prisma.cartItem.create({
      //     data: {
      //       userId: session.user.id,
      //       productId: productId,
      //       quantity: quantity
      //     }
      //   });
      // }
    } else {
      // Guest user - would typically use session storage or cookies
      // For now, just return success
    }

    return NextResponse.json({
      success: true,
      message: `Added ${quantity} ${product.name} to cart`,
      product: {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: quantity
      }
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}