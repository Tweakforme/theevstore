// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...category,
      productCount: category._count.products
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, isActive } = await request.json();

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updateData: any = {};

    // Update name and slug if name is provided
    if (name && name.trim().length > 0) {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if another category has the same name/slug
      const duplicate = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                { name: name.trim() },
                { slug: slug }
              ]
            }
          ]
        }
      });

      if (duplicate) {
        return NextResponse.json({ 
          error: 'Another category with this name already exists' 
        }, { status: 400 });
      }

      updateData.name = name.trim();
      updateData.slug = slug;
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: params.id }
    });

    if (productCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category with ${productCount} products. Move products to another category first.` 
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}