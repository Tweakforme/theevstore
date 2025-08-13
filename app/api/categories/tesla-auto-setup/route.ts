// app/api/categories/tesla-auto-setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryNode {
  name: string;
  description: string;
  children?: CategoryNode[];
}

export async function POST(request: NextRequest) {
  try {
    const { hierarchy }: { hierarchy: CategoryNode } = await request.json();

    if (!hierarchy) {
      return NextResponse.json({ error: 'Invalid hierarchy data' }, { status: 400 });
    }

    let totalCreated = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    // Get all existing categories to check for duplicates
    const existingCategories = await prisma.category.findMany({
      select: { name: true }
    });
    const existingNames = new Set(existingCategories.map(cat => cat.name));

    // Get starting sort order
    const lastCategory = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' }
    });
    let sortOrder = (lastCategory?.sortOrder || 0) + 1;

    // Recursive function to create category hierarchy
    async function createCategory(
      categoryData: CategoryNode, 
      parentId: string | null = null, 
      level: number = 1
    ): Promise<string | null> {
      try {
        // Check if category already exists
        if (existingNames.has(categoryData.name)) {
          console.log(`Skipping existing category: ${categoryData.name}`);
          totalSkipped++;
          
          // Find the existing category ID for children
          const existingCategory = await prisma.category.findFirst({
            where: { name: categoryData.name }
          });
          
          // Still process children even if parent exists
          if (categoryData.children && categoryData.children.length > 0) {
            for (const child of categoryData.children) {
              await createCategory(child, existingCategory?.id || null, level + 1);
            }
          }
          
          return existingCategory?.id || null;
        }

        // Generate slug
        const slug = categoryData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Create the category
        const category = await prisma.category.create({
          data: {
            name: categoryData.name,
            slug: slug,
            description: categoryData.description,
            parentId: parentId,
            level: level,
            isActive: true,
            sortOrder: sortOrder++
          }
        });

        totalCreated++;
        console.log(`Created Level ${level}: ${categoryData.name}`);

        // Create children if they exist
        if (categoryData.children && categoryData.children.length > 0) {
          for (const child of categoryData.children) {
            await createCategory(child, category.id, level + 1);
          }
        }

        return category.id;
      } catch (error) {
        const errorMessage = `Failed to create "${categoryData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage);
        errors.push(errorMessage);
        return null;
      }
    }

    // Start creating the hierarchy from the root
    console.log('Starting Tesla category hierarchy creation (skipping duplicates)...');
    await createCategory(hierarchy, null, 1);

    // Return results
    const response = {
      success: true, // Always success now, even if some were skipped
      totalCreated,
      totalSkipped,
      errors,
      message: `Successfully processed all categories! Created ${totalCreated} new categories, skipped ${totalSkipped} existing ones.`
    };

    console.log('Tesla category setup completed:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Tesla auto-setup error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to set up Tesla categories: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}