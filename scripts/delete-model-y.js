const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteModelY() {
  try {
    // First, let's see what we're about to delete
    const modelYProducts = await prisma.product.findMany({
      where: {
        compatibleModels: { contains: 'MODEL_Y' }
      },
      select: {
        id: true,
        name: true,
        compatibleModels: true
      }
    });
    
    console.log(`Found ${modelYProducts.length} Model Y products to delete`);
    console.log('Sample products:');
    modelYProducts.slice(0, 5).forEach(p => {
      console.log(`- ${p.name} (${p.compatibleModels})`);
    });
    
    // Show products that are ONLY Model Y vs mixed
    const onlyModelY = modelYProducts.filter(p => 
      p.compatibleModels.trim() === 'MODEL_Y'
    );
    const mixedModels = modelYProducts.filter(p => 
      p.compatibleModels.includes(',') || p.compatibleModels.includes('MODEL_3')
    );
    
    console.log(`\n📊 Breakdown:`);
    console.log(`- Products with ONLY Model Y: ${onlyModelY.length}`);
    console.log(`- Products with mixed models: ${mixedModels.length}`);
    
    // Ask for confirmation
    console.log('\n⚠️  This will DELETE these products permanently!');
    console.log('Press Ctrl+C to cancel, or continue to delete...');
    
    // Wait a moment for user to read
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete only products that are ONLY Model Y (to be safe)
    const result = await prisma.product.deleteMany({
      where: {
        compatibleModels: 'MODEL_Y'  // Exact match for safety
      }
    });
    
    console.log(`✅ Deleted ${result.count} Model Y products`);
    
    // Verify remaining products
    const remaining = await prisma.product.count();
    console.log(`📊 Remaining products in database: ${remaining}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteModelY();