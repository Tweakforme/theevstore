// app/api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      currency = 'cad', 
      cartItems, 
      shippingInfo, 
      billingInfo, 
      isGuest 
    } = await request.json();

    // Validate amount
    if (!amount || amount < 50) { // Minimum $0.50 CAD
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        isGuest: isGuest.toString(),
        customerEmail: shippingInfo.email,
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        itemCount: cartItems.length.toString(),
        shippingCity: shippingInfo.city,
        shippingProvince: shippingInfo.province,
      },
      description: `Tesla Parts Order - ${cartItems.length} item(s)`,
      shipping: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        phone: shippingInfo.phone,
        address: {
          line1: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.province,
          postal_code: shippingInfo.postalCode,
          country: shippingInfo.country.toLowerCase(),
        },
      },
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });

  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}