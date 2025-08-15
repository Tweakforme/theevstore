"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  Heart,
  Package,
  Eye,
  TrendingUp,
  Award,
  Users,
  ChevronDown,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

// ------------ Types ------------
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
  compatibleModels?: string; // e.g. "MODEL_3, MODEL_Y"
  categoryId: string;
  images?: Array<{ id: string; url: string; altText?: string }>;
}

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  level?: number;
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

// ------------ Carousel Hook ------------
const useCarousel = (items: Product[], options: { autoPlay?: boolean; interval?: number } = {}) => {
  const { autoPlay = true, interval = 3000 } = options;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Create extended array for seamless infinite scroll
  const extendedItems = useMemo(() => {
    if (items.length === 0) return [];
    if (items.length === 1) return [items[0], items[0], items[0]]; // Duplicate single item
    
    // Add first few items to the end and last few items to the beginning
    const cloneCount = Math.min(3, items.length);
    const startClones = items.slice(-cloneCount);
    const endClones = items.slice(0, cloneCount);
    
    return [...startClones, ...items, ...endClones];
  }, [items]);

  const actualStartIndex = useMemo(() => {
    if (items.length <= 1) return 0;
    return Math.min(3, items.length);
  }, [items.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(() => {
      next();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  // Handle seamless loop
  useEffect(() => {
    if (items.length <= 1) return;

    const handleTransitionEnd = () => {
      setIsTransitioning(false);
      
      // Reset position for seamless loop
      if (currentIndex >= actualStartIndex + items.length) {
        // At the end clones, jump to beginning
        setCurrentIndex(actualStartIndex);
      } else if (currentIndex < actualStartIndex) {
        // At the start clones, jump to end
        setCurrentIndex(actualStartIndex + items.length - 1);
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('transitionend', handleTransitionEnd);
      return () => carousel.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [currentIndex, actualStartIndex, items.length]);

  // Initialize position
  useEffect(() => {
    if (items.length > 1) {
      setCurrentIndex(actualStartIndex);
    }
  }, [actualStartIndex, items.length]);

  const next = () => {
    if (items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  };

  const prev = () => {
    if (items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
  };

  const goTo = (index: number) => {
    if (items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(actualStartIndex + index);
  };

  const getCurrentSlideIndex = () => {
    if (items.length <= 1) return 0;
    return (currentIndex - actualStartIndex + items.length) % items.length;
  };

  return {
    extendedItems,
    currentIndex,
    isTransitioning,
    carouselRef,
    next,
    prev,
    goTo,
    getCurrentSlideIndex,
    canInteract: items.length > 1
  };
};

// ------------ Component ------------
const TeslaPartsHomepage = () => {
  const router = useRouter();
  // Data
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // UI
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filters (pending)
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filters (applied)
  const [appliedModel, setAppliedModel] = useState("all");
  const [appliedCategory, setAppliedCategory] = useState("all");
  const [appliedSubcategory, setAppliedSubcategory] = useState("all");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  // Models with counts
  const [teslaModels, setTeslaModels] = useState<TeslaModel[]>([
    { id: "all", name: "All Models", count: 0 },
    { id: "MODEL_3", name: "Model 3", count: 0 },
    { id: "MODEL_Y", name: "Model Y", count: 0 },
    { id: "MODEL_S", name: "Model S", count: 0 },
    { id: "MODEL_X", name: "Model X", count: 0 },
  ]);

  // Carousel
  const carousel = useCarousel(featuredProducts, { autoPlay: true, interval: 4000 });

  // Hero
  const heroSlides: HeroSlide[] = [
    {
      title: "Premium Tesla Model 3 Parts",
      subtitle: "Authentic components for every repair and upgrade",
      description: "Over 615 genuine Tesla Model 3 parts in stock",
      ctaText: "Shop Model 3 Parts",
      image: "/images/hero-1.jpg",
    },
    {
      title: "Model Y Parts Coming Soon",
      subtitle: "Expanding our collection with 600+ Model Y components",
      description: "The same quality and precision for your Model Y",
      ctaText: "Get Notified",
      image: "/images/hero-2.jpg",
    },
    {
      title: "Professional Installation",
      subtitle: "Expert service and genuine parts guarantee",
      description: "Quality you can trust, service you can count on",
      ctaText: "Learn More",
      image: "/images/hero-3.jpg",
    },
  ];

  const stats: Stat[] = [
    { label: "Tesla Parts", value: "615+", icon: Package },
    { label: "Categories", value: "103", icon: TrendingUp },
    { label: "Happy Customers", value: "2.5K+", icon: Users },
    { label: "Quality Rating", value: "4.9/5", icon: Award },
  ];

  // ------------ Fetch ------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await fetch("/api/products");
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const products: Product[] =
            productsData?.products || productsData || [];
          setAllProducts(products);

          // Get featured products (always set, even if empty)
          const featured = products.filter((p) => p.isFeatured === true);
          setFeaturedProducts(featured);

          const modelCounts = products.reduce<Record<string, number>>(
            (acc, product) => {
              if (product.compatibleModels) {
                product.compatibleModels.split(",").forEach((m) => {
                  const k = m.trim();
                  if (k) acc[k] = (acc[k] || 0) + 1;
                });
              }
              return acc;
            },
            {}
          );
          setTeslaModels((prev) =>
            prev.map((m) => ({
              ...m,
              count: m.id === "all" ? products.length : modelCounts[m.id] || 0,
            }))
          );
        }

        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(
            Array.isArray(categoriesData)
              ? categoriesData
              : categoriesData?.items || []
          );
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ------------ Hero auto-rotate ------------
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentImageIndex((i) => (i + 1) % heroSlides.length),
      6000
    );
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // ------------ Category helpers ------------
  const getMainCategories = useMemo(
    (): Category[] => categories.filter((c) => c.level === 2),
    [categories]
  );

  const getSubcategories = useMemo((): Category[] => {
    if (selectedCategory === "all") return [];
    return categories.filter(
      (c) => c.level === 3 && c.parentId === selectedCategory
    );
  }, [categories, selectedCategory]);

  // ------------ Filtering ------------
  const hasUnappliedChanges =
    selectedModel !== appliedModel ||
    selectedCategory !== appliedCategory ||
    selectedSubcategory !== appliedSubcategory ||
    searchQuery !== appliedSearchQuery;

  const hasActiveFilters =
    appliedModel !== "all" ||
    appliedCategory !== "all" ||
    appliedSubcategory !== "all" ||
    appliedSearchQuery.trim() !== "";

  const applyFilters = () => {
    setAppliedModel(selectedModel);
    setAppliedCategory(selectedCategory);
    setAppliedSubcategory(selectedSubcategory);
    setAppliedSearchQuery(searchQuery);
  };

  const clearAllFilters = () => {
    setSelectedModel("all");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSearchQuery("");
    setAppliedModel("all");
    setAppliedCategory("all");
    setAppliedSubcategory("all");
    setAppliedSearchQuery("");
  };

  const filteredProducts = useMemo((): Product[] => {
    let filtered = allProducts;

    if (appliedModel !== "all") {
      filtered = filtered.filter(
        (p) =>
          p.compatibleModels &&
          p
            .compatibleModels.split(",")
            .map((m) => m.trim())
            .includes(appliedModel)
      );
    }

    if (appliedCategory !== "all") {
      const subIds = categories
        .filter((c) => c.parentId === appliedCategory)
        .map((c) => c.id);
      filtered = filtered.filter(
        (p) => p.categoryId === appliedCategory || subIds.includes(p.categoryId)
      );
    }

    if (appliedSubcategory !== "all") {
      filtered = filtered.filter((p) => p.categoryId === appliedSubcategory);
    }

    const q = appliedSearchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((p) => {
        const inName = p.name.toLowerCase().includes(q);
        const inSku = p.sku.toLowerCase().includes(q);
        const inDesc = p.description?.toLowerCase().includes(q);
        return inName || inSku || !!inDesc;
      });
    }

    return filtered;
  }, [
    allProducts,
    categories,
    appliedModel,
    appliedCategory,
    appliedSubcategory,
    appliedSearchQuery,
  ]);

  // When no filters are applied, show nothing in the top grid
  const primaryProducts = hasActiveFilters ? filteredProducts : [];

  // ------------ Handlers ------------
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setSelectedCategory("all");
    setSelectedSubcategory("all");
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("all");
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const addToCart = (productId: string) => {
    setCartCount((prev) => prev + 1);
    console.log("Added to cart:", productId);
  };

  // ------------ Product Cards ------------
  function ProductCardBase({ product, className = "" }: { product: Product; className?: string }) {
    const router = useRouter();

    const handleProductClick = () => {
      router.push(`/products/${product.slug}`);
    };

    return (
      <div 
        className={`group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
        onClick={handleProductClick}
      >
        {/* Image */}
        <div className="relative aspect-square bg-slate-100 overflow-hidden">
          {product.images?.length ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0].url}
              alt={product.images[0].altText || product.name}
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
              <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                <Star className="h-3 w-3 fill-current" />
                <span>Featured</span>
              </span>
            )}
            {product.isActive === false && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Inactive
              </span>
            )}
          </div>

          {/* Quick Actions - Stop propagation to prevent navigation */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
              className={`p-2 rounded-full shadow-md transition-colors ${
                favorites.has(product.id)
                  ? "bg-red-500 text-white"
                  : "bg-white text-slate-600 hover:text-red-500"
              }`}
              aria-label="Toggle favorite"
            >
              <Heart className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Add quick view functionality here
              }}
              className="p-2 bg-white text-slate-600 hover:text-slate-900 rounded-full shadow-md transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-3 w-3" />
            </button>
          </div>

          {/* Stock overlay */}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
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
            {typeof product.compareAtPrice === "number" && (
              <span className="text-xs text-slate-500 line-through">
                ${Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="text-xs text-slate-600 mb-3">
            {product.stockQuantity > 0 ? (
              <span className="text-green-600">
                ✓ In Stock ({product.stockQuantity})
              </span>
            ) : (
              <span className="text-red-600">✗ Out of Stock</span>
            )}
          </div>

          {/* Add to cart - Stop propagation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product.id);
            }}
            disabled={product.stockQuantity === 0}
            className={`w-full py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
              product.stockQuantity > 0
                ? "bg-slate-900 text-white hover:bg-slate-800 hover:scale-105"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="h-3 w-3" />
            <span>{product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid version - responsive width
  function GridProductCard({ product }: { product: Product }) {
    return <ProductCardBase product={product} className="" />;
  }

  // Carousel version - fixed width
  function CarouselProductCard({ product }: { product: Product }) {
    return <ProductCardBase product={product} className="flex-shrink-0 w-72" />;
  }

  // ------------ Render ------------
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
                style={{ objectPosition: "center" }}
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
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
                <span
                  className="block text-white"
                  style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.8)" }}
                >
                  {currentSlide.title.split(" ").slice(0, 2).join(" ")}
                </span>
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent font-black">
                  {currentSlide.title.split(" ").slice(2).join(" ")}
                </span>
              </h1>

              <p
                className="text-xl text-white leading-relaxed mb-10 max-w-lg font-medium"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
              >
                {currentSlide.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() =>
                    document
                      .getElementById("products-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
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
              {stats.map((stat, index) => (
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
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentImageIndex === index
                  ? "bg-white shadow-lg"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Enhanced Filters Section */}
      <section
        id="products-section"
        className="py-8 bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center justify-between w-full p-4 bg-slate-100 rounded-lg"
            >
              <span className="font-medium text-slate-900">Filters & Search</span>
              <Filter className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          <div className={`${showFilters ? "block" : "hidden lg:block"}`}>
            {/* Search Bar */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Products
              </label>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Tesla Model Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tesla Model
                </label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none bg-white"
                  >
                    {teslaModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.count})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Main Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none bg-white"
                  >
                    <option value="all">All Categories</option>
                    {getMainCategories.map((category) => {
                      const subIds = categories
                        .filter((c) => c.parentId === category.id)
                        .map((c) => c.id);
                      const productCount = allProducts.filter(
                        (p) =>
                          p.categoryId === category.id ||
                          subIds.includes(p.categoryId)
                      ).length;

                      return (
                        <option key={category.id} value={category.id}>
                          {category.name} ({productCount})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Subcategory Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subcategory
                </label>
                <div className="relative">
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
                    disabled={selectedCategory === "all"}
                  >
                    <option value="all">
                      {selectedCategory === "all"
                        ? "Select category first"
                        : "All Subcategories"}
                    </option>
                    {getSubcategories.map((subcat) => {
                      const productCount = allProducts.filter(
                        (p) => p.categoryId === subcat.id
                      ).length;
                      return (
                        <option key={subcat.id} value={subcat.id}>
                          {subcat.name} ({productCount})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  onClick={applyFilters}
                  disabled={!hasUnappliedChanges}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    hasUnappliedChanges
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 shadow-md"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>Show Results</span>
                  {hasUnappliedChanges && (
                    <span className="bg-emerald-700 text-emerald-100 text-xs px-2 py-1 rounded-full">
                      Updated
                    </span>
                  )}
                </button>

                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>

              {/* Results Preview */}
              <div className="text-sm text-slate-600">
                {hasUnappliedChanges ? (
                  <span className="text-orange-600 font-medium">
                    Click "Show Results" to apply filters
                  </span>
                ) : hasActiveFilters ? (
                  <span className="text-emerald-600 font-medium">
                    Showing {primaryProducts.length} filtered products
                  </span>
                ) : (
                  <span>Use filters to see products</span>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-emerald-800">
                    Active Filters:
                  </span>

                  {appliedModel !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {teslaModels.find((m) => m.id === appliedModel)?.name}
                      <button
                        onClick={() => {
                          setSelectedModel("all");
                          setAppliedModel("all");
                        }}
                        className="ml-1 hover:text-emerald-900"
                        aria-label="Remove model filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {appliedCategory !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {categories.find((c) => c.id === appliedCategory)?.name}
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setAppliedCategory("all");
                        }}
                        className="ml-1 hover:text-blue-900"
                        aria-label="Remove category filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {appliedSubcategory !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {categories.find((c) => c.id === appliedSubcategory)?.name}
                      <button
                        onClick={() => {
                          setSelectedSubcategory("all");
                          setAppliedSubcategory("all");
                        }}
                        className="ml-1 hover:text-purple-900"
                        aria-label="Remove subcategory filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {appliedSearchQuery && (
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      "{appliedSearchQuery}"
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setAppliedSearchQuery("");
                        }}
                        className="ml-1 hover:text-yellow-900"
                        aria-label="Clear search"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTS: Filtered only (hidden when no filters) */}
      {hasActiveFilters && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-light text-slate-900 mb-2">
                  Filtered Products
                </h2>
                <p className="text-xl text-slate-600">
                  {primaryProducts.length} products match your selection
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:120ms]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:240ms]" />
                </div>
                <p className="text-slate-500 mt-4 font-light">Loading products...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {primaryProducts.slice(0, 15).map((p) => (
                    <GridProductCard key={p.id} product={p} />
                  ))}
                </div>

                {primaryProducts.length === 0 && (
                  <div className="text-center py-16">
                    <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Try adjusting your filters or search terms.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* FEATURED: Always visible with carousel */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-light text-slate-900 mb-2">
                Featured Products
              </h2>
              <p className="text-xl text-slate-600">
                {featuredProducts.length > 0 
                  ? "Our most popular and highest-rated Tesla parts"
                  : "No featured products available right now"
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
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:120ms]" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:240ms]" />
              </div>
              <p className="text-slate-500 mt-4 font-light">Loading featured products...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
              <div className="relative inline-block mb-6">
                <Star className="h-16 w-16 text-slate-400 mx-auto" />
                <div className="absolute -top-2 -right-2">
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 text-sm font-bold">0</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                No Featured Products Yet
              </h3>
              <p className="text-slate-600 max-w-md mx-auto text-lg leading-relaxed mb-6">
                We're carefully selecting the best Tesla parts to feature here. 
                Check back soon for our top recommendations!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Admin:</strong> Mark products as "Featured" in the admin dashboard to display them here.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div
                  ref={carousel.carouselRef}
                  className="flex gap-6 transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${carousel.currentIndex * (288 + 24)}px)`, // 288px = w-72, 24px = gap-6
                    transition: carousel.isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                  }}
                >
                  {carousel.extendedItems.map((product, index) => (
                    <CarouselProductCard key={`${product.id}-${index}`} product={product} />
                  ))}
                </div>
              </div>

              {/* Navigation Controls */}
              {carousel.canInteract && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={carousel.prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
                    aria-label="Previous products"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={carousel.next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
                    aria-label="Next products"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                  </button>
                </>
              )}

              {/* Indicators */}
              {carousel.canInteract && (
                <div className="flex justify-center mt-8 space-x-2">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => carousel.goTo(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        carousel.getCurrentSlideIndex() === index
                          ? "bg-slate-900 w-6"
                          : "bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Go to product ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Featured Count Badge */}
              <div className="absolute -top-6 right-0">
                <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{featuredProducts.length} Featured</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default TeslaPartsHomepage;