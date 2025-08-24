const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reverseFix() {
  try {
    // Get the TESLA MODEL Y root category ID
    const teslaModelY = await prisma.category.findFirst({
      where: { name: { contains: 'TESLA MODEL Y' } }
    });
    
    if (!teslaModelY) {
      console.log('❌ Could not find TESLA MODEL Y category');
      return;
    }
    
    console.log(`Found TESLA MODEL Y category: ${teslaModelY.id}`);
    
    // Move all Model Y products back to TESLA MODEL Y category
    const result = await prisma.product.updateMany({
      where: {
        compatibleModels: { contains: 'MODEL_Y' }
      },
      data: {
        categoryId: teslaModelY.id
      }
    });
    
    console.log(`✅ Moved ${result.count} Model Y products back to TESLA MODEL Y category`);
    
    // Verify the split
    const model3Count = await prisma.product.count({
      where: { compatibleModels: { contains: 'MODEL_3' } }
    });
    
    const modelYCount = await prisma.product.count({
      where: { compatibleModels: { contains: 'MODEL_Y' } }
    });
    
    console.log(`📊 Model 3 products: ${model3Count}`);
    console.log(`📊 Model Y products: ${modelYCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reverseFix();