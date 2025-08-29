"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  Package, 
  Star,
  Eye,
  Share2,
  Check,
  AlertCircle,
  ShoppingBag,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Zap
} from 'lucide-react';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images?: { url: string; altText: string }[];
    stockQuantity: number;
    category: { name: string };
    compatibleModels?: string;
  };
  createdAt: string;
}

const ModernWishlistPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name'>('newest');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/wishlist');
      return;
    }
    
    if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status, router]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      setWishlistItems(data.items || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showNotification('error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const response = await fetch('/api/wishlist/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (response.ok) {
        setWishlistItems(items => items.filter(item => item.id !== itemId));
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        showNotification('success', 'Item removed from wishlist');
      } else {
        showNotification('error', 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showNotification('error', 'Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const addToCart = async (productId: string) => {
    setUpdating(productId);
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (response.ok) {
        showNotification('success', 'Item added to cart!');
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('error', 'Failed to add to cart');
    } finally {
      setUpdating(null);
    }
  };

  const removeSelectedItems = async () => {
    const promises = Array.from(selectedItems).map(itemId => 
      fetch('/api/wishlist/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      })
    );

    try {
      await Promise.all(promises);
      setWishlistItems(items => items.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      showNotification('success', `Removed ${selectedItems.size} items from wishlist`);
    } catch (error) {
      showNotification('error', 'Failed to remove selected items');
    }
  };

  const addSelectedToCart = async () => {
    const selectedProducts = wishlistItems.filter(item => selectedItems.has(item.id));
    const availableItems = selectedProducts.filter(item => item.product.stockQuantity > 0);
    
    if (availableItems.length === 0) {
      showNotification('error', 'No selected items are in stock');
      return;
    }

    try {
      const promises = availableItems.map(item =>
        fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.product.id, quantity: 1 })
        })
      );

      await Promise.all(promises);
      showNotification('success', `Added ${availableItems.length} items to cart!`);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error adding items to cart:', error);
      showNotification('error', 'Failed to add items to cart');
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === wishlistItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlistItems.map(item => item.id)));
    }
  };

  const getSortedItems = () => {
    const sorted = [...wishlistItems];
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'price-low':
        return sorted.sort((a, b) => a.product.price - b.product.price);
      case 'price-high':
        return sorted.sort((a, b) => b.product.price - a.product.price);
      case 'name':
        return sorted.sort((a, b) => a.product.name.localeCompare(b.product.name));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  const sortedItems = getSortedItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <Heart className="inline h-10 w-10 text-red-500 mr-3" />
              My Wishlist
            </h1>
            <p className="text-gray-600 text-lg">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          <Link 
            href="/"
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Continue Shopping</span>
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          // Empty Wishlist - Enhanced Design
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/30"></div>
            <div className="relative z-10">
              <div className="relative mb-8">
                <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
             
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h3>
              <p className="text-gray-600 text-lg mb-12 max-w-md mx-auto leading-relaxed">
                Start building your dream Tesla setup by saving parts you love for later
              </p>
              
              <div className="flex justify-center space-x-4">
                <Link 
                  href="/"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Package className="h-6 w-6" />
                  <span className="font-semibold">Browse  Parts</span>
                </Link>
               
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Select All */}
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === wishlistItems.length && wishlistItems.length > 0}
                      onChange={toggleSelectAll}
                      className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">Select All ({wishlistItems.length})</span>
                  </label>

                  {/* Bulk Actions */}
                  {selectedItems.size > 0 && (
                    <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                      <button
                        onClick={addSelectedToCart}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart ({selectedItems.size})</span>
                      </button>
                      
                      <button
                        onClick={removeSelectedItems}
                        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove ({selectedItems.size})</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Wishlist Items */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
            }>
              {sortedItems.map((item) => (
                <div key={item.id} className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group ${
                  selectedItems.has(item.id) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                } ${viewMode === 'list' ? 'flex' : ''}`}>
                  
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedItems);
                            if (e.target.checked) {
                              newSet.add(item.id);
                            } else {
                              newSet.delete(item.id);
                            }
                            setSelectedItems(newSet);
                          }}
                          className="absolute top-4 left-4 z-10 h-5 w-5 text-blue-600 border-2 border-white rounded shadow-lg focus:ring-blue-500"
                        />

                        {item.product.images && item.product.images[0] ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.images[0].altText || item.product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="h-16 w-16" />
                          </div>
                        )}
                        
                        {/* Quick Actions */}
                        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            disabled={updating === item.id}
                            className="p-3 bg-white/90 backdrop-blur rounded-full hover:bg-white shadow-lg transition-colors"
                            title="Remove from wishlist"
                          >
                            {updating === item.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                            ) : (
                              <Heart className="h-5 w-5 text-red-500 fill-current" />
                            )}
                          </button>
                          
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="p-3 bg-white/90 backdrop-blur rounded-full hover:bg-white shadow-lg transition-colors"
                            title="Quick view"
                          >
                            <Eye className="h-5 w-5 text-gray-600" />
                          </Link>
                        </div>

                        {/* Stock Badge */}
                        <div className="absolute bottom-4 left-4">
                          {item.product.stockQuantity <= 5 && item.product.stockQuantity > 0 ? (
                            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                              Only {item.product.stockQuantity} left!
                            </span>
                          ) : item.product.stockQuantity === 0 ? (
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        {/* Category */}
                        <div className="text-sm text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                          {item.product.category.name}
                        </div>

                        {/* Product Name */}
                        <h3 className="font-bold text-gray-900 mb-3 text-lg line-clamp-2 leading-tight">
                          <Link 
                            href={`/product/${item.product.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </h3>

                        {/* Compatible Models */}
                        {item.product.compatibleModels && (
                          <div className="text-sm text-gray-500 mb-3 flex items-center">
                            <Zap className="h-4 w-4 mr-1" />
                            Compatible: {item.product.compatibleModels.replace('_', ' ')}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-2xl font-bold text-gray-900">
                            ${item.product.price}
                          </span>
                          {item.product.compareAtPrice && item.product.compareAtPrice > item.product.price && (
                            <>
                              <span className="text-lg text-gray-500 line-through">
                                ${item.product.compareAtPrice}
                              </span>
                              <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">
                                Save ${(item.product.compareAtPrice - item.product.price).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                          <button
                            onClick={() => addToCart(item.product.id)}
                            disabled={item.product.stockQuantity === 0 || updating === item.product.id}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                          >
                            {updating === item.product.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <ShoppingCart className="h-5 w-5" />
                                <span>
                                  {item.product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </span>
                              </>
                            )}
                          </button>
                          
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors text-center block font-medium"
                          >
                            View Details
                          </Link>
                        </div>

                        {/* Added Date */}
                        <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100 text-center">
                          Added {new Date(item.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                    <>
                      <div className="flex-shrink-0 w-48 relative">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedItems);
                            if (e.target.checked) {
                              newSet.add(item.id);
                            } else {
                              newSet.delete(item.id);
                            }
                            setSelectedItems(newSet);
                          }}
                          className="absolute top-4 left-4 z-10 h-5 w-5 text-blue-600 border-2 border-white rounded shadow-lg focus:ring-blue-500"
                        />

                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {item.product.images && item.product.images[0] ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.images[0].altText || item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-12 w-12" />
                            </div>
                          )}
                          
                          {/* Stock Badge */}
                          <div className="absolute bottom-2 left-2">
                            {item.product.stockQuantity <= 5 && item.product.stockQuantity > 0 ? (
                              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                                {item.product.stockQuantity} left
                              </span>
                            ) : item.product.stockQuantity === 0 ? (
                              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                Out of Stock
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                In Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex justify-between">
                        <div className="flex-1">
                          {/* Category */}
                          <div className="text-sm text-blue-600 font-semibold mb-1 uppercase tracking-wide">
                            {item.product.category.name}
                          </div>

                          {/* Product Name */}
                          <h3 className="font-bold text-gray-900 mb-2 text-xl">
                            <Link 
                              href={`/product/${item.product.slug}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {item.product.name}
                            </Link>
                          </h3>

                          {/* Compatible Models */}
                          {item.product.compatibleModels && (
                            <div className="text-sm text-gray-500 mb-3 flex items-center">
                              <Zap className="h-4 w-4 mr-1" />
                              Compatible: {item.product.compatibleModels.replace('_', ' ')}
                            </div>
                          )}

                          {/* Added Date */}
                          <div className="text-sm text-gray-400">
                            Added {new Date(item.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between ml-6">
                          {/* Price */}
                          <div className="text-right mb-4">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              ${item.product.price}
                            </div>
                            {item.product.compareAtPrice && item.product.compareAtPrice > item.product.price && (
                              <div className="flex items-center space-x-2">
                                <span className="text-lg text-gray-500 line-through">
                                  ${item.product.compareAtPrice}
                                </span>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">
                                  Save ${(item.product.compareAtPrice - item.product.price).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              disabled={updating === item.id}
                              className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                              title="Remove from wishlist"
                            >
                              {updating === item.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                              ) : (
                                <Heart className="h-5 w-5 fill-current text-red-500" />
                              )}
                            </button>

                            <Link
                              href={`/product/${item.product.slug}`}
                              className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                              title="View details"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>

                            <button
                              onClick={() => addToCart(item.product.id)}
                              disabled={item.product.stockQuantity === 0 || updating === item.product.id}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl"
                            >
                              {updating === item.product.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <ShoppingCart className="h-5 w-5" />
                                  <span>
                                    {item.product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Recommendations Section */}
            <div className="mt-16 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">You might also like</h2>
                <p className="text-gray-600 mb-8 text-lg">Discover more Tesla parts based on your interests</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                    <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">Popular Parts</h3>
                    <p className="text-gray-600 text-sm">Trending items among Tesla owners</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                    <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">Highly Rated</h3>
                    <p className="text-gray-600 text-sm">Top-rated products by customers</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                    <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">New Arrivals</h3>
                    <p className="text-gray-600 text-sm">Latest additions to our catalog</p>
                  </div>
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-900 to-black text-white px-8 py-4 rounded-full hover:from-black hover:to-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <ShoppingBag className="h-6 w-6" />
                  <span>Explore More Products</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModernWishlistPage;