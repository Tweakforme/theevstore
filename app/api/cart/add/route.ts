// app/api/cart/add/route.ts - Updated to support guest carts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { 
        id: productId,
        isActive: true 
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or unavailable' },
        { status: 404 }
      );
    }

    // Check stock
    if (product.stockQuantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock available' },
        { status: 400 }
      );
    }

    // If user is logged in, save to database
    if (session?.user?.id) {
      // Check if item already exists in cart
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          userId: session.user.id,
          productId: productId
        }
      });

      let cartItem;

      if (existingCartItem) {
        // Update quantity if item exists
        const newQuantity = existingCartItem.quantity + quantity;
        
        if (newQuantity > product.stockQuantity) {
          return NextResponse.json(
            { error: `Only ${product.stockQuantity} items available` },
            { status: 400 }
          );
        }

        cartItem = await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: newQuantity },
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
      } else {
        // Create new cart item
        cartItem = await prisma.cartItem.create({
          data: {
            userId: session.user.id,
            productId: productId,
            quantity: quantity
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
      }

      // Get total cart count for logged-in user
      const cartCount = await prisma.cartItem.aggregate({
        where: { userId: session.user.id },
        _sum: { quantity: true }
      });

      return NextResponse.json({
        success: true,
        message: 'Item added to cart successfully',
        cartItem,
        cartCount: cartCount._sum.quantity || 0,
        isGuest: false
      });

    } else {
      // For guest users, just return success (frontend will handle localStorage)
      return NextResponse.json({
        success: true,
        message: 'Item added to cart successfully',
        product: {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          stockQuantity: product.stockQuantity
        },
        quantity,
        isGuest: true
      });
    }

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}