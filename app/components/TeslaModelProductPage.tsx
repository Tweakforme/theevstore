// app/components/TeslaModelProductPage.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { 
  Filter, 
  Search, 
  Grid, 
  List, 
  ChevronDown, 
  Star, 
  Heart, 
  ShoppingCart, 
  Shield, 
  Truck,
  SlidersHorizontal,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";
import { fetcher } from "../lib/fetcher";
import Image from "next/image";
import Link from "next/link";

// Types
interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  stockQuantity: number;
  isFeatured?: boolean;
  isActive?: boolean;
  compatibleModels?: string;
  categoryId: string;
  category?: { name: string };
  images?: { id: string; url: string; altText?: string }[];
  rating?: number;
  reviewCount?: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  children?: Category[];
}

interface TeslaModelPageProps {
  modelType: "MODEL_3" | "MODEL_Y";
}

const TeslaModelProductPage: React.FC<TeslaModelPageProps> = ({ modelType }) => {
  // Data fetching with SWR
  const { data: prodData, isLoading: productsLoading, error: productsError } = useSWR(
    "/api/products",
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: catData, isLoading: categoriesLoading } = useSWR(
    "/api/categories", 
    fetcher,
    { revalidateOnFocus: false }
  );

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showAccessories, setShowAccessories] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Process data
  const allProducts: Product[] = useMemo(
    () => (prodData?.products ? prodData.products : Array.isArray(prodData) ? prodData : []) as Product[],
    [prodData]
  );

  const categories: Category[] = useMemo(
    () => (Array.isArray(catData) ? catData : catData?.items || []) as Category[],
    [catData]
  );

  // Normalize model tags
  const normalizeModelTag = (tag: string) => {
    if (!tag) return "";
    const cleaned = tag.trim().toUpperCase();
    if ((cleaned.includes("MODEL") && cleaned.includes("Y")) || cleaned === "MY" || cleaned === "Y") {
      return "MODEL_Y";
    }
    if ((cleaned.includes("MODEL") && cleaned.includes("3")) || cleaned === "M3" || cleaned === "3") {
      return "MODEL_3";
    }
    return cleaned.replace(/[^A-Z0-9]+/g, "_");
  };

  const splitModels = (s: string) => {
    if (!s) return [];
    return s
      .split(/[|,;/\s]+/)
      .map((m) => normalizeModelTag(m))
      .filter(Boolean);
  };

  // Get ALL products for current model (no limit)
  const allModelProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (!product.compatibleModels) return false;
      const compatibleModels = splitModels(product.compatibleModels);
      return compatibleModels.includes(modelType);
    });
  }, [allProducts, modelType]);

  // Filter categories to only show relevant ones for the current model
  const modelCategories = useMemo(() => {
    const relevantCategoryIds = new Set(allModelProducts.map(p => p.categoryId));
    return categories.filter(category => relevantCategoryIds.has(category.id));
  }, [categories, allModelProducts]);

  // Get phone accessories (limit 20)
  const phoneAccessories = useMemo(() => {
    return allModelProducts
      .filter(product => 
        product.name.toLowerCase().includes('phone') ||
        product.name.toLowerCase().includes('charger') ||
        product.name.toLowerCase().includes('wireless') ||
        product.category?.name.toLowerCase().includes('phone')
      )
      .slice(0, 20);
  }, [allModelProducts]);

  // Get main products (all products excluding phone accessories)
  const mainProducts = useMemo(() => {
    const phoneAccessoryIds = new Set(phoneAccessories.map(p => p.id));
    return allModelProducts.filter(product => !phoneAccessoryIds.has(product.id));
  }, [allModelProducts, phoneAccessories]);

  // Filter and sort logic
  const filteredProducts = useMemo(() => {
    const productsToFilter = showAccessories ? phoneAccessories : mainProducts;
    
    const filtered = productsToFilter.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || 
        product.categoryId === selectedCategory ||
        product.category?.name.toLowerCase().includes(selectedCategory.toLowerCase());
      
      const matchesPrice = parseFloat((product.price ?? 0).toString()) >= priceRange[0] && parseFloat((product.price ?? 0).toString()) <= priceRange[1];
      const matchesStock = !inStock || product.stockQuantity > 0;
      const matchesFeatured = !featured || product.isFeatured;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesFeatured;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat((a.price ?? 0).toString()) - parseFloat((b.price ?? 0).toString()));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat((b.price ?? 0).toString()) - parseFloat((a.price ?? 0).toString()));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return filtered;
  }, [mainProducts, phoneAccessories, showAccessories, searchTerm, selectedCategory, priceRange, inStock, featured, sortBy]);

  // Apply pagination to filtered products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, inStock, featured, sortBy, showAccessories]);

  // Model configuration
  const modelInfo = {
    MODEL_3: {
      name: "Model 3",
      years: "2017-2025",
      description: "Precision-engineered parts and accessories for Tesla Model 3",
      gradient: "from-blue-600 via-blue-700 to-indigo-800",
      accent: "blue",
      heroImage: "/images/hero-1.jpg",
      features: ["Enhanced Autopilot Support", "Track Mode Ready", "Performance Optimized"]
    },
    MODEL_Y: {
      name: "Model Y", 
      years: "2020-2025",
      description: "Premium components and upgrades for Tesla Model Y",
      gradient: "from-green-600 via-green-700 to-emerald-800", 
      accent: "green",
      heroImage: "/images/hero-2.jpg",
      features: ["Seven-Seat Compatible", "Towing Ready", "All-Weather Tested"]
    }
  };

  const currentModel = modelInfo[modelType];

  // Cart functions
  const addToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        console.log("Product added to cart successfully");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Products</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-r ${currentModel.gradient} overflow-hidden`}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="flex items-center space-x-3 mb-6">
               
                <span className="text-xl font-semibold tracking-wide">TESLA {currentModel.name.toUpperCase()}</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                {currentModel.name}
                <span className="block text-3xl lg:text-4xl font-normal mt-2 opacity-90">
                  Parts & Accessories
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
                {currentModel.description}
                <span className="block mt-2 text-lg">
                  Compatible with {currentModel.years} models
                </span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {currentModel.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{mainProducts.length}</div>
                  <div className="text-sm opacity-80">Parts Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{phoneAccessories.length}</div>
                  <div className="text-sm opacity-80">Accessories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{modelCategories.length}</div>
                  <div className="text-sm opacity-80">Categories</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl" />
                <Image
                  src={currentModel.heroImage}
                  alt={`Tesla ${currentModel.name}`}
                  width={600}
                  height={500}
                  className="object-cover rounded-2xl w-full h-full"
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-gray-900">Premium Quality</div>
                        <div className="text-sm text-gray-600">OEM & Performance Parts</div>
                      </div>
                      <Award className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setShowAccessories(false)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  !showAccessories
                    ? `bg-${currentModel.accent}-600 text-white shadow-lg`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Parts ({mainProducts.length})
              </button>
              <button
                onClick={() => setShowAccessories(true)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  showAccessories
                    ? `bg-${currentModel.accent}-600 text-white shadow-lg`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Accessories ({phoneAccessories.length})
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>
              
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Sidebar */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {modelCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Quick Filters */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Quick Filters</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">In Stock Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">Featured Only</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {productsLoading || categoriesLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading {currentModel.name} products...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {showAccessories ? "Phone Accessories" : "Parts & Components"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredProducts.length} products found for Tesla {currentModel.name}
                </p>
              </div>
              
              {filteredProducts.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>Updated inventory</span>
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-6"
              }>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    isFavorite={favorites.has(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={addToCart}
                    accentColor={currentModel.accent}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && (
              <div className="mt-12 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
                  {filteredProducts.length} products
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isVisible = page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2);
                    
                    if (!isVisible) {
                      if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                          currentPage === page
                            ? `bg-${currentModel.accent}-600 text-white border-${currentModel.accent}-600`
                            : 'border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (id: string) => void;
  accentColor: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  accentColor
}) => {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100">
        <div className="flex items-center space-x-6">
          <Link href={`/products/${product.slug}`} className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={product.images?.[0]?.url || "/api/placeholder/200/200"}
              alt={product.name}
              width={96}
              height={96}
              className="object-cover rounded-lg w-24 h-24 hover:opacity-90 transition-opacity"
            />
            {product.isFeatured && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                Featured
              </div>
            )}
          </Link>

          <div className="flex-1">
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>SKU: {product.sku}</span>
              <span>Stock: {product.stockQuantity}</span>
              {product.category && <span>Category: {product.category.name}</span>}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || '0').toFixed(2)}
            </div>
            {product.compareAtPrice && (
              <div className="text-sm text-gray-500 line-through mb-4">
                ${typeof product.compareAtPrice === 'number' ? product.compareAtPrice.toFixed(2) : parseFloat(product.compareAtPrice || '0').toFixed(2)}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAddToCart(product.id)}
                disabled={product.stockQuantity === 0}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  product.stockQuantity === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : `bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white`
                }`}
              >
                {product.stockQuantity === 0 ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 inline mr-1" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={product.images?.[0]?.url || "/api/placeholder/400/400"}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
            />
            {product.isFeatured && (
              <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                Featured
              </div>
            )}
            {product.stockQuantity === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-3 py-1 rounded-lg font-semibold">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(product.id);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all z-10 ${
          isFavorite 
            ? "bg-red-500 text-white" 
            : "bg-white/80 text-gray-600 hover:text-red-500"
        }`}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>

      <div className="p-6">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description || "Premium Tesla component"}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xl font-bold text-gray-900">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || '0').toFixed(2)}
            </div>
            {product.compareAtPrice && (
              <div className="text-sm text-gray-500 line-through">
                ${typeof product.compareAtPrice === 'number' ? product.compareAtPrice.toFixed(2) : parseFloat(product.compareAtPrice || '0').toFixed(2)}
              </div>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>SKU: {product.sku}</div>
            <div>Stock: {product.stockQuantity}</div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product.id);
          }}
          disabled={product.stockQuantity === 0}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            product.stockQuantity === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : `bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white shadow-md hover:shadow-lg`
          }`}
        >
          {product.stockQuantity === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 inline mr-2" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TeslaModelProductPage;
       