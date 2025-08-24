// 1. Install ShipStation webhook handler
// app/api/webhooks/shipstation/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json();
    const { resource_type, resource_url } = webhook;

    // Handle different ShipStation webhook events
    switch (resource_type) {
      case 'ITEM_ORDER_NOTIFY':
        // New order needs to be sent to ShipStation
        await handleNewOrder(resource_url);
        break;
        
      case 'ITEM_SHIP_NOTIFY':
        // Order has been shipped
        await handleShipment(resource_url);
        break;
        
      case 'ITEM_ORDER_RESTORE':
        // Order restored from archive
        await handleOrderRestore(resource_url);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ShipStation webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

async function handleNewOrder(resourceUrl: string) {
  // ShipStation is requesting order details
  // This happens when you configure the webhook
}

async function handleShipment(resourceUrl: string) {
  try {
    // Extract order info from ShipStation
    const shipmentData = await fetchShipStationData(resourceUrl);
    
    // Update order in your database
    await prisma.order.update({
      where: { orderNumber: shipmentData.orderNumber },
      data: {
        status: 'SHIPPED',
        trackingNumber: shipmentData.trackingNumber,
        trackingUrl: shipmentData.trackingUrl,
        shippedAt: new Date(shipmentData.shipDate),
        fulfillmentStatus: 'FULFILLED'
      }
    });

    // Send customer notification (optional - ShipStation can do this)
    // await sendShippingNotification(shipmentData);
    
  } catch (error) {
    console.error('Error handling shipment:', error);
  }
}

async function fetchShipStationData(resourceUrl: string) {
  // Fetch data from ShipStation API
  const response = await fetch(resourceUrl, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.SHIPSTATION_API_KEY}:${process.env.SHIPSTATION_API_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}
