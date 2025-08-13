// app/api/products/bulk-import/route.ts
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
    const { data: products }: { data: ProductData[] } = await request.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const results = {
      total: products.length,
      successful: 0,
      failed: 0,
      errors: [] as ImportError[],
      categoriesCreated: [] as string[]
    };

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        // Handle category creation/finding by NAME (not ID)
        let categoryId: string;
        
        const categoryName = product.category; // This is the subcategory name from Excel
        let category = await prisma.category.findFirst({
          where: { name: categoryName }
        });

        if (!category) {
          // If subcategory not found, try to create it or use a default
          console.log(`Category not found: ${categoryName}`);
          
          // Use a default category for now
          let defaultCategory = await prisma.category.findFirst({
            where: { name: 'Model 3' }
          });
          
          if (!defaultCategory) {
            // Create a default category if none exists
            defaultCategory = await prisma.category.create({
              data: {
                name: 'Uncategorized',
                slug: 'uncategorized',
                description: 'Products without specific categories',
                level: 1,
                isActive: true,
                sortOrder: 999
              }
            });
          }
          
          categoryId = defaultCategory.id;
        } else {
          categoryId = category.id;
        }

        // Check for duplicate SKU
        const existingProduct = await prisma.product.findUnique({
          where: { sku: product.sku }
        });

        if (existingProduct) {
          results.errors.push({
            row: i + 2,
            sku: product.sku,
            message: `Product with SKU "${product.sku}" already exists`
          });
          results.failed++;
          continue;
        }

        // Create product with all the Tesla-specific data
        await prisma.product.create({
          data: {
            name: product.name,
            sku: product.sku,
            slug: product.slug,
            description: product.description || null,
            shortDescription: product.name.substring(0, 100), // First 100 chars of name
            price: product.price,
            stockQuantity: product.stockQuantity,
            lowStockThreshold: product.lowStockThreshold || 5,
            trackQuantity: product.trackQuantity !== false,
            compatibleModels: product.compatibleModels || 'MODEL_3',
            weight: product.weight || null,
            dimensions: product.dimensions || null,
            categoryId: categoryId,
            isActive: product.isActive !== false,
            isFeatured: false,
            metaTitle: product.name,
            metaDescription: product.description?.substring(0, 160) || null
          }
        });

        results.successful++;

      } catch (error) {
        console.error(`Error creating product ${product.sku}:`, error);
        results.errors.push({
          row: i + 2,
          sku: product.sku,
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        results.failed++;
      }
    }

    return NextResponse.json({
      ...results,
      message: `Successfully imported ${results.successful} products. Created ${results.categoriesCreated.length} new categories.`
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ 
      error: 'Failed to import products' 
    }, { status: 500 });
  }
}