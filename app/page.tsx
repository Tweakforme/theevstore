"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "./lib/fetcher";
import Hero from "./components/Hero";
import ProductSearch from "./components/ProductSearch";
import FeaturedProducts from "./components/FeaturedProducts";

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

/* =========================================================
   Utils
========================================================= */
// Robust normalization for model tags
const normalizeModelTag = (tag: string) => {
  if (!tag) return "";
  const cleaned = tag.trim().toUpperCase();

  if ((cleaned.includes("MODEL") && cleaned.includes("Y")) || cleaned === "MY" || cleaned === "Y") {
    return "MODEL_Y";
  }
  if ((cleaned.includes("MODEL") && cleaned.includes("3")) || cleaned === "M3" || cleaned === "3") {
    return "MODEL_3";
  }
  if ((cleaned.includes("MODEL") && cleaned.includes("S")) || cleaned === "MS" || cleaned === "S") {
    return "MODEL_S";
  }
  if ((cleaned.includes("MODEL") && cleaned.includes("X")) || cleaned === "MX" || cleaned === "X") {
    return "MODEL_X";
  }
  return cleaned.replace(/[^A-Z0-9]+/g, "_");
};

// Better model parsing
const splitModels = (s: string) => {
  if (!s) return [];
  return s
    .split(/[|,;/\s]+/)
    .map((m) => normalizeModelTag(m))
    .filter(Boolean)
    .filter((m) => m !== "_");
};

/* =========================================================
   Main Homepage Component (SWR-powered)
========================================================= */
const TeslaPartsHomepage = () => {
  // SWR keeps data cached in memory across navigation
  const {
    data: prodData,
    isLoading: productsLoading,
    error: productsError,
  } = useSWR("/api/products", fetcher, { revalidateOnFocus: false });

  const {
    data: catData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useSWR("/api/categories", fetcher, { revalidateOnFocus: false });

  // Derived collections
  const allProducts: Product[] = useMemo(
    () => (prodData?.products ? prodData.products : Array.isArray(prodData) ? prodData : []) as Product[],
    [prodData]
  );

  const categories: Category[] = useMemo(
    () => (Array.isArray(catData) ? catData : catData?.items || []) as Category[],
    [catData]
  );

  const loading = productsLoading || categoriesLoading;

  // Derived featured + model counts
  const featuredProducts = useMemo(
    () => allProducts.filter((p) => p.isFeatured).slice(0, 12),
    [allProducts]
  );

  const teslaModels: TeslaModel[] = useMemo(() => {
    const modelCounts = allProducts.reduce<Record<string, number>>((acc, p) => {
      for (const k of splitModels(p.compatibleModels || "")) {
        acc[k] = (acc[k] || 0) + 1;
      }
      return acc;
    }, {});
    return [
      { id: "all", name: "All Models", count: allProducts.length },
      { id: "MODEL_3", name: "Model 3", count: modelCounts["MODEL_3"] || 0 },
      { id: "MODEL_Y", name: "Model Y", count: modelCounts["MODEL_Y"] || 0 },
    ];
  }, [allProducts]);

  // UI state
  const [cartCount, setCartCount] = useState(0); // kept for header badge if you use it
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  /* ------------ Cart / favorites ------------ */
  const addToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        setCartCount((c) => (typeof data.cartCount === "number" ? data.cartCount : c + 1));
      } else {
        alert(data.error || "Failed to add to cart");
      }
    } catch {
      alert("Network error");
    }
  };

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const model3Count = teslaModels.find((m) => m.id === "MODEL_3")?.count || 0;
  const modelYCount = teslaModels.find((m) => m.id === "MODEL_Y")?.count || 0;

  if (productsError || categoriesError) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-red-600 font-medium">
          Failed to load data. Please refresh the page.
        </p>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <Hero model3Count={model3Count} modelYCount={modelYCount} />

      {/* Product Search Section */}
      <ProductSearch
        allProducts={allProducts}
        categories={categories}
        teslaModels={teslaModels}
        onAddToCart={addToCart}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      {/* Featured Products Section */}
      <FeaturedProducts
        featuredProducts={featuredProducts}
        categories={categories}
        teslaModels={teslaModels}
        loading={loading}
        onAddToCart={addToCart}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    </main>
  );
};

export default TeslaPartsHomepage;
