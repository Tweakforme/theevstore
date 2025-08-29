/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  Package,
  ChevronDown,
  X,
  Filter,
  ShoppingCart,
  Check,
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

interface FilterState {
  selectedModel: string;
  selectedCategory: string;
  selectedSubcategory: string;
  searchQuery: string;
}

interface ProductSearchProps {
  allProducts: Product[];
  categories: Category[];
  teslaModels: TeslaModel[];
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

// Normalize various model tags to canonical tokens
const normalizeModelTag = (tag: string) => {
  if (!tag) return "";
  const cleaned = tag.trim().toUpperCase();

  // Model Y
  if ((cleaned.includes("MODEL") && cleaned.includes("Y")) || cleaned === "MY" || cleaned === "Y")
    return "MODEL_Y";
  // Model 3
  if ((cleaned.includes("MODEL") && cleaned.includes("3")) || cleaned === "M3" || cleaned === "3")
    return "MODEL_3";
  // Model S
  if ((cleaned.includes("MODEL") && cleaned.includes("S")) || cleaned === "MS" || cleaned === "S")
    return "MODEL_S";
  // Model X
  if ((cleaned.includes("MODEL") && cleaned.includes("X")) || cleaned === "MX" || cleaned === "X")
    return "MODEL_X";

  return cleaned.replace(/[^A-Z0-9]+/g, "_");
};

// Split + normalize a compatible model string
const splitModels = (s: string) =>
  (s || "")
    .split(/[|,;/\s]+/)
    .map((m) => normalizeModelTag(m))
    .filter(Boolean)
    .filter((m) => m !== "_");

const FILTER_STORAGE_KEY = "tesla_parts_filters";

/* =========================================================
   Pagination
========================================================= */
function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);

  const go = (n: number) => setPage(Math.min(Math.max(1, n), totalPages));
  const next = () => go(page + 1);
  const prev = () => go(page - 1);
  const reset = () => setPage(1);

  return { page, totalPages, pageItems, next, prev, go, reset };
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  onGo,
  className = "",
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGo: (n: number) => void;
  className?: string;
}) {
  const pages = useMemo(() => {
    const windowSize = 5;
    if (totalPages <= windowSize) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>

      {pages[0] > 1 && (
        <>
          <button
            className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 inline-flex items-center gap-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
            onClick={() => onGo(1)}
          >
            1
          </button>
          <span className="px-1 text-slate-400">…</span>
        </>
      )}

      {pages.map((n) => (
        <button
          key={n}
          onClick={() => onGo(n)}
          className={cn(
            "px-3 py-2 rounded-lg border inline-flex items-center gap-2 focus:outline-none focus:ring-2",
            n === page
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold focus:ring-emerald-300"
              : "border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-300"
          )}
        >
          {n}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          <span className="px-1 text-slate-400">…</span>
          <button
            className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 inline-flex items-center gap-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
            onClick={() => onGo(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* =========================================================
   Filters
========================================================= */
function EnhancedFilterSection({
  pendingFilters,
  setPendingFilters,
  applyFilters,
  teslaModels,
  categories,
  allProducts,
  showFilters,
  setShowFilters,
}: {
  pendingFilters: FilterState;
  setPendingFilters: React.Dispatch<React.SetStateAction<FilterState>>; // ✅ state setter
  applyFilters: () => void;
  teslaModels: TeslaModel[];
  categories: Category[];
  allProducts: Product[];
  showFilters: boolean;
  setShowFilters: (b: boolean) => void;
}) {
  const mainCategories = useMemo(
    () => categories.filter((c) => c.level === 2 || c.parentId === null),
    [categories]
  );

  // Products for the currently selected MODEL (pending)
  const productsForCurrentModel = useMemo(() => {
    if (pendingFilters.selectedModel === "all") return allProducts;
    return allProducts.filter((p) =>
      splitModels(p.compatibleModels || "").includes(pendingFilters.selectedModel)
    );
  }, [allProducts, pendingFilters.selectedModel]);

  // Count helpers respecting current model
  const getParentCount = useMemo(() => {
    return (parentId: string) => {
      const childIds = categories.filter((c) => c.parentId === parentId).map((c) => c.id);
      return productsForCurrentModel.filter(
        (p) => p.categoryId === parentId || childIds.includes(p.categoryId)
      ).length;
    };
  }, [categories, productsForCurrentModel]);

  const getSubCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of productsForCurrentModel) {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    }
    return (subId: string) => map[subId] || 0;
  }, [productsForCurrentModel]);

  // Visible options (only >0 items)
  const visibleMainCategories = useMemo(
    () => mainCategories.filter((c) => getParentCount(c.id) > 0),
    [mainCategories, getParentCount]
  );

  const visibleSubcategories = useMemo(() => {
    if (pendingFilters.selectedCategory === "all") return [];
    const subs = categories.filter((c) => c.parentId === pendingFilters.selectedCategory);
    return subs.filter((s) => getSubCount(s.id) > 0);
  }, [categories, pendingFilters.selectedCategory, getSubCount]);

  // Keep selections valid when model/category changes
  useEffect(() => {
    // If chosen parent category is no longer valid, reset it (and subcat)
    if (
      pendingFilters.selectedCategory !== "all" &&
      getParentCount(pendingFilters.selectedCategory) === 0
    ) {
      setPendingFilters((prev) => ({
        ...prev,
        selectedCategory: "all",
        selectedSubcategory: "all",
      }));
      return;
    }
    // If chosen subcategory is no longer visible, reset it
    if (
      pendingFilters.selectedSubcategory !== "all" &&
      !visibleSubcategories.some((s) => s.id === pendingFilters.selectedSubcategory)
    ) {
      setPendingFilters((prev) => ({
        ...prev,
        selectedSubcategory: "all",
      }));
    }
  }, [
    pendingFilters.selectedCategory,
    pendingFilters.selectedSubcategory,
    getParentCount,
    visibleSubcategories,
    setPendingFilters,
  ]);

  const clearAll = () =>
    setPendingFilters({
      selectedModel: "all",
      selectedCategory: "all",
      selectedSubcategory: "all",
      searchQuery: "",
    });

  // UI-only subcategory list (filtered later to visible ones)
  const subcategories = useMemo(() => {
    if (pendingFilters.selectedCategory === "all") return [];
    return categories.filter((c) => c.parentId === pendingFilters.selectedCategory);
  }, [categories, pendingFilters.selectedCategory]);

  return (
    <section className="py-10 bg-gradient-to-r from-slate-50 to-white border-y border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Mobile toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 shadow-sm",
              showFilters
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
                : "bg-white text-slate-900 border-2 border-slate-200 hover:border-emerald-300 hover:shadow-md"
            )}
          >
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5" />
              <span className="font-semibold">Filters & Search</span>
            </div>
            <ChevronDown className={cn("h-5 w-5 transition-transform", showFilters && "rotate-180")} />
          </button>
        </div>

        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            showFilters ? "max-h-none opacity-100" : "max-h-0 lg:max-h-none opacity-0 lg:opacity-100"
          )}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/50">
            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Search Products</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, description, or model..."
                  value={pendingFilters.searchQuery}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, searchQuery: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/70"
                />
                {pendingFilters.searchQuery && (
                  <button
                    onClick={() => setPendingFilters({ ...pendingFilters, searchQuery: "" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Model */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Tesla Model</label>
                <div className="relative">
                  <select
                    value={pendingFilters.selectedModel}
                    onChange={(e) =>
                      setPendingFilters({
                        ...pendingFilters,
                        selectedModel: e.target.value,
                        selectedCategory: "all",
                        selectedSubcategory: "all",
                      })
                    }
                    className="w-full appearance-none px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/70"
                  >
                    {teslaModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.count})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Category — ONLY categories with >0 for current model */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Category</label>
                <div className="relative">
                  <select
                    value={pendingFilters.selectedCategory}
                    onChange={(e) =>
                      setPendingFilters({
                        ...pendingFilters,
                        selectedCategory: e.target.value,
                        selectedSubcategory: "all",
                      })
                    }
                    className="w-full appearance-none px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/70"
                  >
                    <option value="all">All Categories</option>
                    {visibleMainCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({getParentCount(c.id)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Subcategory — ONLY subcategories with >0 for current model/parent */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Subcategory</label>
                <div className="relative">
                  <select
                    value={pendingFilters.selectedSubcategory}
                    onChange={(e) => setPendingFilters({ ...pendingFilters, selectedSubcategory: e.target.value })}
                    disabled={pendingFilters.selectedCategory === "all"}
                    className="w-full appearance-none px-4 py-3 border-2 border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/70"
                  >
                    <option value="all">
                      {pendingFilters.selectedCategory === "all" ? "Select category first" : "All Subcategories"}
                    </option>
                    {visibleSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({getSubCount(s.id)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-4 border-t border-slate-200/50">
              <div className="text-sm text-slate-600">
                Set your filters, then click <span className="font-semibold">Search</span>.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   Product Card
========================================================= */
function ProductCard({
  product,
  onAddToCart,
  favorites,
  onToggleFavorite,
}: {
  product: Product;
  onAddToCart: (id: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  const router = useRouter();
  const [added, setAdded] = React.useState(false);
  const [isPressing, setIsPressing] = React.useState(false);

  const openProduct = () => router.push(`/products/${product.slug}`);

  // SAFETY: if a click originated inside any control, don't navigate.
  const handleCardClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-stop]")) return;
    openProduct();
  };

  const handleAdd = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (product.stockQuantity === 0) return;

    setIsPressing(true);
    onAddToCart(product.id);
    setAdded(true);

    setTimeout(() => setIsPressing(false), 150);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(product.id);
  };

  return (
    <div
      className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]"
      onClick={handleCardClick}
      title={product.name}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProduct();
        }
      }}
    >
      <div className="relative aspect-square bg-slate-100">
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText || product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-14 w-14 text-slate-400" />
          </div>
        )}

        {/* Favorite — ensure it sits above everything and never triggers card click */}
        <button
          type="button"
          data-stop
          onClick={handleFavorite}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-emerald-400 pointer-events-auto cursor-pointer"
          aria-pressed={favorites.has(product.id)}
          aria-label={favorites.has(product.id) ? "Remove from favorites" : "Add to favorites"}
          title="Toggle favorite"
        >
          <Heart
            className={
              favorites.has(product.id)
                ? "h-4 w-4 fill-red-500 text-red-500"
                : "h-4 w-4 text-slate-700"
            }
          />
        </button>

        {/* Hover overlay quick add — keep it below the heart */}
        <div className="absolute inset-0 z-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            type="button"
            data-stop
            onClick={handleAdd}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={product.stockQuantity === 0 || isPressing}
            className={cn(
              "px-4 py-2 rounded-lg font-medium shadow inline-flex items-center gap-2 focus:outline-none focus:ring-2 cursor-pointer disabled:cursor-not-allowed",
              product.stockQuantity === 0
                ? "bg-slate-300 text-slate-600"
                : added
                ? "bg-emerald-600 text-white focus:ring-emerald-400"
                : "bg-white text-slate-900 hover:scale-[1.02] focus:ring-emerald-400"
            )}
          >
            {product.stockQuantity === 0 ? (
              "Out of Stock"
            ) : added ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">
          {product.category?.name || "Tesla Parts"}
        </div>
        <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{toMoney(product.price)}</span>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <span className="text-xs text-slate-500 line-through">
                {toMoney(Number(product.compareAtPrice))}
              </span>
            )}
          </div>

          {/* Primary add button — same behavior as overlay */}
          <button
            type="button"
            data-stop
            onClick={handleAdd}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={product.stockQuantity === 0 || isPressing}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 focus:outline-none focus:ring-2 cursor-pointer disabled:cursor-not-allowed",
              product.stockQuantity === 0
                ? "bg-slate-200 text-slate-400"
                : added
                ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400"
                : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] focus:ring-slate-400"
            )}
            title={product.stockQuantity > 0 ? "Add to cart" : "Out of stock"}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {product.stockQuantity > 0 ? (added ? "Added" : "Add") : "Out"}
            </span>
          </button>
        </div>

        <div className="mt-1 text-xs text-slate-500">
          {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Main Component
========================================================= */
const ProductSearch: React.FC<ProductSearchProps> = ({
  allProducts,
  categories,
  teslaModels,
  onAddToCart,
  favorites,
  onToggleFavorite,
}) => {
  // UI
  const [showFilters, setShowFilters] = useState(false);

  // Pending vs Applied filters
  const [pendingFilters, setPendingFilters] = useState<FilterState>({
    selectedModel: "all",
    selectedCategory: "all",
    selectedSubcategory: "all",
    searchQuery: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    selectedModel: "all",
    selectedCategory: "all",
    selectedSubcategory: "all",
    searchQuery: "",
  });

  // Persist pending filters
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(pendingFilters));
      } catch {}
    }
  }, [pendingFilters]);

  // Load filters on first mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as FilterState;
          setPendingFilters(parsed);
          setAppliedFilters(parsed);
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // OPTIONAL: Debug DB values for Model Y (toggle to true if needed)
  useEffect(() => {
    const DEBUG = false;
    if (!DEBUG) return;
    try {
      const sample = allProducts
        .filter((p) => p.compatibleModels && p.compatibleModels.toLowerCase().includes("y"))
        .slice(0, 3)
        .map((p) => ({ id: p.id, name: p.name, compatibleModels: p.compatibleModels }));
      // eslint-disable-next-line no-console
      console.log("Sample Model Y products:", sample);
    } catch {}
  }, [allProducts]);

  /* ------------ Filtering uses APPLIED filters ------------ */
  const filteredProducts = useMemo(() => {
    let list = allProducts;

    if (appliedFilters.selectedModel !== "all") {
      list = list.filter((p) =>
        splitModels(p.compatibleModels || "").includes(appliedFilters.selectedModel)
      );
    }

    if (appliedFilters.selectedCategory !== "all") {
      const subIds = categories
        .filter((c) => c.parentId === appliedFilters.selectedCategory)
        .map((c) => c.id);
      list = list.filter(
        (p) => p.categoryId === appliedFilters.selectedCategory || subIds.includes(p.categoryId)
      );
    }

    if (appliedFilters.selectedSubcategory !== "all") {
      list = list.filter((p) => p.categoryId === appliedFilters.selectedSubcategory);
    }

    const q = appliedFilters.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const inName = p.name?.toLowerCase().includes(q);
        const inSku = p.sku?.toLowerCase().includes(q);
        const inDesc = p.description?.toLowerCase().includes(q) ?? false;
        const models = splitModels(p.compatibleModels || "").map((m) => m.toLowerCase());
        const inModels = models.some((m) => m.replace(/_/g, " ").includes(q));
        return inName || inSku || inDesc || inModels;
      });
    }

    return list;
  }, [allProducts, categories, appliedFilters]);

  const hasActiveApplied =
    appliedFilters.selectedModel !== "all" ||
    appliedFilters.selectedCategory !== "all" ||
    appliedFilters.selectedSubcategory !== "all" ||
    appliedFilters.searchQuery.trim() !== "";

  // Pagination
  const PAGE_SIZE_MOBILE = 8;
  const PAGE_SIZE_DESKTOP = 15;
  const desktopPager = usePagination(filteredProducts, PAGE_SIZE_DESKTOP);
  const mobilePager = usePagination(filteredProducts, PAGE_SIZE_MOBILE);

  // Reset pagers when APPLIED filters change
  useEffect(() => {
    desktopPager.reset();
    mobilePager.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const applyFilters = () => setAppliedFilters(pendingFilters);

  return (
    <>
      {/* Filters section */}
      <EnhancedFilterSection
        pendingFilters={pendingFilters}
        setPendingFilters={setPendingFilters}
        applyFilters={applyFilters}
        teslaModels={teslaModels}
        categories={categories}
        allProducts={allProducts}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* If no filters applied, prompt */}
      {!hasActiveApplied && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-slate-600">
            Use the filters above to search by model, category, or keyword.
          </div>
        </section>
      )}

      {/* Results */}
      {hasActiveApplied && (
        <>
          {/* MOBILE */}
          <div className="lg:hidden">
            <section className="py-8 bg-white">
              <div className="px-4">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Filtered Products ({filteredProducts.length} found)
                </h2>

                {filteredProducts.length ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {mobilePager.pageItems.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={onAddToCart}
                          favorites={favorites}
                          onToggleFavorite={onToggleFavorite}
                        />
                      ))}
                    </div>

                    {mobilePager.totalPages > 1 && (
                      <Pagination
                        page={mobilePager.page}
                        totalPages={mobilePager.totalPages}
                        onPrev={mobilePager.prev}
                        onNext={mobilePager.next}
                        onGo={mobilePager.go}
                        className="mt-6"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-slate-600">No products match those filters.</div>
                )}
              </div>
            </section>
          </div>

          {/* DESKTOP */}
          <div className="hidden lg:block">
            <section className="py-10 bg-white">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Filtered Products ({filteredProducts.length} found)
                  </h2>
                </div>

                {filteredProducts.length ? (
                  <>
                    <div className="grid grid-cols-3 xl:grid-cols-4 gap-6">
                      {desktopPager.pageItems.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={onAddToCart}
                          favorites={favorites}
                          onToggleFavorite={onToggleFavorite}
                        />
                      ))}
                    </div>

                    {desktopPager.totalPages > 1 && (
                      <Pagination
                        page={desktopPager.page}
                        totalPages={desktopPager.totalPages}
                        onPrev={desktopPager.prev}
                        onNext={desktopPager.next}
                        onGo={desktopPager.go}
                        className="mt-8"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-slate-600">No products match those filters.</div>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
};

export default ProductSearch;
