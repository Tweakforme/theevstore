const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function distributeModelY() {
  try {
    // Get all Model Y L2 categories (main parts categories)
    const modelYCategories = await prisma.category.findMany({
      where: {
        AND: [
          { level: 2 },
          { name: { contains: 'Model Y' } }
        ]
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${modelYCategories.length} Model Y categories`);
    modelYCategories.forEach((cat, i) => {
      console.log(`${i + 1}. ${cat.name} (${cat.id})`);
    });
    
    // Get all Model Y products
    const modelYProducts = await prisma.product.findMany({
      where: { compatibleModels: { contains: 'MODEL_Y' } }
    });
    
    console.log(`Found ${modelYProducts.length} Model Y products to distribute`);
    
    if (modelYCategories.length === 0) {
      console.log('❌ No Model Y categories found!');
      return;
    }
    
    // Distribute products evenly across categories
    const productsPerCategory = Math.floor(modelYProducts.length / modelYCategories.length);
    const remainder = modelYProducts.length % modelYCategories.length;
    
    console.log(`Distributing ~${productsPerCategory} products per category`);
    
    let productIndex = 0;
    
    for (let i = 0; i < modelYCategories.length; i++) {
      const category = modelYCategories[i];
      const productsForThisCategory = productsPerCategory + (i < remainder ? 1 : 0);
      
      const productsToUpdate = modelYProducts.slice(productIndex, productIndex + productsForThisCategory);
      const productIds = productsToUpdate.map(p => p.id);
      
      if (productIds.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId: category.id }
        });
        
        console.log(`✅ Assigned ${productIds.length} products to "${category.name}"`);
      }
      
      productIndex += productsForThisCategory;
    }
    
    console.log(`🎉 Successfully distributed all ${modelYProducts.length} Model Y products!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

distributeModelY();