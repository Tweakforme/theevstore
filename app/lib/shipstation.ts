// 2. Function to send new orders to ShipStation
// app/lib/shipstation.ts

export async function sendOrderToShipStation(order: any) {
  try {
    const shipstationOrder = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      orderStatus: 'awaiting_shipment',
      customerUsername: order.shippingEmail,
      customerEmail: order.shippingEmail,
      
      billTo: {
        name: `${order.billingFirstName} ${order.billingLastName}`,
        street1: order.billingAddress1,
        city: order.billingCity,
        state: order.billingProvince,
        postalCode: order.billingPostal,
        country: order.billingCountry,
        phone: order.shippingPhone
      },
      
      shipTo: {
        name: `${order.shippingFirstName} ${order.shippingLastName}`,
        street1: order.shippingAddress1,
        city: order.shippingCity,
        state: order.shippingProvince,
        postalCode: order.shippingPostal,
        country: order.shippingCountry,
        phone: order.shippingPhone
      },
      
      items: order.items.map((item: any) => ({
        sku: item.product.sku,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        weight: {
          value: item.product.weight || 1,
          units: 'grams'
        }
      })),
      
      amountPaid: order.total,
      shippingAmount: order.shippingAmount,
      taxAmount: order.taxAmount,
      
      requestedShippingService: 'Canada Post',
      packageCode: 'package',
      confirmation: 'none',
      
      customerNotes: order.customerNotes || '',
      internalNotes: `Stripe Payment ID: ${order.stripePaymentIntentId}`,
      
      gift: false,
      giftMessage: ''
    };

    const response = await fetch('https://ssapi.shipstation.com/orders/createorder', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.SHIPSTATION_API_KEY}:${process.env.SHIPSTATION_API_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shipstationOrder)
    });

    const result = await response.json();
    
    if (response.ok) {
      // Update order with ShipStation ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          // Add shipstationOrderId field to your schema if needed
          adminNotes: `ShipStation Order ID: ${result.orderId}`
        }
      });
      
      console.log('Order sent to ShipStation:', result.orderId);
    } else {
      console.error('ShipStation error:', result);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending order to ShipStation:', error);
    throw error;
  }
}