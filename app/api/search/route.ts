// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'relevance';
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '99999');
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];

    if (!query.trim()) {
      return NextResponse.json({ products: [], total: 0 });
    }

    // Build where clause for search
    const whereClause: any = {
      isActive: true,
      price: {
        gte: minPrice,
        lte: maxPrice === 99999 ? undefined : maxPrice
      },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { compatibleModels: { contains: query, mode: 'insensitive' } }
      ]
    };

    // Filter by categories if specified
    if (categories.length > 0) {
      whereClause.category = {
        name: { in: categories }
      };
    }

    // Build order clause
    let orderBy: any = { createdAt: 'desc' }; // default
    
    switch (sort) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      // For 'relevance' and others, use default
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        }
      },
      orderBy,
      take: 50 // Limit results
    });

    // Transform the data to match the expected format
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
      description: product.description,
      images: product.images,
      stockQuantity: product.stockQuantity,
      category: {
        name: product.category.name,
        slug: product.category.slug
      },
      compatibleModels: product.compatibleModels,
      // Add mock rating data for now
      rating: Math.random() * 2 + 3, // 3-5 stars
      reviewCount: Math.floor(Math.random() * 50) + 1
    }));

    return NextResponse.json({
      products: transformedProducts,
      total: transformedProducts.length,
      query,
      filters: {
        categories,
        priceRange: [minPrice, maxPrice],
        sort
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', products: [], total: 0 },
      { status: 500 }
    );
  }
}