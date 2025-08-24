// app/api/products/bulk-import/route.ts - ENHANCED VERSION WITH SMART MODEL DETECTION
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductData {
  name: string;
  sku: string;
  price: number;
  description?: string;
  stockQuantity: number;
  category: string;
  subcategory?: string;
  compatibleModels?: string;
  weight?: number;
  dimensions?: string;
  slug: string;
  isActive: boolean;
  trackQuantity: boolean;
  lowStockThreshold: number;
  oeNumber?: string;
  unitPacking?: string;
  fullPacking?: string;
}

interface ImportError {
  row: number;
  sku?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const { data: products, detectedModel }: { data: ProductData[]; detectedModel?: string } = await request.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const results = {
      total: products.length,
      successful: 0,
      failed: 0,
      errors: [] as ImportError[],
      categoriesCreated: [] as string[],
      skippedDuplicates: 0,
      detectedModel: detectedModel || 'MODEL_3'
    };

    console.log(`🚀 Starting bulk import of ${products.length} products for ${results.detectedModel}...`);

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        // 🔥 CRITICAL: Validate required fields FIRST
        const validationErrors: string[] = [];
        
        if (!product.name || product.name.trim() === '') {
          validationErrors.push('Product name is required');
        }
        
        if (!product.sku || product.sku.trim() === '') {
          validationErrors.push('SKU is required');
        }
        
        if (product.price === undefined || product.price === null || isNaN(product.price) || product.price < 0) {
          validationErrors.push(`Invalid price: "${product.price}". Must be 0 or greater (use 0 for items without pricing).`);
        }

        if (validationErrors.length > 0) {
          results.errors.push({
            row: i + 2,
            sku: product.sku || 'UNKNOWN',
            message: validationErrors.join(', ')
          });
          results.failed++;
          continue;
        }

        // Clean and prepare data
        const cleanName = product.name.trim();
        const cleanSku = product.sku.trim();
        const validPrice = parseFloat(product.price.toString());

        // 🔥 SMART CATEGORY MATCHING - FIXED FOR MODEL Y
        let categoryId: string;

        // Use subcategory if available, otherwise main category
        const rawCategoryName = product.subcategory || product.category;
        console.log(`🔍 Looking for category: "${rawCategoryName}"`);

        // Try exact match first
        let category = await prisma.category.findFirst({
          where: { 
            name: {
              equals: rawCategoryName
            }
          }
        });

        if (!category) {
          console.log(`❌ Exact match failed for "${rawCategoryName}"`);
          
          // Try partial matching - look for categories that END with the raw name
          // This handles "Model Y - 10 - BODY" matching "10 - BODY"
          const possibleMatches = await prisma.category.findMany({
            where: {
              name: {
                contains: rawCategoryName
              }
            }
          });
          
          if (possibleMatches.length > 0) {
            category = possibleMatches[0];
            console.log(`✅ Found partial match: "${rawCategoryName}" → "${category.name}"`);
          } else {
            console.log(`❌ No partial matches found for "${rawCategoryName}"`);
          }
        }

        if (!category) {
          // Create category if it doesn't exist
          console.log(`🆕 Creating new category: ${rawCategoryName}`);
          
          try {
            const slug = rawCategoryName.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

            category = await prisma.category.create({
              data: {
                name: rawCategoryName,
                slug: slug,
                description: `Auto-created category for ${rawCategoryName} (${detectedModel?.replace('_', ' ')})`,
                level: 1,
                isActive: true,
                sortOrder: 999
              }
            });
            
            results.categoriesCreated.push(rawCategoryName);
          } catch (categoryError) {
            // If category creation fails, use a default
            console.error(`❌ Failed to create category "${rawCategoryName}":`, categoryError);
            
            let defaultCategory = await prisma.category.findFirst({
              where: { name: 'Uncategorized' }
            });
            
            if (!defaultCategory) {
              defaultCategory = await prisma.category.create({
                data: {
                  name: 'Uncategorized',
                  slug: 'uncategorized',
                  description: 'Products without specific categories',
                  level: 1,
                  isActive: true,
                  sortOrder: 9999
                }
              });
            }
            
            category = defaultCategory;
          }
        }
        
        categoryId = category.id;

        // Check for duplicate SKU
        const existingProduct = await prisma.product.findUnique({
          where: { sku: cleanSku }
        });

        if (existingProduct) {
          console.log(`⚠️  Skipping duplicate SKU: ${cleanSku}`);
          results.errors.push({
            row: i + 2,
            sku: cleanSku,
            message: `Product with SKU "${cleanSku}" already exists`
          });
          results.skippedDuplicates++;
          results.failed++;
          continue;
        }

        // Generate slug from name
        const slug = cleanName.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // 🚀 USE DETECTED MODEL - This is the key fix!
        let compatibleModels = detectedModel || 'MODEL_3';
        
        // Override if explicitly provided in the product data
        if (product.compatibleModels) {
          compatibleModels = product.compatibleModels;
        }

        // 🔥 CREATE PRODUCT WITH DETECTED MODEL
        const createdProduct = await prisma.product.create({
          data: {
            name: cleanName,
            sku: cleanSku,
            slug: slug,
            description: product.description?.trim() || `OE: ${product.oeNumber || 'N/A'}`,
            shortDescription: cleanName.substring(0, 100),
            price: validPrice,
            stockQuantity: product.stockQuantity || 10,
            lowStockThreshold: product.lowStockThreshold || 5,
            trackQuantity: product.trackQuantity !== false,
            compatibleModels: compatibleModels, // 🚀 This now uses the detected model!
            weight: product.weight || null,
            dimensions: product.dimensions || null,
            categoryId: categoryId,
            isActive: product.isActive !== false,
            isFeatured: false,
            metaTitle: cleanName,
            metaDescription: (product.description?.substring(0, 160) || cleanName).trim()
          }
        });

        console.log(`✅ Created: ${createdProduct.name} | ${createdProduct.price} | ${compatibleModels}`);
        results.successful++;

      } catch (error) {
        console.error(`❌ Error creating product ${product.sku}:`, error);
        results.errors.push({
          row: i + 2,
          sku: product.sku || 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        results.failed++;
      }
    }

    // Summary
    console.log(`🎉 Import completed for ${results.detectedModel}: ${results.successful}/${results.total} successful`);

    return NextResponse.json({
      ...results,
      message: `Import completed for ${results.detectedModel.replace('_', ' ')}! ✅ ${results.successful} successful, ❌ ${results.failed} failed, 🆕 ${results.categoriesCreated.length} categories created.`
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ 
      error: 'Failed to import products: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}