// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all categories (unchanged - your existing logic)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // Function to calculate total products including children
    const calculateTotalProducts = (categoryId: string, allCategories: any[]): number => {
      const category = allCategories.find(c => c.id === categoryId);
      if (!category) return 0;
      
      // Start with direct products
      let total = category._count.products;
      
      // Add products from all children recursively
      const children = allCategories.filter(c => c.parentId === categoryId);
      for (const child of children) {
        total += calculateTotalProducts(child.id, allCategories);
      }
      
      return total;
    };

    // Transform the response to include hierarchical product counts
    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: calculateTotalProducts(category.id, categories),
      directProductCount: category._count.products // Keep direct count for reference
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST create new category - UPDATED to support hierarchy
export async function POST(request: NextRequest) {
  try {
    const { name, description, parentId, level, isActive } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Validate level
    if (level && (level < 1 || level > 3)) {
      return NextResponse.json({ error: 'Category level must be between 1 and 3' }, { status: 400 });
    }

    // If parentId is provided, validate it exists and calculate level
    let calculatedLevel = level || 1;
    let validatedParentId = parentId;

    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parentCategory) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 400 });
      }

      // Calculate level based on parent
      calculatedLevel = parentCategory.level + 1;

      // Validate maximum depth
      if (calculatedLevel > 3) {
        return NextResponse.json({ 
          error: 'Maximum category depth is 3 levels (Root → Main → Sub)' 
        }, { status: 400 });
      }
    } else {
      validatedParentId = null;
      calculatedLevel = 1;
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if category with same name exists in the same parent (more specific check)
    const existing = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        parentId: validatedParentId
      }
    });

    if (existing) {
      return NextResponse.json({ 
        error: 'Category with this name already exists in the same parent category' 
      }, { status: 400 });
    }

    // Get the next sort order for this specific parent level
    const lastCategory = await prisma.category.findFirst({
      where: {
        parentId: validatedParentId
      },
      orderBy: { sortOrder: 'desc' }
    });
    const nextSortOrder = (lastCategory?.sortOrder || 0) + 1;

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug,
        description: description?.trim() || null,
        isActive: isActive !== false,
        sortOrder: nextSortOrder,
        level: calculatedLevel,
        parentId: validatedParentId
      }
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}