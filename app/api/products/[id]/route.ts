// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// GET single product (now handles both ID and slug)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = (await params).id;

    if (!identifier) {
      return NextResponse.json({ error: 'Product ID or slug is required' }, { status: 400 });
    }

    // Check if this is coming from admin (has specific query params or path patterns)
    const url = new URL(request.url);
    const isAdminRequest = url.pathname.includes('/admin') || url.searchParams.has('admin');

    // Try to find product by slug first (for public pages), then by ID (for admin)
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: identifier },
          { id: identifier }
        ]
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Return different formats based on the request source
    if (isAdminRequest) {
      // Transform the data for compatibility with your admin form
      const productForEdit = {
        ...product,
        imageUrl: product.images && product.images.length > 0 ? product.images[0].url : null,
        // Parse compatibleModels JSON string to boolean flags
        model3Compatible: product.compatibleModels?.includes('MODEL_3') || false,
        modelYCompatible: product.compatibleModels?.includes('MODEL_Y') || false,
        // Convert Decimal to number for form
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        // Add category name for form
        categoryName: product.category?.name
      };

      return NextResponse.json(productForEdit);
    } else {
      // Transform data for public product page
      const transformedProduct = {
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
        weight: product.weight ? Number(product.weight) : undefined,
      };

      return NextResponse.json(transformedProduct);
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// UPDATE product (unchanged)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = (await params).id;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        category: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const sku = formData.get('sku') as string;
    const categoryName = formData.get('category') as string;
    const model3Compatible = formData.get('model3Compatible') === 'true';
    const modelYCompatible = formData.get('modelYCompatible') === 'true';
    const inStock = formData.get('inStock') === 'true';
    const stockQuantity = parseInt(formData.get('stockQuantity') as string) || 0;

    // Validate required fields
    if (!name || !sku || isNaN(price)) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, sku, price' 
      }, { status: 400 });
    }

    // Handle category - find or create
    let categoryId = existingProduct.categoryId; // Default to existing
    
    if (categoryName && categoryName.trim() !== '') {
      // Try to find existing category
      let category = await prisma.category.findFirst({
        where: { 
          name: {
            equals: categoryName.trim(),
            mode: 'insensitive'
          }
        }
      });

      // Create category if it doesn't exist
      if (!category) {
        const slug = categoryName.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        category = await prisma.category.create({
          data: {
            name: categoryName.trim(),
            slug: slug,
            description: `Auto-created category for ${categoryName}`
          }
        });
      }
      
      categoryId = category.id;
    }

    // Build compatible models string - convert boolean flags to comma-separated string
    const compatibleModelsList: string[] = [];
    if (model3Compatible) compatibleModelsList.push('MODEL_3');
    if (modelYCompatible) compatibleModelsList.push('MODEL_Y');
    const compatibleModelsString: string | null = compatibleModelsList.length > 0 ? compatibleModelsList.join(',') : null;

    // Handle image upload
    const imageFile = formData.get('image') as File;
    let newImageUrl = null;
    
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      
      const filePath = join(uploadsDir, fileName);
      
      try {
        await writeFile(filePath, buffer);
        newImageUrl = `/uploads/${fileName}`;
      } catch (writeError) {
        console.error('Error saving image:', writeError);
        return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
      }
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Prepare update data with explicit typing to match Prisma expectations
    const updateData: {
      name: string;
      slug: string;
      description: string | null;
      price: number;
      sku: string;
      categoryId: string;
      compatibleModels: string | null;
      stockQuantity: number;
      isActive: boolean;
    } = {
      name,
      slug,
      description: description || null,
      price, // Prisma will automatically convert number to Decimal
      sku,
      categoryId,
      compatibleModels: compatibleModelsString,
      stockQuantity,
      isActive: inStock
    };

    // Update product in database
    await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    // Handle new image if uploaded
    if (newImageUrl) {
      // Delete old image records
      await prisma.productImage.deleteMany({
        where: { productId: productId }
      });

      // Create new image record
      await prisma.productImage.create({
        data: {
          productId: productId,
          url: newImageUrl,
          altText: `${name} image`,
          sortOrder: 0
        }
      });
    }

    // Fetch updated product with relations for response
    const finalProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        category: true
      }
    });

    return NextResponse.json(finalProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE product (unchanged)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = (await params).id;

    // First delete related images
    await prisma.productImage.deleteMany({
      where: { productId: productId }
    });

    // Then delete the product
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}