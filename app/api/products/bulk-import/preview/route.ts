// app/api/products/bulk-import/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface ProductPreview {
  name?: string;
  sku?: string;
  price?: number;
  description?: string;
  stockQuantity?: number;
  category?: string;
  subcategory?: string;
  compatibleModels?: string;
  weight?: number;
  dimensions?: string;
  slug?: string;
  isActive?: boolean;
  trackQuantity?: boolean;
  lowStockThreshold?: number;
  hasErrors?: boolean;
  errors?: string[];
  rowNumber?: number;
  oeNumber?: string;
  unitPacking?: string;
  fullPacking?: string;
  price10pc?: number;
  price50pc?: number;
  price100pc?: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let data: any[][] = [];

    // Parse different file types
    if (file.name.endsWith('.csv')) {
      // Parse CSV
      const text = buffer.toString('utf-8');
      data = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
    } else {
      // Parse Excel
      const workbook = XLSX.read(buffer, { 
        type: 'buffer',
        cellDates: true
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    }

    if (data.length === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    // Get headers (first row)
    const headers = data[0].map((h: any) => h?.toString().toLowerCase().trim() || '');
    const rows = data.slice(1);

    // Column mapping for your specific Tesla Model 3 Excel structure
    const columnMapping: Record<string, string[]> = {
      'name': ['title', 'name', 'product_name'],
      'sku': ['sku', 'part_number'],
      'oeNumber': ['oe_number', 'oem_number'],
      'unitPacking': ['unit_packing'],
      'fullPacking': ['full_packing'],
      'price': ['price_1pc', 'price'],
      'price10pc': ['price_10pc'],
      'price50pc': ['price_50pc'], 
      'price100pc': ['price_100pc'],
      'category': ['main_category', 'category'],
      'subcategory': ['subcategory', 'sub_category'],
      'weight': ['weight'],
      'dimensions': ['dimensions'],
      'height': ['height'],
      'length': ['length'], 
      'width': ['width'],
      'rawDimensions': ['raw_dimensions'],
      'stockQuantity': ['stock', 'quantity', 'inventory']
    };

    // Find column indices
    const columnIndices: Record<string, number> = {};
    
    Object.keys(columnMapping).forEach(field => {
      const possibleNames = columnMapping[field];
      const index = headers.findIndex(header => 
        possibleNames.some(name => header.includes(name))
      );
      if (index !== -1) {
        columnIndices[field] = index;
      }
    });

    // Process rows into products
    const products: ProductPreview[] = [];
    const preview: ProductPreview[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row || row.every((cell: any) => !cell)) continue;

      const product: ProductPreview = {};
      const errors: string[] = [];

      // Extract data based on column mapping
      Object.keys(columnIndices).forEach(field => {
        const colIndex = columnIndices[field];
        const value = row[colIndex];
        
        if (value !== undefined && value !== null && value !== '') {
          switch (field) {
            case 'price':
            case 'price10pc':
            case 'price50pc':
            case 'price100pc':
              const price = parseFloat(value.toString().replace(/[$,]/g, ''));
              if (!isNaN(price)) {
                (product as any)[field] = price;
              }
              break;
              
            case 'stockQuantity':
              const stock = parseInt(value.toString());
              if (!isNaN(stock)) {
                product.stockQuantity = stock;
              }
              break;
              
            case 'weight':
            case 'height':
            case 'length':
            case 'width':
              const numValue = parseFloat(value.toString());
              if (!isNaN(numValue)) {
                (product as any)[field] = numValue;
              }
              break;
              
            case 'name':
              // Clean up title - remove extra newlines and spaces
              product.name = value.toString().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
              break;
              
            case 'sku':
              product.sku = value.toString().trim();
              break;
              
            case 'category':
              product.category = value.toString().trim();
              break;
              
            case 'subcategory':
              product.subcategory = value.toString().trim();
              break;
              
            case 'oeNumber':
              product.oeNumber = value.toString().trim();
              break;
              
            case 'unitPacking':
              product.unitPacking = value.toString().trim();
              break;
              
            case 'fullPacking':
              product.fullPacking = value.toString().trim();
              break;
              
            case 'dimensions':
            case 'rawDimensions':
              (product as any)[field] = value.toString().trim();
              break;
          }
        }
      });

      // Build comprehensive description
      const descriptionParts = [];
      if (product.oeNumber) descriptionParts.push(`OE: ${product.oeNumber}`);
      if (product.unitPacking) descriptionParts.push(`Unit Packing: ${product.unitPacking}`);
      if (product.fullPacking) descriptionParts.push(`Full Packing: ${product.fullPacking}`);
      if (product.price10pc) descriptionParts.push(`Bulk Pricing - 10pc: ${product.price10pc}, 50pc: ${product.price50pc}, 100pc: ${product.price100pc}`);
      
      product.description = descriptionParts.join(' | ');

      // Validation
      if (!product.name || product.name.length < 3) {
        errors.push('Product name is required and must be at least 3 characters');
      }
      if (!product.sku || product.sku.length < 3) {
        errors.push('SKU is required and must be at least 3 characters');
      }
      if (!product.price || product.price <= 0) {
        errors.push('Valid price is required (price_1pc column)');
      }

      // Set defaults for Tesla Model 3 import
      product.stockQuantity = product.stockQuantity || 10; // Default to 10 pieces in stock
      product.compatibleModels = 'MODEL_3'; // All products are Model 3 compatible
      product.isActive = true;
      product.trackQuantity = true;
      product.lowStockThreshold = 5;

      // Use subcategory as primary category if available, fallback to main category
      const finalCategory = product.subcategory || product.category || 'Model 3 Parts';
      product.category = finalCategory;

      // Generate slug from name
      if (product.name) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Add to collections
      products.push(product);
      preview.push({
        ...product,
        hasErrors: errors.length > 0,
        errors: errors,
        rowNumber: i + 2 // +2 because we skip header and arrays are 0-indexed
      });
    }

    return NextResponse.json({
      success: true,
      data: products,
      preview: preview,
      totalRows: rows.length,
      validRows: products.filter((p, index) => preview[index]?.hasErrors === false).length,
      errorRows: preview.filter(p => p.hasErrors).length
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      error: 'Failed to process file. Please check the format and try again.' 
    }, { status: 500 });
  }
}