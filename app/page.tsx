"use client";
import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Sparkles, ShoppingCart, Heart, Star, Package, Eye, Zap, Shield, Truck, RefreshCw, TrendingUp, Award, Users, ChevronDown, Filter } from 'lucide-react';

// Type definitions
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  stockQuantity: number;
  isFeatured?: boolean;
  isActive?: boolean;
  compatibleModels?: string;
  categoryId: string;
  images?: Array<{
    id: string;
    url: string;
    altText?: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
}

interface TeslaModel {
  id: string;
  name: string;
  count: number;
}

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  image: string;
}

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TeslaPartsHomepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState(new Set<string>());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Filters
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Hero carousel with your actual images
  const heroSlides: HeroSlide[] = [
    {
      title: "Premium Tesla Model 3 Parts",
      subtitle: "Authentic components for every repair and upgrade",
      description: "Over 615 genuine Tesla Model 3 parts in stock",
      ctaText: "Shop Model 3 Parts",
      image: "/images/hero-1.jpg"
    },
    {
      title: "Model Y Parts Coming Soon", 
      subtitle: "Expanding our collection with 600+ Model Y components",
      description: "The same quality and precision for your Model Y",
      ctaText: "Get Notified",
      image: "/images/hero-2.jpg"
    },
    {
      title: "Professional Installation",
      subtitle: "Expert service and genuine parts guarantee", 
      description: "Quality you can trust, service you can count on",
      ctaText: "Learn More",
      image: "/images/hero-3.jpg"
    }
  ];

  // Tesla Models with counts from backend
  const [teslaModels, setTeslaModels] = useState<TeslaModel[]>([
    { id: 'all', name: 'All Models', count: 0 },
    { id: 'MODEL_3', name: 'Model 3', count: 0 },
    { id: 'MODEL_Y', name: 'Model Y', count: 0 },
    { id: 'MODEL_S', name: 'Model S', count: 0 },
    { id: 'MODEL_X', name: 'Model X', count: 0 }
  ]);

  // Stats for the hero section
  const stats: Stat[] = [
    { label: "Tesla Parts", value: "615+", icon: Package },
    { label: "Categories", value: "103", icon: TrendingUp },
    { label: "Happy Customers", value: "2.5K+", icon: Users },
    { label: "Quality Rating", value: "4.9/5", icon: Award }
  ];

  // Fetch all data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const products: Product[] = productsData.products || productsData || [];
          
          setAllProducts(products);
          
          // Get featured products from backend (those with isFeatured: true)
          const featured = products.filter((p: Product) => p.isFeatured === true).slice(0, 10);
          setFeaturedProducts(featured);

          // Update model counts based on actual products
          const modelCounts: Record<string, number> = products.reduce((acc: Record<string, number>, product: Product) => {
            if (product.compatibleModels) {
              const models = product.compatibleModels.split(',');
              models.forEach((model: string) => {
                const trimmedModel = model.trim();
                acc[trimmedModel] = (acc[trimmedModel] || 0) + 1;
              });
            }
            return acc;
          }, {});

          setTeslaModels(prev => prev.map((model: TeslaModel) => ({
            ...model,
            count: model.id === 'all' ? products.length : (modelCounts[model.id] || 0)
          })));
        }

        // Fetch categories with hierarchy
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData || []);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Build hierarchical categories for filtering
  const buildCategoryHierarchy = (): Category[] => {
    const rootCategories = categories.filter((cat: Category) => cat.parentId === null);
    const categoryMap = new Map<string, Category[]>();
    
    categories.forEach((cat: Category) => {
      const key = cat.parentId || 'null';
      if (!categoryMap.has(key)) {
        categoryMap.set(key, []);
      }
      const categoryList = categoryMap.get(key);
      if (categoryList) {
        categoryList.push(cat);
      }
    });

    return rootCategories.map((root: Category) => ({
      ...root,
      children: categoryMap.get(root.id) || []
    }));
  };

  const hierarchicalCategories = buildCategoryHierarchy();

  // Get subcategories for selected category
  const getSubcategories = (): Category[] => {
    if (selectedCategory === 'all') return [];
    const category = categories.find((cat: Category) => cat.id === selectedCategory);
    if (!category) return [];
    return categories.filter((cat: Category) => cat.parentId === category.id);
  };

// Filter products based on selections
  const getFilteredProducts = (): Product[] => {
    return allProducts.filter((product: Product) => {
      // Model filter
      const modelMatch = selectedModel === 'all' || 
        (product.compatibleModels && product.compatibleModels.includes(selectedModel));
      
      // Category filter
      const categoryMatch = selectedCategory === 'all' || product.categoryId === selectedCategory;
      
      // Subcategory filter
      const subcategoryMatch = selectedSubcategory === 'all' || product.categoryId === selectedSubcategory;
      
      // Search filter
      const searchMatch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      return modelMatch && categoryMatch && subcategoryMatch && searchMatch;
    });
  };

  const filteredProducts = getFilteredProducts();

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const addToCart = (productId: string) => {
    setCartCount(prev => prev + 1);
    console.log('Added to cart:', productId);
  };

  const currentSlide = heroSlides[currentImageIndex];

  return (
    <main className="bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden flex items-center">
        {/* Background Images */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: currentImageIndex === index ? 1 : 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={slide.image}
                alt="Tesla Parts"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
            </div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="text-white">
              <div className="inline-flex items-center px-6 py-3 bg-black/40 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-semibold mb-8">
                <Sparkles className="h-4 w-4 mr-2 text-emerald-400" />
                <span>{currentSlide.subtitle}</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-8">
                <span className="block text-white" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
                  {currentSlide.title.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent font-black">
                  {currentSlide.title.split(' ').slice(2).join(' ')}
                </span>
              </h1>
              
              <p className="text-xl text-white leading-relaxed mb-10 max-w-lg font-medium" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                {currentSlide.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-4 bg-white text-slate-900 font-bold text-lg rounded-full hover:bg-emerald-50 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 group shadow-xl"
                >
                  <span>{currentSlide.ctaText}</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-10 py-4 border-2 border-white text-white font-bold text-lg rounded-full hover:border-emerald-400 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 shadow-xl">
                  Browse Categories
                </button>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat: Stat, index: number) => (
                <div 
                  key={index}
                  className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white text-center hover:bg-black/40 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentImageIndex === index 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      
      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full p-4 bg-slate-100 rounded-lg"
            >
              <span className="font-medium text-slate-900">Filters & Search</span>
              <Filter className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Tesla Model */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tesla Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {teslaModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('all');
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="all">All Categories</option>
                  {hierarchicalCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subcategory</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  disabled={selectedCategory === 'all'}
                >
                  <option value="all">All Subcategories</option>
                  {getSubcategories().map(subcat => (
                    <option key={subcat.id} value={subcat.id}>
                      {subcat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {filteredProducts.length} of {allProducts.length} products
              </div>
              <button
                onClick={() => {
                  setSelectedModel('all');
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                  setSearchQuery('');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured-products" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-light text-slate-900 mb-4">
                {selectedModel !== 'all' || selectedCategory !== 'all' || searchQuery ? 'Filtered Products' : 'Featured Products'}
              </h2>
              <p className="text-xl text-slate-600">
                {selectedModel !== 'all' || selectedCategory !== 'all' || searchQuery 
                  ? `${filteredProducts.length} products match your filters`
                  : 'Our most popular and highest-rated Tesla parts'
                }
              </p>
            </div>
            <button className="hidden lg:flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-colors">
              <span>View All Products</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
              <p className="text-slate-500 mt-4 font-light">Loading products...</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {(selectedModel !== 'all' || selectedCategory !== 'all' || searchQuery ? filteredProducts : featuredProducts).slice(0, 10).map((product: Product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                          <Package className="h-12 w-12 text-slate-300" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col space-y-1">
                        {product.isFeatured && (
                          <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                        {product.isActive === false && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className={`p-2 rounded-full shadow-md transition-colors ${
                            favorites.has(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-slate-600 hover:text-red-500'
                          }`}
                        >
                          <Heart className="h-3 w-3" />
                        </button>
                        <button className="p-2 bg-white text-slate-600 hover:text-slate-900 rounded-full shadow-md transition-colors">
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Stock Status */}
                      {product.stockQuantity === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-sm font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                          {product.sku}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 text-sm group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg font-bold text-slate-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            ${Number(product.compareAtPrice).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Stock Quantity */}
                      <div className="text-xs text-slate-600 mb-3">
                        {product.stockQuantity > 0 ? (
                          <span className="text-green-600">✓ In Stock ({product.stockQuantity})</span>
                        ) : (
                          <span className="text-red-600">✗ Out of Stock</span>
                        )}
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={product.stockQuantity === 0}
                        className={`w-full py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                          product.stockQuantity > 0
                            ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="h-3 w-3" />
                        <span>{product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Products */}
              {(selectedModel !== 'all' || selectedCategory !== 'all' || searchQuery) && filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-600 mb-6">Try adjusting your filters or search terms.</p>
                  <button
                    onClick={() => {
                      setSelectedModel('all');
                      setSelectedCategory('all');
                      setSelectedSubcategory('all');
                      setSearchQuery('');
                    }}
                    className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* No Featured Products */}
              {!loading && featuredProducts.length === 0 && selectedModel === 'all' && selectedCategory === 'all' && !searchQuery && (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No featured products yet</h3>
                  <p className="text-slate-600">Products will appear here when marked as featured in the admin.</p>
                </div>
              )}

              {/* View All Button - Mobile */}
              <div className="flex justify-center mt-12 lg:hidden">
                <button className="px-8 py-3 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-colors flex items-center space-x-2">
                  <span>View All Products</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-slate-900 mb-4">
              Why Tesla Owners Trust Us
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">OEM Quality Guarantee</h3>
              <p className="text-slate-600 leading-relaxed">
                All parts meet or exceed Tesla's original specifications with guaranteed perfect fit and performance.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Fast & Secure Shipping</h3>
              <p className="text-slate-600 leading-relaxed">
                Express delivery available with tracking. Most orders ship within 24 hours.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Easy Returns</h3>
              <p className="text-slate-600 leading-relaxed">
                30-day hassle-free return policy. If it doesn't fit perfectly, we'll make it right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter & CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-light mb-6">
            Stay Updated with New Parts & Offers
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Be the first to know about new Tesla Model 3 & Y parts, exclusive deals, and maintenance tips.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-12">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            />
            <button className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-full hover:bg-slate-100 transition-colors">
              Subscribe
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">{teslaModels.find(m => m.id === 'MODEL_3')?.count || 615}+</div>
              <div className="text-slate-300 text-sm">Model 3 Parts</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{teslaModels.find(m => m.id === 'MODEL_Y')?.count || 0}+</div>
              <div className="text-slate-300 text-sm">Model Y Parts*</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{categories.length}</div>
              <div className="text-slate-300 text-sm">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.9</div>
              <div className="text-slate-300 text-sm">Customer Rating</div>
            </div>
          </div>
          
          {teslaModels.find(m => m.id === 'MODEL_Y')?.count === 0 && (
            <p className="text-xs text-slate-400 mt-8">*Model Y parts coming soon</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default TeslaPartsHomepage;