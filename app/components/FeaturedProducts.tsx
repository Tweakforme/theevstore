/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useMemo, useState, useRef } from "react";
import Image from "next/image";
import {
  Hand,
  Heart,
  Package,
  Shield,
  Truck,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   Types
========================================================= */
type ID = string;

interface ProductImage {
  id: ID;
  url: string;
  altText?: string;
}

interface Product {
  id: ID;
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
  categoryId: ID;
  category?: { name: string };
  images?: ProductImage[];
}

interface Category {
  id: ID;
  name: string;
  parentId: ID | null;
  level?: number;
}

interface TeslaModel {
  id: string;
  name: string;
  count: number;
}

interface FeaturedProductsProps {
  featuredProducts: Product[];
  categories: Category[];
  teslaModels: TeslaModel[];
  loading: boolean;
  onAddToCart: (productId: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}

/* =========================================================
   Utils
========================================================= */
const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const toMoney = (v: number) => `$${Number(v || 0).toFixed(2)}`;

/* =========================================================
   Premium Product Card with Enhanced Interactions
========================================================= */
function PremiumProductCard({ 
  product, 
  onAddToCart, 
  favorites, 
  onToggleFavorite,
  index 
}: { 
  product: Product;
  onAddToCart: (id: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div 
      className="group relative bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-2xl hover:border-slate-300/80 transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Premium Badge */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        </div>
      </div>

      {/* Heart Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(product.id);
        }}
        className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all duration-300 shadow-lg group/heart"
        aria-label="Toggle favorite"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-300 group-hover/heart:scale-110",
            favorites.has(product.id) 
              ? "fill-red-500 text-red-500" 
              : "text-slate-600 group-hover/heart:text-red-500"
          )}
        />
      </button>

      {/* Premium Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {product.images?.[0]?.url ? (
          <>
            <Image
              src={product.images[0].url}
              alt={product.images[0].altText || product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-slate-400" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )} />

        {/* Quick Actions Overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-500",
          isHovered ? "opacity-100 backdrop-blur-[1px]" : "opacity-0"
        )}>
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product.id);
              }}
              disabled={product.stockQuantity === 0}
              className="px-6 py-3 bg-white/95 backdrop-blur-md text-slate-900 font-semibold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 disabled:bg-slate-300/90 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
            >
              {product.stockQuantity === 0 ? (
                <>
                  <Package className="h-4 w-4" />
                  Out of Stock
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Quick Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stock Status Indicator */}
        <div className="absolute bottom-4 left-4">
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md",
            product.stockQuantity > 0 
              ? "bg-emerald-500/90 text-white" 
              : "bg-red-500/90 text-white"
          )}>
            {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Category Tag */}
        <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
          {product.category?.name || "Tesla Parts"}
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-slate-900">
                {toMoney(product.price)}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                <span className="text-sm text-slate-500 line-through">
                  {toMoney(Number(product.compareAtPrice))}
                </span>
              )}
            </div>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <div className="text-xs text-emerald-600 font-semibold">
                Save {toMoney(Number(product.compareAtPrice) - product.price)}
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id);
            }}
            disabled={product.stockQuantity === 0}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2",
              product.stockQuantity > 0
                ? "bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:scale-105"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            <Hand className="h-4 w-4" />
            <span className="hidden sm:inline">
              {product.stockQuantity > 0 ? "Add" : "Out"}
            </span>
          </button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={cn(
        "absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-0 transition-opacity duration-500 -z-10",
        isHovered && "opacity-20"
      )} />
    </div>
  );
}

/* =========================================================
   Enhanced Carousel Controls
========================================================= */
function CarouselControls({ 
  onPrevious, 
  onNext, 
  canGoLeft, 
  canGoRight 
}: {
  onPrevious: () => void;
  onNext: () => void;
  canGoLeft: boolean;
  canGoRight: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrevious}
        disabled={!canGoLeft}
        className="p-3 rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={onNext}
        disabled={!canGoRight}
        className="p-3 rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

/* =========================================================
   Trust Badges Component (Enhanced)
========================================================= */
function EnhancedTrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "OEM Quality Guarantee",
      description: "Meets or exceeds Tesla specifications for perfect fit & performance",
      color: "from-emerald-500 to-green-500",
      delay: "0ms"
    },
    {
      icon: Truck,
      title: "Fast & Secure Shipping",
      description: "Express options with tracking. Most orders ship within 24h",
      color: "from-blue-500 to-cyan-500",
      delay: "100ms"
    },
    {
      icon: RefreshCw,
      title: "Easy Returns",
      description: "30‑day hassle‑free returns. If it doesn't fit, we'll make it right",
      color: "from-amber-500 to-rose-500",
      delay: "200ms"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-slate-900 mb-4">
            Why Tesla owners trust us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {badges.map((badge, index) => (
            <div 
              key={badge.title}
              className="group text-center p-8 rounded-2xl bg-white shadow-lg border border-slate-200 hover:shadow-2xl hover:border-slate-300 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: badge.delay }}
            >
              <div className={cn(
                "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl",
                `bg-gradient-to-r ${badge.color}`
              )}>
                <badge.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {badge.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Enhanced Newsletter Component
========================================================= */
function EnhancedNewsletter({ model3Count, modelYCount, categories }: { 
  model3Count: number; 
  modelYCount: number; 
  categories: Category[]; 
}) {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
        <div className="mb-12">
          <h2 className="text-5xl font-light mb-4">Our Numbers Game</h2>
        
        </div>

    

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-2">{model3Count || 615}+</div>
            <div className="text-slate-300">Model 3 Parts</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{modelYCount || 0}+</div>
            <div className="text-slate-300">Model Y Parts</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">{categories.length}</div>
            <div className="text-slate-300">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">4.9</div>
            <div className="text-slate-300">Customer Rating</div>
          </div>
        </div>

        {!modelYCount && (
          <p className="text-sm text-slate-400 mt-8 opacity-75">*Model Y parts coming soon</p>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   Main Enhanced Featured Products Component
========================================================= */
const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  featuredProducts,
  categories,
  teslaModels,
  loading,
  onAddToCart,
  favorites,
  onToggleFavorite,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const model3Count = teslaModels.find((m) => m.id === "MODEL_3")?.count || 0;
  const modelYCount = teslaModels.find((m) => m.id === "MODEL_Y")?.count || 0;

  // Carousel logic
  const itemsPerSlide = 4;
  const maxSlides = Math.max(0, Math.ceil(featuredProducts.length / itemsPerSlide) - 1);
  
  const goToSlide = (slide: number) => {
    const newSlide = Math.max(0, Math.min(slide, maxSlides));
    setCurrentSlide(newSlide);
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  return (
    <>
      {/* Enhanced Featured Products Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
             
              Handpicked Selection
            </div>
            <h2 className="text-5xl font-light text-slate-900 mb-6">
              Featured Products
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Our most popular and highest-rated Tesla parts, chosen by our community of satisfied customers.
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mx-auto mt-8" />
          </div>

          {loading ? (
            <div className="text-center py-24">
              <div className="inline-flex gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" />
                <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-slate-500 text-lg">Curating the perfect selection...</p>
            </div>
          ) : featuredProducts.length ? (
            <>
              {/* Desktop Carousel */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-slate-600">
                    {featuredProducts.length} premium products selected
                  </div>
                  <div className="flex items-center gap-4">
                    <CarouselControls
                      onPrevious={prevSlide}
                      onNext={nextSlide}
                      canGoLeft={currentSlide > 0}
                      canGoRight={currentSlide < maxSlides}
                    />
                    <a
                      href="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      View All Products
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl">
                  <div 
                    ref={carouselRef}
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{
                      transform: `translateX(-${currentSlide * 100}%)`,
                    }}
                  >
                    {Array.from({ length: Math.ceil(featuredProducts.length / itemsPerSlide) }).map((_, slideIndex) => (
                      <div key={slideIndex} className="min-w-full">
                        <div className="grid grid-cols-4 gap-6 px-2">
                          {featuredProducts
                            .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                            .map((product, index) => (
                              <PremiumProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={onAddToCart}
                                favorites={favorites}
                                onToggleFavorite={onToggleFavorite}
                                index={index}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slide Indicators */}
                {maxSlides > 0 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: maxSlides + 1 }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={cn(
                          "w-3 h-3 rounded-full transition-all duration-300",
                          currentSlide === index 
                            ? "bg-emerald-500 scale-125" 
                            : "bg-slate-300 hover:bg-slate-400"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Grid */}
              <div className="lg:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {featuredProducts.slice(0, 6).map((product, index) => (
                    <PremiumProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      favorites={favorites}
                      onToggleFavorite={onToggleFavorite}
                      index={index}
                    />
                  ))}
                </div>
                
                <div className="text-center">
                  <a
                    href="/products"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    View All Products
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-gradient-to-br from-slate-100/50 to-white rounded-3xl border-2 border-dashed border-slate-300">
              <div className="relative inline-block mb-8">
                <Package className="h-20 w-20 text-slate-400 mx-auto" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                  <span className="text-slate-600 text-sm font-bold">0</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                No Featured Products Yet
              </h3>
              <p className="text-slate-600 max-w-md mx-auto text-lg leading-relaxed mb-8">
                We&apos;re carefully curating the best Tesla parts to feature here. 
                Check back soon for our top recommendations!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Admin:</strong> Mark products as &quot;Featured&quot; in the admin dashboard to display them here.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Trust Badges */}
      <EnhancedTrustBadges />

      {/* Enhanced Newsletter */}
      <EnhancedNewsletter 
        model3Count={model3Count} 
        modelYCount={modelYCount} 
        categories={categories} 
      />
    </>
  );
};

export default FeaturedProducts;