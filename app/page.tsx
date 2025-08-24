"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Search,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  Heart,
  Package,
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

/* =========================
   Types
========================= */

type ID = string;

interface FilterState {
  selectedModel: string;
  selectedCategory: string;
  selectedSubcategory: string;
  searchQuery: string;
  appliedModel: string;
  appliedCategory: string;
  appliedSubcategory: string;
  appliedSearchQuery: string;
}

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
  compatibleModels?: string; // e.g. "MODEL_3, MODEL_Y"
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

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  image: string;
  imageMobile?: string;
}

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CartItem {
  productId: ID;
  name: string;
  price: number;
  quantity: number;
  addedAt?: string;
}

interface ApiCartItem {
  quantity: number;
}

interface ApiCartResponse {
  items?: ApiCartItem[];
  cartCount?: number;
  message?: string;
  error?: string;
  isGuest?: boolean;
  product?: { id: ID; name: string; price: number };
}

interface ApiProductsResponse {
  products?: Product[];
}

type ApiCategoriesResponse = Category[] | { items?: Category[] };

/* =========================
   Utilities
========================= */

async function safeJson<T>(res: Response, endpointName: string): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    // Surface a nicer error so we know exactly which endpoint returned HTML
    throw new Error(
      `Expected JSON from ${endpointName} (status ${res.status}), got content-type="${contentType}". First 120 chars: ${text.slice(
        0,
        120
      )}`
    );
  }
  return (await res.json()) as T;
}

function normalizeModelTag(tag: string): string {
  return tag.trim().toUpperCase().replace(/\s+/g, "_");
}

/* =========================
   Carousel Hook (featured)
========================= */

const useCarousel = (
  items: Product[],
  options: { autoPlay?: boolean; interval?: number } = {}
) => {
  const { autoPlay = true, interval = 3000 } = options;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const extendedItems = useMemo(() => {
    if (items.length === 0) return [];
    if (items.length === 1) return [items[0], items[0], items[0]];
    const cloneCount = Math.min(3, items.length);
    const startClones = items.slice(-cloneCount);
    const endClones = items.slice(0, cloneCount);
    return [...startClones, ...items, ...endClones];
  }, [items]);

  const actualStartIndex = useMemo(() => {
    if (items.length <= 1) return 0;
    return Math.min(3, items.length);
  }, [items.length]);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  useEffect(() => {
    if (items.length <= 1) return;

    const handleTransitionEnd = () => {
      setIsTransitioning(false);
      if (currentIndex >= actualStartIndex + items.length) {
        setCurrentIndex(actualStartIndex);
      } else if (currentIndex < actualStartIndex) {
        setCurrentIndex(actualStartIndex + items.length - 1);
      }
    };

    const el = carouselRef.current;
    if (el) {
      el.addEventListener("transitionend", handleTransitionEnd);
      return () => el.removeEventListener("transitionend", handleTransitionEnd);
    }
  }, [currentIndex, actualStartIndex, items.length]);

  useEffect(() => {
    if (items.length > 1) {
      setCurrentIndex(actualStartIndex);
    }
  }, [actualStartIndex, items.length]);

  const next = () => {
    if (items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prev = () => {
    if (items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
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
    canInteract: items.length > 1,
  };
};

/* =========================
   Next-level Hero Component
========================= */

function Hero({ slides, stats }: { slides: HeroSlide[]; stats: Stat[] }) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReducedMotion(!!mq?.matches);
    const handler = () => setReducedMotion(!!mq?.matches);
    mq?.addEventListener?.("change", handler);
    return () => mq?.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion || slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length, reducedMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % slides.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + slides.length) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const go = (i: number) => setIndex(i);

  return (
    <section className="relative min-h-[90vh] flex items-center isolate overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: index === i ? 1 : 0 }}
            aria-hidden={index === i ? "false" : "true"}
          >
            <div className="hidden sm:block absolute inset-0">
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="sm:hidden absolute inset-0">
              <Image
                src={s.imageMobile ?? s.image}
                alt={s.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>

            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.45) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Frosted content card */}
          <div className="max-w-xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white/90 text-xs sm:text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4 mr-2 text-emerald-300" />
              <span>{slides[index]?.subtitle}</span>
            </div>

            <h1 className="text-white tracking-tight mb-5">
              <span className="block text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
                {slides[index]?.title}
              </span>
            </h1>

            <p className="text-white/90 text-base sm:text-lg lg:text-xl leading-relaxed mb-8">
              {slides[index]?.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() =>
                  document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-7 py-3 sm:px-9 sm:py-4 rounded-full bg-white text-slate-900 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
              >
                {slides[index]?.ctaText}
              </button>
              <button
                className="px-7 py-3 sm:px-9 sm:py-4 rounded-full border-2 border-white/70 text-white font-semibold text-sm sm:text-base hover:bg-white/10 backdrop-blur-md transition"
                onClick={() =>
                  document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Browse Categories
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 sm:p-6 text-white/95 bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 transition"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 mb-3 sm:mb-4">
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dots + swipe */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10"
        onTouchStart={(e) =>
          ((e.currentTarget as HTMLElement).dataset.x = String(e.touches[0].clientX))
        }
        onTouchEnd={(e) => {
          const start = Number((e.currentTarget as HTMLElement).dataset.x || 0);
          const delta = e.changedTouches[0].clientX - start;
          if (Math.abs(delta) > 40) {
            setIndex((i) => (delta < 0 ? (i + 1) % slides.length : (i - 1 + slides.length) % slides.length));
          }
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              index === i ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================
   Page
========================= */

const TeslaPartsHomepage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  // Hydration guard: we only read localStorage after mount
  const [hydrated, setHydrated] = useState(false);

  // Data
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // UI
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filters (pending)
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filters (applied)
  const [appliedModel, setAppliedModel] = useState<string>("all");
  const [appliedCategory, setAppliedCategory] = useState<string>("all");
  const [appliedSubcategory, setAppliedSubcategory] = useState<string>("all");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>("");

  const [teslaModels, setTeslaModels] = useState<TeslaModel[]>([
    { id: "all", name: "All Models", count: 0 },
    { id: "MODEL_3", name: "Model 3", count: 0 },
    { id: "MODEL_Y", name: "Model Y", count: 0 },
    { id: "MODEL_S", name: "Model S", count: 0 },
    { id: "MODEL_X", name: "Model X", count: 0 },
  ]);

  // Read persisted filters after mount to avoid hydration mismatches
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("homepage-filters") : null;
      if (saved) {
        const parsed: FilterState = JSON.parse(saved);
        setSelectedModel(parsed.selectedModel ?? "all");
        setSelectedCategory(parsed.selectedCategory ?? "all");
        setSelectedSubcategory(parsed.selectedSubcategory ?? "all");
        setSearchQuery(parsed.searchQuery ?? "");
        setAppliedModel(parsed.appliedModel ?? "all");
        setAppliedCategory(parsed.appliedCategory ?? "all");
        setAppliedSubcategory(parsed.appliedSubcategory ?? "all");
        setAppliedSearchQuery(parsed.appliedSearchQuery ?? "");
      }
    } catch (err) {
      // If localStorage is corrupt, ignore but don't break SSR hydration
      // eslint-disable-next-line no-console
      console.error("Error parsing saved filters:", err);
    } finally {
      setHydrated(true);
    }
  }, []);

  // persist filters (only after hydrated)
  useEffect(() => {
    if (!hydrated) return;
    const filterState: FilterState = {
      selectedModel,
      selectedCategory,
      selectedSubcategory,
      searchQuery,
      appliedModel,
      appliedCategory,
      appliedSubcategory,
      appliedSearchQuery,
    };
    localStorage.setItem("homepage-filters", JSON.stringify(filterState));
  }, [
    hydrated,
    selectedModel,
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    appliedModel,
    appliedCategory,
    appliedSubcategory,
    appliedSearchQuery,
  ]);

  /* ------------ Cart Management ------------ */

  useEffect(() => {
    const loadCartCount = async () => {
      try {
        if (session) {
          const response = await fetch("/api/cart");
          if (!response.ok) {
            // don't parse JSON if it's an error page
            throw new Error(`Cart API returned ${response.status}`);
          }
          const data = await safeJson<ApiCartResponse>(response, "/api/cart");
          const count = data.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
          setCartCount(count);
        } else if (typeof window !== "undefined") {
          const guestCart = localStorage.getItem("guestCart");
          if (guestCart) {
            const cartItems: CartItem[] = JSON.parse(guestCart);
            const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(count);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading cart count:", error);
        setCartCount(0);
      }
    };
    loadCartCount();
  }, [session]);

  useEffect(() => {
    const handleCartUpdate = (event: Event) => {
      const custom = event as CustomEvent<{ count?: number }>;
      setCartCount(custom.detail?.count ?? 0);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("cartUpdated", handleCartUpdate as EventListener);
      return () => window.removeEventListener("cartUpdated", handleCartUpdate as EventListener);
    }
  }, []);

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await safeJson<ApiCartResponse>(response, "/api/cart/add");

      if (response.ok) {
        alert(`✅ ${data.message || "Added to cart successfully!"}`);

        if (data.isGuest && data.product) {
          handleGuestCartFromHomepage(
            { id: data.product.id, name: data.product.name, price: data.product.price },
            1
          );
        } else {
          setCartCount(data.cartCount ?? cartCount + 1);
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("cartUpdated", {
                detail: { count: data.cartCount },
              })
            );
          }
        }
      } else {
        alert(`❌ ${data.error || "Failed to add to cart"}`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Add to cart error:", error);
      alert("❌ Network error. Please try again.");
    }
  };

  const handleGuestCartFromHomepage = (
    product: { id: ID; name: string; price: number },
    quantity: number
  ) => {
    try {
      const existingCart = typeof window !== "undefined" ? localStorage.getItem("guestCart") : null;
      const cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
      const existingItemIndex = cartItems.findIndex((item) => item.productId === product.id);

      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        cartItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          addedAt: new Date().toISOString(),
        });
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("guestCart", JSON.stringify(cartItems));
      }
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cartUpdated", {
            detail: { count: totalItems, isGuest: true },
          })
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving to guest cart:", error);
    }
  };

  /* ------------ Fetch ------------ */

  useEffect(() => {
    const fetchData = async () => {
      try {
        // PRODUCTS
        const productsRes = await fetch("/api/products");
        if (!productsRes.ok) {
          // Avoid trying to parse HTML
          throw new Error(`/api/products returned ${productsRes.status}`);
        }
        const productsData = await safeJson<ApiProductsResponse>(productsRes, "/api/products");
        const products: Product[] = productsData?.products ?? (productsData as unknown as Product[]) ?? [];
        setAllProducts(products);

        // FEATURED
        const featured = products.filter((p) => p.isFeatured === true);
        setFeaturedProducts(featured);

        // MODEL COUNTS
        const modelCounts = products.reduce<Record<string, number>>((acc, product) => {
          if (product.compatibleModels) {
            product.compatibleModels.split(",").forEach((m) => {
              const k = normalizeModelTag(m);
              if (k) acc[k] = (acc[k] ?? 0) + 1;
            });
          }
          return acc;
        }, {});
        setTeslaModels((prev) =>
          prev.map((m) => ({
            ...m,
            count: m.id === "all" ? products.length : modelCounts[m.id] ?? 0,
          }))
        );

        // CATEGORIES
        const categoriesRes = await fetch("/api/categories");
        if (!categoriesRes.ok) {
          throw new Error(`/api/categories returned ${categoriesRes.status}`);
        }
        const categoriesData = await safeJson<ApiCategoriesResponse>(categoriesRes, "/api/categories");
        const parsedCategories: Category[] = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.items ?? [];
        setCategories(parsedCategories);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ------------ Category helpers ------------ */

  const mainCategories = useMemo(
    () => categories.filter((c) => c.level === 2),
    [categories]
  );

  const subcategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    return categories.filter((c) => c.level === 3 && c.parentId === selectedCategory);
  }, [categories, selectedCategory]);

  /* ------------ Filtering ------------ */

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
    if (typeof window !== "undefined") {
      localStorage.removeItem("homepage-filters");
    }
  };

  const filteredProducts = useMemo((): Product[] => {
    let filtered = allProducts;

    if (appliedModel !== "all") {
      filtered = filtered.filter(
        (p) =>
          p.compatibleModels &&
          p
            .compatibleModels.split(",")
            .map((m) => normalizeModelTag(m))
            .includes(appliedModel)
      );
    }

    if (appliedCategory !== "all") {
      const subIds = categories.filter((c) => c.parentId === appliedCategory).map((c) => c.id);
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
        const inDesc = p.description?.toLowerCase().includes(q) ?? false;
        return inName || inSku || inDesc;
      });
    }

    return filtered;
  }, [allProducts, categories, appliedModel, appliedCategory, appliedSubcategory, appliedSearchQuery]);

  const primaryProducts = hasActiveFilters ? filteredProducts : [];

  /* ------------ Handlers ------------ */

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

  /* ------------ Product Cards ------------ */

  function ProductCardBase({ product, className = "" }: { product: Product; className?: string }) {
    const handleProductClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      router.push(`/products/${product.slug}`);
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await addToCart(product.id);
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(product.id);
    };

    const price = Number(product.price ?? 0);
    const compare = Number(product.compareAtPrice ?? 0);

    return (
      <div
        className={`group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
        onClick={handleProductClick}
      >
        {/* Image */}
        <div className="relative aspect-square bg-slate-100 overflow-hidden">
          {product.images?.length ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-slate-400" />
            </div>
          )}

          {/* Wishlist Heart */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                favorites.has(product.id)
                  ? "fill-red-500 text-red-500"
                  : "text-slate-600 hover:text-red-500"
              }`}
            />
          </button>

          {/* Quick Add to Cart overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{product.stockQuantity === 0 ? "Out of Stock" : "Quick Add"}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
            {product.category?.name || "Tesla Parts"}
          </div>

          <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-slate-900">${price.toFixed(2)}</span>
                {compare > price && (
                  <span className="text-sm text-slate-500 line-through">${compare.toFixed(2)}</span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              <ShoppingCart className="h-3 w-3" />
              <span className="hidden sm:inline">
                {product.stockQuantity === 0 ? "Out of Stock" : "Add"}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function GridProductCard({ product }: { product: Product }) {
    return <ProductCardBase product={product} />;
  }

  function CarouselProductCard({ product }: { product: Product }) {
    return <ProductCardBase product={product} className="flex-shrink-0 w-72" />;
  }

  /* ------------ Hero & Stats (dynamic with Model Y) ------------ */

  const totalParts = teslaModels.find((m) => m.id === "all")?.count ?? 0;
  const model3Count = teslaModels.find((m) => m.id === "MODEL_3")?.count ?? 0;
  const modelYCount = teslaModels.find((m) => m.id === "MODEL_Y")?.count ?? 0;

  const heroSlides: HeroSlide[] = [
    {
      title: "Premium Tesla Model 3 Parts",
      subtitle: "Authentic components for every repair and upgrade",
      description: `Over ${model3Count || "615+"} genuine Model 3 parts in stock`,
      ctaText: "Shop Model 3 Parts",
      image: "/images/hero-1.jpg",
      imageMobile: "/images/hero-1.jpg",
    },
    {
      title: "Now Stocking Model Y Parts",
      subtitle: "Fresh inventory just added",
      description: `Browse ${modelYCount || "725+"} Model Y parts today`,
      ctaText: "Shop Model Y Parts",
      image: "/images/hero-2.jpg",
      imageMobile: "/images/hero-2.jpg",
    },
    {
      title: "Professional Installation",
      subtitle: "Expert service and genuine parts guarantee",
      description: "Quality you can trust, service you can count on",
      ctaText: "Learn More",
      image: "/images/hero-3.jpg",
      imageMobile: "/images/hero-3.jpg",
    },
  ];

  const stats: Stat[] = [
    { label: "Total Parts", value: totalParts ? `${totalParts}` : "1,300+", icon: Package },
    { label: "Categories", value: `${categories.filter((c) => c.level === 2).length || 103}`, icon: TrendingUp },
    { label: "Happy Customers", value: "2.5K+", icon: Users },
    { label: "Quality Rating", value: "4.9/5", icon: Award },
  ];

  /* ------------ Render ------------ */

  return (
    <main className="bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* New, modern hero */}
      <Hero slides={heroSlides} stats={stats} />

      {/* Filters */}
      <section id="products-section" className="py-8 bg-white border-b border-slate-200">
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Products</label>
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
              {/* Tesla Model */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tesla Model</label>
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

              {/* Main Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none bg-white"
                  >
                    <option value="all">All Categories</option>
                    {mainCategories
                      .filter((category) => {
                        // If Model Y is selected, only show Model Y categories (if you name them distinctly)
                        if (selectedModel === "MODEL_Y") {
                          return category.name.toLowerCase().includes("model y") || !category.name.toLowerCase().includes("model 3");
                        }
                        // If Model 3 is selected, hide explicit "Model Y" categories if you separate them
                        if (selectedModel === "MODEL_3") {
                          return !category.name.toLowerCase().includes("model y");
                        }
                        return true;
                      })
                      .map((category) => {
                        const subIds = categories.filter((c) => c.parentId === category.id).map((c) => c.id);
                        const productCount = allProducts.filter(
                          (p) => p.categoryId === category.id || subIds.includes(p.categoryId)
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

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subcategory</label>
                <div className="relative">
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
                    disabled={selectedCategory === "all"}
                  >
                    <option value="all">
                      {selectedCategory === "all" ? "Select category first" : "All Subcategories"}
                    </option>
                    {subcategories.map((subcat) => {
                      const productCount = allProducts.filter((p) => p.categoryId === subcat.id).length;
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
                    <span className="bg-emerald-700 text-emerald-100 text-xs px-2 py-1 rounded-full">Updated</span>
                  )}
                </button>

                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="text-sm text-slate-600">
                {!hydrated ? (
                  <span className="text-slate-600">Use filters to see products</span>
                ) : hasUnappliedChanges ? (
                  <span className="text-orange-600 font-medium">Click &quot;Show Results&quot; to apply filters</span>
                ) : hasActiveFilters ? (
                  <span className="text-emerald-600 font-medium">
                    Showing {primaryProducts.length} filtered products
                  </span>
                ) : (
                  <span className="text-slate-600">Use filters to see products</span>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {hydrated && hasActiveFilters && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-emerald-800">Active Filters:</span>

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
                      &quot;{appliedSearchQuery}&quot;
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

      {/* PRODUCTS: Filtered */}
      {hydrated && hasActiveFilters && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-light text-slate-900 mb-2">Filtered Products</h2>
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
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
                    <p className="text-slate-600 mb-6">Try adjusting your filters or search terms.</p>
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

      {/* FEATURED */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-light text-slate-900 mb-2">Featured Products</h2>
              <p className="text-xl text-slate-600">
                {featuredProducts.length > 0
                  ? "Our most popular and highest-rated Tesla parts"
                  : "No featured products available right now"}
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

              <h3 className="text-2xl font-semibold text-slate-900 mb-3">No Featured Products Yet</h3>
              <p className="text-slate-600 max-w-md mx-auto text-lg leading-relaxed mb-6">
                We&apos;re carefully selecting the best Tesla parts to feature here. Check back soon for our top
                recommendations!
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                <p className="text-blue-800 text-sm">
                  <strong>Admin:</strong> Mark products as &quot;Featured&quot; in the admin dashboard to display them
                  here.
                </p>
              </div>
            </div>
          ) : (
            <FeaturedCarousel products={featuredProducts} />
          )}
        </div>
      </section>
    </main>
  );
};

/* ============ Featured carousel wrapper ============ */

function FeaturedCarousel({ products }: { products: Product[] }) {
  const carousel = useCarousel(products, { autoPlay: true, interval: 4000 });

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          ref={carousel.carouselRef}
          className="flex gap-6 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${carousel.currentIndex * (288 + 24)}px)`, // 288px = w-72, 24px = gap-6
            transition: carousel.isTransitioning ? "transform 0.5s ease-in-out" : "none",
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
          <button
            onClick={carousel.prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
            aria-label="Previous products"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
          </button>

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
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => carousel.goTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                carousel.getCurrentSlideIndex() === index ? "bg-slate-900 w-6" : "bg-slate-300 hover:bg-slate-400"
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
          <span>{products.length} Featured</span>
        </div>
      </div>
    </div>
  );
}

export default TeslaPartsHomepage;