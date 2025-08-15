import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // First, ensure the category exists
    let category = await prisma.category.findUnique({
      where: { slug: data.category }
    });

    if (!category) {
      // Create the category if it doesn't exist
      category = await prisma.category.create({
        data: {
          name: data.category.charAt(0).toUpperCase() + data.category.slice(1),
          slug: data.category,
          description: `${data.category.charAt(0).toUpperCase() + data.category.slice(1)} parts for Tesla vehicles`,
        }
      });
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        slug: slug,
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        weight: data.weight ? parseFloat(data.weight) : null,
        dimensions: data.dimensions || null,
        categoryId: category.id,
        compatibleModels: data.compatibleModels ? data.compatibleModels.join(',') : null,
        isActive: true,
        isFeatured: false,
      }
    });

    // Add product images if provided
    if (data.images && data.images.length > 0) {
      await prisma.productImage.createMany({
        data: data.images.map((url: string, index: number) => ({
          productId: product.id,
          url: url,
          sortOrder: index,
          altText: `${product.name} - Image ${index + 1}`,
        }))
      });
    }

    return NextResponse.json({ 
      success: true, 
      product: product 
    });

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// UPDATED GET function with query parameter support
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const exclude = searchParams.get('exclude');
    
    // Build the where clause
    const where: any = {
      isActive: true // Only show active products
    };
    
    // Filter by category if provided
    if (category) {
      where.categoryId = category;
    }
    
    // Exclude specific product if provided
    if (exclude) {
      where.NOT = {
        id: exclude
      };
    }
    
    // Build the query options
    const queryOptions: any = {
      where,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    };
    
    // Add limit if provided
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        queryOptions.take = limitNum;
      }
    }

    const products = await prisma.product.findMany(queryOptions);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}