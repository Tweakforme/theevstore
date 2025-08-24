// app/api/cart/promo/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Promo code required' },
        { status: 400 }
      );
    }

    // Mock promo codes for now - replace with database lookup
    const promoCodes: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
      'TESLA10': { discount: 10, type: 'percentage' },
      'WELCOME': { discount: 25, type: 'fixed' },
      'FREESHIP': { discount: 15, type: 'fixed' },
      'SAVE20': { discount: 20, type: 'percentage' }
    };

    const promoInfo = promoCodes[code.toUpperCase()];

    if (!promoInfo) {
      return NextResponse.json(
        { success: false, error: 'Invalid promo code' },
        { status: 400 }
      );
    }

    // For simplicity, return fixed discount amount
    // In a real app, you'd calculate based on cart total and type
    const discountAmount = promoInfo.type === 'percentage' 
      ? promoInfo.discount // This would be calculated as percentage of cart total
      : promoInfo.discount;

    return NextResponse.json({
      success: true,
      code: code.toUpperCase(),
      discount: discountAmount,
      type: promoInfo.type
    });

  } catch (error) {
    console.error('Promo code error:', error);
    return NextResponse.json(
      { error: 'Failed to apply promo code' },
      { status: 500 }
    );
  }
}