// app/api/products/bulk-import/preview/route.ts - COMPLETE FIX WITH CATEGORY MAPPING
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

// Function to detect Tesla model from filename or content
function detectTeslaModel(filename: string, data: any[][]): string {
  const lowerFilename = filename.toLowerCase();
  
  // Check filename first
  if (lowerFilename.includes('model3') || lowerFilename.includes('model_3') || lowerFilename.includes('m3')) {
    return 'MODEL_3';
  }
  if (lowerFilename.includes('modely') || lowerFilename.includes('model_y') || lowerFilename.includes('my')) {
    return 'MODEL_Y';
  }
  if (lowerFilename.includes('models') || lowerFilename.includes('model_s') || lowerFilename.includes('ms')) {
    return 'MODEL_S';
  }
  if (lowerFilename.includes('modelx') || lowerFilename.includes('model_x') || lowerFilename.includes('mx')) {
    return 'MODEL_X';
  }
  
  // Check content for model indicators
  const contentStr = JSON.stringify(data).toLowerCase();
  const modelCounts = {
    'MODEL_3': (contentStr.match(/model.?3|m3/g) || []).length,
    'MODEL_Y': (contentStr.match(/model.?y|my/g) || []).length,
    'MODEL_S': (contentStr.match(/model.?s|ms/g) || []).length,
    'MODEL_X': (contentStr.match(/model.?x|mx/g) || []).length,
  };
  
  // Return the model with the highest count
  const detectedModel = Object.entries(modelCounts).reduce((a, b) => 
    modelCounts[a[0] as keyof typeof modelCounts] > modelCounts[b[0] as keyof typeof modelCounts] ? a : b
  )[0];
  
  return detectedModel || 'MODEL_3'; // Default to Model 3 if nothing detected
}

// 🎯 CATEGORY MAPPING FIX - Handle both Excel formats correctly
function mapCategoryForTeslaModel(excelCategory: string, detectedModel: string): string {
  if (!excelCategory) {
    return `${detectedModel.replace('_', ' ')} Parts`;
  }
  
  console.log(`🔍 Processing category: "${excelCategory}" for model: ${detectedModel}`);
  
  // FOR MODEL 3 EXCEL FILES:
  // Excel has: "Model 3 - BODY" and "M3 1001 - Bumper and Fascia"
  // Auto-setup has: "10 - BODY" and "1001 - Bumper and Fascia"  
  // We need to MAP BACKWARDS!
  
  if (detectedModel === 'MODEL_3') {
    // Handle "Model 3 - BODY" -> should find "10 - BODY"
    if (excelCategory.startsWith('Model 3 - ')) {
      const cleanCategory = excelCategory.replace('Model 3 - ', '');
      console.log(`🔄 Model 3 main category: "${excelCategory}" → looking for "${cleanCategory}"`);
      return cleanCategory;
    }
    
    // Handle "M3 1001 - Bumper and Fascia" -> should find "1001 - Bumper and Fascia"
    if (excelCategory.startsWith('M3 ')) {
      const cleanCategory = excelCategory.replace('M3 ', '');
      console.log(`🔄 Model 3 subcategory: "${excelCategory}" → looking for "${cleanCategory}"`);
      return cleanCategory;
    }
  }
  
  // FOR MODEL Y EXCEL FILES:
  // Excel has: "10 - BODY" and "1001 - Bumper and Fascia"  
  // Auto-setup has: "Model Y - 10 - BODY" and "Model Y - 1001 - Bumper and Fascia"
  // We need to ADD the prefix!
  
  if (detectedModel === 'MODEL_Y') {
    const modelName = detectedModel.replace('_', ' ');
    
    // If category already has the model prefix, use as-is
    if (excelCategory.toLowerCase().includes(modelName.toLowerCase())) {
      console.log(`✅ Category already has model prefix: "${excelCategory}"`);
      return excelCategory;
    }
    
    // Add Model Y prefix
    const mappedCategory = `${modelName} - ${excelCategory}`;
    console.log(`🔄 Model Y category: "${excelCategory}" → "${mappedCategory}"`);
    return mappedCategory;
  }
  
  // Default: return as-is
  console.log(`➡️ Returning category as-is: "${excelCategory}"`);
  return excelCategory;
}

// Enhanced price parsing function
function parsePrice(priceValue: any): { price: number; originalValue: any; parseSuccess: boolean } {
  console.log(`🔍 Parsing price value:`, { priceValue, type: typeof priceValue });
  
  // Handle null, undefined, empty string
  if (priceValue === null || priceValue === undefined || priceValue === '') {
    console.log(`✅ Empty price value, defaulting to 0`);
    return { price: 0, originalValue: priceValue, parseSuccess: true };
  }
  
  // Convert to string and clean it
  const priceStr = priceValue.toString().trim();
  if (priceStr === '') {
    console.log(`✅ Empty string after trim, defaulting to 0`);
    return { price: 0, originalValue: priceValue, parseSuccess: true };
  }
  
  // Remove common price formatting characters
  const cleanedPrice = priceStr
    .replace(/[$,\s]/g, '') // Remove $, commas, spaces
    .replace(/^CAD/i, '')   // Remove CAD prefix
    .replace(/CAD$/i, '')   // Remove CAD suffix
    .trim();
  
  console.log(`🧹 Cleaned price string: "${priceStr}" → "${cleanedPrice}"`);
  
  // Try to parse as number
  const parsed = parseFloat(cleanedPrice);
  
  if (isNaN(parsed)) {
    console.log(`❌ Failed to parse "${cleanedPrice}" as number`);
    return { price: 0, originalValue: priceValue, parseSuccess: false };
  }
  
  console.log(`✅ Successfully parsed price: ${parsed}`);
  return { price: parsed, originalValue: priceValue, parseSuccess: true };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes)`);

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

    console.log(`📊 Parsed ${data.length} rows from Excel file`);

    // Detect Tesla model from filename and content
    const detectedModel = detectTeslaModel(file.name, data);
    console.log(`🚗 Detected Tesla model: ${detectedModel}`);

    // Get headers (first row)
    const headers = data[0].map((h: any) => h?.toString().toLowerCase().trim() || '');
    const rows = data.slice(1);

    console.log(`📋 Headers found:`, headers);

    // Column mapping for your specific Tesla Excel structure
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
      'width': ['width'],
      'length': ['length']
    };

    // Find column indices
    const columnIndices: Record<string, number> = {};
    Object.entries(columnMapping).forEach(([key, possibleNames]) => {
      const index = headers.findIndex(header => 
        possibleNames.some(name => header.includes(name))
      );
      if (index !== -1) {
        columnIndices[key] = index;
        console.log(`✅ Found column "${key}" at index ${index} (header: "${headers[index]}")`);
      } else {
        console.log(`⚠️  Column "${key}" not found. Looking for: ${possibleNames.join(', ')}`);
      }
    });

    // Process each row
    const products: ProductPreview[] = [];
    const preview: ProductPreview[] = [];
    let priceErrors = 0;
    let priceSuccesses = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];

      // Skip empty rows
      if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }

      const product: ProductPreview = {};

      // Extract data using column indices
      product.name = row[columnIndices.name]?.toString().trim();
      product.sku = row[columnIndices.sku]?.toString().trim();
      product.oeNumber = row[columnIndices.oeNumber]?.toString().trim();
      product.unitPacking = row[columnIndices.unitPacking]?.toString().trim();
      product.fullPacking = row[columnIndices.fullPacking]?.toString().trim();
      product.weight = parseFloat(row[columnIndices.weight]) || null;
      product.dimensions = row[columnIndices.dimensions]?.toString().trim();

      // 🔥 ENHANCED PRICE PARSING WITH DEBUG INFO
      const priceResult = parsePrice(row[columnIndices.price]);
      product.price = priceResult.price;
      
      if (priceResult.parseSuccess) {
        priceSuccesses++;
      } else {
        priceErrors++;
        console.log(`❌ Row ${i + 2}: Price parsing failed for "${priceResult.originalValue}"`);
      }

      // Parse additional pricing
      if (columnIndices.price10pc !== undefined) {
        const price10result = parsePrice(row[columnIndices.price10pc]);
        product.price10pc = price10result.price;
      }

      // 🎯 CATEGORY HANDLING - SMART MAPPING FOR BOTH FORMATS!
      const rawMainCategory = row[columnIndices.category]?.toString().trim();
      const rawSubcategory = row[columnIndices.subcategory]?.toString().trim();
      
      console.log(`📂 Raw categories - Main: "${rawMainCategory}", Sub: "${rawSubcategory}"`);
      
      // Use subcategory if available, otherwise main category
      const selectedCategory = rawSubcategory || rawMainCategory;
      
      // Map to match existing auto-setup categories
      const mappedCategory = mapCategoryForTeslaModel(selectedCategory, detectedModel);
      product.category = mappedCategory;
      
      console.log(`🎯 Final category assignment: "${mappedCategory}"`);

      // Build description from available data
      const descriptionParts: string[] = [];
      if (product.oeNumber) descriptionParts.push(`OE: ${product.oeNumber}`);
      if (product.weight) descriptionParts.push(`Weight: ${product.weight}kg`);
      if (product.dimensions) descriptionParts.push(`Dimensions: ${product.dimensions}`);
      if (product.unitPacking) descriptionParts.push(`Packing: ${product.unitPacking}`);
      
      product.description = descriptionParts.length > 0 ? descriptionParts.join(' | ') : undefined;

      // 🔥 RELAXED VALIDATION - ONLY FLAG TRULY PROBLEMATIC ITEMS
      if (!product.name || product.name.length < 3) {
        errors.push('Product name is required and must be at least 3 characters');
      }
      if (!product.sku || product.sku.length < 3) {
        errors.push('SKU is required and must be at least 3 characters');
      }
      
      // 🚀 NEW RELAXED PRICE VALIDATION
      // Only error if price is negative or we couldn't parse a non-empty value
      if (product.price < 0) {
        errors.push(`Price cannot be negative. Found: ${priceResult.originalValue}`);
      } else if (!priceResult.parseSuccess && priceResult.originalValue !== null && priceResult.originalValue !== undefined && priceResult.originalValue !== '') {
        errors.push(`Could not parse price: "${priceResult.originalValue}". Use numbers only (e.g., 45.99)`);
      }

      // Set defaults - NOW USING DETECTED MODEL
      product.stockQuantity = product.stockQuantity || 10;
      product.compatibleModels = detectedModel;
      product.isActive = true;
      product.trackQuantity = true;
      product.lowStockThreshold = 5;

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

    console.log(`💰 Price parsing summary: ${priceSuccesses} successes, ${priceErrors} errors`);
    console.log(`📝 Products processed: ${products.length}, Errors: ${preview.filter(p => p.hasErrors).length}`);
    console.log(`🚗 All products will be assigned to: ${detectedModel}`);

    return NextResponse.json({
      success: true,
      data: products,
      preview: preview,
      detectedModel: detectedModel,
      filename: file.name,
      totalRows: rows.length,
      validRows: products.filter((p, index) => preview[index]?.hasErrors === false).length,
      errorRows: preview.filter(p => p.hasErrors).length,
      priceParsingStats: {
        successes: priceSuccesses,
        errors: priceErrors
      }
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      error: 'Failed to process file. Please check the format and try again.' 
    }, { status: 500 });
  }
}