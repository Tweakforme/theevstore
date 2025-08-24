// app/api/categories/clean-all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 Starting complete category cleanup...');

    // Get counts before deletion
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    
    console.log(`📊 Found ${productCount} products and ${categoryCount} categories`);

    if (productCount > 0) {
      return NextResponse.json({
        error: `Cannot delete categories while ${productCount} products exist. Delete products first or they will become orphaned.`,
        suggestion: 'Use the bulk delete products feature first, then clean categories.'
      }, { status: 400 });
    }

    if (categoryCount === 0) {
      return NextResponse.json({ 
        message: 'No categories to delete',
        deleted: { categories: 0 }
      });
    }

    // Delete all categories (this will cascade properly since no products exist)
    const deletedCategories = await prisma.category.deleteMany({});

    console.log(`✅ Deleted ${deletedCategories.count} categories`);

    return NextResponse.json({ 
      success: true,
      message: `🎉 Successfully cleaned all categories!`,
      deleted: {
        categories: deletedCategories.count
      }
    });

  } catch (error) {
    console.error('❌ Error cleaning categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clean categories: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}