// app/products/[slug]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  RotateCcw,
  Package,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ZoomIn,
  X,
  Plus,
  Minus,
  Clock,
  Wrench,
  MapPin,
  Car,
} from "lucide-react";

// -------- Types --------
interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  shortDescription?: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  compatibleModels?: string;
  categoryId: string;
  category?: ProductCategory;
  images?: ProductImage[];
  metaTitle?: string;
  metaDescription?: string;
  oeNumber?: string;
  unitPacking?: string;
  fullPacking?: string;
  createdAt: string;
  updatedAt: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: ProductImage[];
  stockQuantity: number;
}

// -------- Page --------
const ProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  // Data
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "shipping" | "support">("description");
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch product + related
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Product not found" : "Failed to load product");
          setProduct(null);
          return;
        }

        const productData: Product = await res.json();
        setProduct(productData);
        setSelectedImageIndex(0);

        if (productData?.categoryId) {
          const relRes = await fetch(
            `/api/products?category=${productData.categoryId}&limit=4&exclude=${productData.id}`
          );
          if (relRes.ok) {
            const relData = await relRes.json();
            const items: RelatedProduct[] = (relData.products || relData || [])
              .filter((p: RelatedProduct) => p.id !== productData.id)
              .slice(0, 4);
            setRelatedProducts(items);
          } else {
            setRelatedProducts([]);
          }
        } else {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Handlers
// Replace your handleAddToCart function in the product page with this:

const handleAddToCart = async () => {
  if (!product || quantity < 1 || quantity > product.stockQuantity) return;

  setCartLoading(true);
  
  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        productId: product.id,
        quantity 
      }),
    });

    const responseData = await res.json();

    if (res.ok) {
      // Success response
      alert(`✅ ${responseData.message || `Added ${quantity} × ${product.name} to cart!`}`);
      
      if (responseData.isGuest) {
        // Handle guest cart in localStorage
        handleGuestCart(responseData.product, quantity);
      } else {
        // Handle logged-in user cart
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: responseData.cartCount } 
        }));
      }
      
      // Reset quantity to 1 after adding
      setQuantity(1);
      
    } else {
      // Handle errors
      if (res.status === 404) {
        alert('❌ Product not found or unavailable');
      } else if (res.status === 400) {
        alert(`❌ ${responseData.error || 'Invalid request'}`);
      } else {
        alert(`❌ ${responseData.error || 'Failed to add to cart'}`);
      }
    }
  } catch (error) {
    console.error('Add to cart network error:', error);
    alert('❌ Network error. Please check your connection and try again.');
  } finally {
    setCartLoading(false);
  }
};

// Add this helper function to handle guest cart
const handleGuestCart = (product: Product, quantity: number) => {
  try {
    // Get existing guest cart from localStorage
    const existingCart = localStorage.getItem('guestCart');
    interface GuestCartItem {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      addedAt: string;
    }
    const cartItems: GuestCartItem[] = existingCart ? JSON.parse(existingCart) : [];

    // Check if item already exists
    const existingItemIndex = cartItems.findIndex((item: GuestCartItem) => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Update quantity
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cartItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        addedAt: new Date().toISOString()
      });
    }

    // Save back to localStorage
    localStorage.setItem('guestCart', JSON.stringify(cartItems));

    // Update cart count in UI
    const totalItems = cartItems.reduce((sum: number, item: GuestCartItem) => sum + item.quantity, 0);
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { count: totalItems, isGuest: true } 
    }));

  } catch (error) {
    console.error('Error saving to guest cart:', error);
  }
};

  const handleQuantityChange = (nextQty: number) => {
    const max = product?.stockQuantity ?? 0;
    if (nextQty >= 1 && nextQty <= max) setQuantity(nextQty);
  };

  const handleShare = async () => {
    try {
      if (navigator?.share) {
        await navigator.share({
          title: product?.name,
          text: product?.shortDescription || product?.description || "",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  // Derived
  const images = (product.images || []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const currentImage = images[selectedImageIndex];
  const inStock = product.stockQuantity > 0;
  const lowStock = inStock && product.stockQuantity <= (product.lowStockThreshold ?? 5);
  const compatibleModels =
    product.compatibleModels
      ?.split(",")
      .map((m) => m.trim())
      .filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => router.push("/")}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Home
            </button>
            <span className="text-gray-400">/</span>
            {product.category && (
              <>
                <span className="text-gray-500">{product.category.name}</span>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
              {currentImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage.url}
                    alt={currentImage.altText || product.name}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setShowImageModal(true)}
                  />
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Open image"
                  >
                    <ZoomIn className="h-5 w-5 text-gray-700" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}

              {/* Prev/Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbs */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image.id || `${image.url}-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex
                        ? "border-gray-900"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    aria-label={`Select image ${index + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.altText || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center flex-wrap gap-3 mb-4">
                <span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded">
                  SKU: {product.sku}
                </span>
                {product.oeNumber && (
                  <span className="text-sm text-gray-500 font-mono bg-blue-50 px-3 py-1 rounded">
                    OE: {product.oeNumber}
                  </span>
                )}
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${Number(product.price).toFixed(2)}
                </span>
                {typeof product.compareAtPrice === "number" && (
                  <span className="text-xl text-gray-500 line-through">
                    ${Number(product.compareAtPrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Compatibility */}
            {compatibleModels.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Compatible with:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {compatibleModels.map((model) => (
                    <span
                      key={model}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      Tesla {model.replace("MODEL_", "Model ").replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center space-x-2">
              {inStock ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    In Stock ({product.stockQuantity} available)
                  </span>
                  {lowStock && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                      Low Stock
                    </span>
                  )}
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-600 text-lg leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {inStock && (
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stockQuantity}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || cartLoading}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                    inStock && !cartLoading
                      ? "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{cartLoading ? "Adding..." : inStock ? "Add to Cart" : "Out of Stock"}</span>
                </button>

                <button
                  onClick={() => setIsWishlisted((w) => !w)}
                  aria-label="Toggle wishlist"
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    isWishlisted
                      ? "border-red-300 bg-red-50 text-red-600"
                      : "border-gray-300 hover:border-gray-400 text-gray-600"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Genuine Parts</div>
                <div className="text-xs text-gray-500">OEM Quality</div>
              </div>
              <div className="text-center">
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Fast Shipping</div>
                <div className="text-xs text-gray-500">2–3 Days</div>
              </div>
              <div className="text-center">
                <RotateCcw className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Easy Returns</div>
                <div className="text-xs text-gray-500">30 Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "description", label: "Description" },
                { id: "specifications", label: "Specifications" },
                { id: "shipping", label: "Shipping & Returns" },
                { id: "support", label: "Support" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <div className="text-gray-600 text-lg leading-relaxed">
                  {product.description || "No detailed description available."}
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">SKU:</dt>
                      <dd className="font-mono text-gray-900">{product.sku}</dd>
                    </div>
                    {product.oeNumber && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">OE Number:</dt>
                        <dd className="font-mono text-gray-900">{product.oeNumber}</dd>
                      </div>
                    )}
                    {typeof product.weight === "number" && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Weight:</dt>
                        <dd className="text-gray-900">{product.weight} kg</dd>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Dimensions:</dt>
                        <dd className="text-gray-900">{product.dimensions}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Packaging</h3>
                  <dl className="space-y-3">
                    {product.unitPacking && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Unit Packing:</dt>
                        <dd className="text-gray-900">{product.unitPacking}</dd>
                      </div>
                    )}
                    {product.fullPacking && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Full Packing:</dt>
                        <dd className="text-gray-900">{product.fullPacking}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Information</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Standard shipping: 2–3 business days</li>
                    <li>• Express shipping: Next business day</li>
                    <li>• Free shipping on orders over $100</li>
                    <li>• Professional installation available</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Returns & Exchanges</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 30-day return policy</li>
                    <li>• Items must be in original condition</li>
                    <li>• Free return shipping for defective items</li>
                    <li>• Restocking fee may apply for custom orders</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "support" && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Business Hours</div>
                        <div className="text-gray-600">Mon–Fri 8AM–6PM PST</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Wrench className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Professional Installation</div>
                        <div className="text-gray-600 text-sm">
                          Expert technicians available for complex installations
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Service Locations</div>
                        <div className="text-gray-600 text-sm">Kamloops, BC and surrounding areas</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                  <div className="space-y-2 text-gray-600">
                    <div>Phone: 1-800-TESLA-PARTS</div>
                    <div>Email: support@theevstore.ca</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  className="group bg-white border border-gray-2 00 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/products/${rp.slug}`)}
                >
                  <div className="aspect-square bg-gray-100">
                    {rp.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rp.images[0].url}
                        alt={rp.images[0].altText || rp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{rp.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${Number(rp.price).toFixed(2)}
                      </span>
                      {rp.stockQuantity > 0 ? (
                        <span className="text-sm text-green-600">In Stock</span>
                      ) : (
                        <span className="text-sm text-red-600">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && currentImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close image"
            >
              <X className="h-8 w-8" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage.url}
              alt={currentImage.altText || product.name}
              className="max-w-full max-h-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
