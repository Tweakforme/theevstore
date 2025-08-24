/*
  Warnings:

  - Added the required column `productName` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL NOT NULL,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "usageLimitPerUser" INTEGER,
    "minimumAmount" DECIMAL,
    "startsAt" DATETIME,
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicableProducts" TEXT,
    "applicableCategories" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "promo_code_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promoCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "discountAmount" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "promo_code_usage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "promo_code_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "countries" TEXT NOT NULL,
    "provinces" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "shipping_methods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL NOT NULL,
    "freeThreshold" DECIMAL,
    "estimatedDays" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shipping_methods_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "shipping_zones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isReplied" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productSku" TEXT,
    "productImage" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_order_items" ("createdAt", "id", "orderId", "price", "productId", "quantity", "total") SELECT "createdAt", "id", "orderId", "price", "productId", "quantity", "total" FROM "order_items";
DROP TABLE "order_items";
ALTER TABLE "new_order_items" RENAME TO "order_items";
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "addresses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "addresses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("adminNotes", "billingAddressId", "createdAt", "customerNotes", "deliveredAt", "discountAmount", "fulfillmentStatus", "id", "orderNumber", "paymentStatus", "shippedAt", "shippingAddressId", "shippingAmount", "shippingMethod", "status", "stripePaymentIntentId", "subtotal", "taxAmount", "total", "trackingNumber", "trackingUrl", "updatedAt", "userId") SELECT "adminNotes", "billingAddressId", "createdAt", "customerNotes", "deliveredAt", "discountAmount", "fulfillmentStatus", "id", "orderNumber", "paymentStatus", "shippedAt", "shippingAddressId", "shippingAmount", "shippingMethod", "status", "stripePaymentIntentId", "subtotal", "taxAmount", "total", "trackingNumber", "trackingUrl", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "price" DECIMAL NOT NULL,
    "compareAtPrice" DECIMAL,
    "costPrice" DECIMAL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "trackQuantity" BOOLEAN NOT NULL DEFAULT true,
    "compatibleModels" TEXT,
    "compatibleYears" TEXT,
    "weight" DECIMAL,
    "dimensions" TEXT,
    "oeNumber" TEXT,
    "unitPacking" TEXT,
    "fullPacking" TEXT,
    "categoryId" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("categoryId", "compareAtPrice", "compatibleModels", "compatibleYears", "costPrice", "createdAt", "description", "dimensions", "fullPacking", "id", "isActive", "isFeatured", "lowStockThreshold", "metaDescription", "metaTitle", "name", "oeNumber", "price", "shortDescription", "sku", "slug", "stockQuantity", "trackQuantity", "unitPacking", "updatedAt", "weight") SELECT "categoryId", "compareAtPrice", "compatibleModels", "compatibleYears", "costPrice", "createdAt", "description", "dimensions", "fullPacking", "id", "isActive", "isFeatured", "lowStockThreshold", "metaDescription", "metaTitle", "name", "oeNumber", "price", "shortDescription", "sku", "slug", "stockQuantity", "trackQuantity", "unitPacking", "updatedAt", "weight" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON "wishlist_items"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_userId_productId_key" ON "reviews"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "promo_code_usage_promoCodeId_userId_orderId_key" ON "promo_code_usage"("promoCodeId", "userId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_zones_name_key" ON "shipping_zones"("name");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_name_key" ON "email_templates"("name");
