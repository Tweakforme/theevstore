-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'UNFULFILLED',
    "shippingAddressId" TEXT,
    "billingAddressId" TEXT,
    "shippingFirstName" TEXT,
    "shippingLastName" TEXT,
    "shippingEmail" TEXT,
    "shippingPhone" TEXT,
    "shippingAddress1" TEXT,
    "shippingAddress2" TEXT,
    "shippingCity" TEXT,
    "shippingProvince" TEXT,
    "shippingPostal" TEXT,
    "shippingCountry" TEXT,
    "billingFirstName" TEXT,
    "billingLastName" TEXT,
    "billingAddress1" TEXT,
    "billingAddress2" TEXT,
    "billingCity" TEXT,
    "billingProvince" TEXT,
    "billingPostal" TEXT,
    "billingCountry" TEXT,
    "subtotal" DECIMAL NOT NULL,
    "taxAmount" DECIMAL NOT NULL,
    "shippingAmount" DECIMAL NOT NULL,
    "discountAmount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL,
    "promoCode" TEXT,
    "promoDiscount" DECIMAL NOT NULL DEFAULT 0,
    "stripePaymentIntentId" TEXT,
    "paymentMethod" TEXT,
    "shippingMethod" TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "estimatedDelivery" DATETIME,
    "customerNotes" TEXT,
    "adminNotes" TEXT,
    "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "shippingSent" BOOLEAN NOT NULL DEFAULT false,
    "deliverySent" BOOLEAN NOT NULL DEFAULT false,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "addresses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "addresses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("adminNotes", "billingAddress1", "billingAddress2", "billingAddressId", "billingCity", "billingCountry", "billingFirstName", "billingLastName", "billingPostal", "billingProvince", "confirmationSent", "createdAt", "customerNotes", "deliveredAt", "deliverySent", "discountAmount", "estimatedDelivery", "fulfillmentStatus", "id", "orderNumber", "paymentMethod", "paymentStatus", "promoCode", "promoDiscount", "shippedAt", "shippingAddress1", "shippingAddress2", "shippingAddressId", "shippingAmount", "shippingCity", "shippingCountry", "shippingEmail", "shippingFirstName", "shippingLastName", "shippingMethod", "shippingPhone", "shippingPostal", "shippingProvince", "shippingSent", "status", "stripePaymentIntentId", "subtotal", "taxAmount", "total", "trackingNumber", "trackingUrl", "updatedAt", "userId") SELECT "adminNotes", "billingAddress1", "billingAddress2", "billingAddressId", "billingCity", "billingCountry", "billingFirstName", "billingLastName", "billingPostal", "billingProvince", "confirmationSent", "createdAt", "customerNotes", "deliveredAt", "deliverySent", "discountAmount", "estimatedDelivery", "fulfillmentStatus", "id", "orderNumber", "paymentMethod", "paymentStatus", "promoCode", "promoDiscount", "shippedAt", "shippingAddress1", "shippingAddress2", "shippingAddressId", "shippingAmount", "shippingCity", "shippingCountry", "shippingEmail", "shippingFirstName", "shippingLastName", "shippingMethod", "shippingPhone", "shippingPostal", "shippingProvince", "shippingSent", "status", "stripePaymentIntentId", "subtotal", "taxAmount", "total", "trackingNumber", "trackingUrl", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
