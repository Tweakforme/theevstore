"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package } from 'lucide-react';

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

const WishlistPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/wishlist');
      return;
    }
    
    if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status, router]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      setWishlistItems(data.items || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
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
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
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
        // Optionally remove from wishlist after adding to cart
        // or show success message
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setUpdating(null);
    }
  };

  const moveAllToCart = async () => {
    const availableItems = wishlistItems.filter(item => item.product.stockQuantity > 0);
    
    try {
      const promises = availableItems.map(item =>
        fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.product.id, quantity: 1 })
        })
      );

      await Promise.all(promises);
      
      // Optionally clear wishlist after moving to cart
      router.push('/cart');
    } catch (error) {
      console.error('Error moving items to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {wishlistItems.length > 0 && (
              <button
                onClick={moveAllToCart}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Move All to Cart
              </button>
            )}
            
            <Link 
              href="/"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          // Empty Wishlist
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8">
              Save Tesla parts you love to buy them later
            </p>
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Package className="h-5 w-5" />
              <span>Browse Tesla Parts</span>
            </Link>
          </div>
        ) : (
          // Wishlist Items
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {item.product.images && item.product.images[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.images[0].altText || item.product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="h-16 w-16" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    disabled={updating === item.id}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
                    title="Remove from wishlist"
                  >
                    {updating === item.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    ) : (
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                    )}
                  </button>

                  {/* Stock Badge */}
                  {item.product.stockQuantity <= 5 && item.product.stockQuantity > 0 && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        Only {item.product.stockQuantity} left
                      </span>
                    </div>
                  )}
                  
                  {item.product.stockQuantity === 0 && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Category */}
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    {item.product.category.name}
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link 
                      href={`/product/${item.product.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                  </h3>

                  {/* Compatible Models */}
                  {item.product.compatibleModels && (
                    <div className="text-xs text-gray-500 mb-2">
                      Compatible: {item.product.compatibleModels}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ${item.product.price}
                    </span>
                    {item.product.compareAtPrice && item.product.compareAtPrice > item.product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${item.product.compareAtPrice}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="text-sm text-gray-500 mb-4">
                    {item.product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => addToCart(item.product.id)}
                      disabled={item.product.stockQuantity === 0 || updating === item.product.id}
                      className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {updating === item.product.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>
                            {item.product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </span>
                        </>
                      )}
                    </button>
                    
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center block"
                    >
                      View Details
                    </Link>
                  </div>

                  {/* Added Date */}
                  <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recently Viewed or Suggestions */}
        {wishlistItems.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Suggestions based on your wishlist coming soon</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;