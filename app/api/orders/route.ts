// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Generate a unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EVS-${timestamp.slice(-6)}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { 
      paymentIntentId, 
      items, 
      shipping, 
      billing, 
      isGuest 
    } = await request.json();

    // Verify the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.product.price * item.quantity), 0
    );
    const shippingCost = subtotal >= 200 ? 0 : 15.99;
    const tax = subtotal * 0.12;
    const total = subtotal + shippingCost + tax;

    // Verify the amount matches
    const expectedAmount = Math.round(total * 100); // Convert to cents
    if (paymentIntent.amount !== expectedAmount) {
      return NextResponse.json(
        { error: 'Payment amount mismatch' },
        { status: 400 }
      );
    }

    // Generate unique order number
    let orderNumber: string;
    let isUnique = false;
    do {
      orderNumber = generateOrderNumber();
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber }
      });
      isUnique = !existingOrder;
    } while (!isUnique);

    // Create order in database using your existing schema
    const order = await prisma.order.create({
      data: {
        orderNumber,
        
        // User ID (null for guest orders)
        userId: isGuest ? null : session?.user?.id || null,
        
        // Order status
        status: 'PENDING', // Adjust based on your OrderStatus enum
        paymentStatus: 'PAID', // Adjust based on your PaymentStatus enum
        fulfillmentStatus: 'UNFULFILLED', // Adjust based on your FulfillmentStatus enum
        
        // Pricing using Decimal
        subtotal: subtotal,
        taxAmount: tax,
        shippingAmount: shippingCost,
        discountAmount: 0,
        total: total,
        
        // Payment information
        stripePaymentIntentId: paymentIntent.id,
        paymentMethod: 'credit_card',
        
        // Shipping information (using your field names)
        shippingFirstName: shipping.firstName,
        shippingLastName: shipping.lastName,
        shippingEmail: shipping.email,
        shippingPhone: shipping.phone,
        shippingAddress1: shipping.address, // Note: using address1 from your schema
        shippingCity: shipping.city,
        shippingProvince: shipping.province,
        shippingPostal: shipping.postalCode, // Note: using shippingPostal from your schema
        shippingCountry: shipping.country,
        
        // Billing information (using your field names)
        billingFirstName: billing.firstName,
        billingLastName: billing.lastName,
        billingAddress1: billing.address, // Note: using address1 from your schema
        billingCity: billing.city,
        billingProvince: billing.province,
        billingPostal: billing.postalCode, // Note: using billingPostal from your schema
        billingCountry: billing.country,
        
        // Guest order flag
        isGuest: isGuest,
        
        // Order items (assuming you have OrderItem model)
        items: {
          create: items.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
            // Add other OrderItem fields as needed
          }))
        }
      },
      include: {
        items: true
      }
    });

    // If user is logged in, clear their cart
    if (!isGuest && session?.user?.id) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id }
      });
    }

    // MOVED: Send order to ShipStation after successful creation
    try {
      // await sendOrderToShipStation(order);
      console.log('Order created successfully:', order.orderNumber);
      // TODO: Implement ShipStation integration
    } catch (error) {
      console.error('Failed to send order to ShipStation:', error);
      // Order still created successfully, just log the error
    }

    // Send confirmation email 
    // await sendOrderConfirmationEmail(order);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET method to retrieve orders for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { 
        userId: session.user.id,
        isGuest: false 
      },
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}