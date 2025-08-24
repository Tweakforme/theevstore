"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Heart, Truck, Shield, RotateCcw } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
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
}

// Interface for guest cart items
interface GuestCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  addedAt: string;
}

const CartPage = () => {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [session]);

  const fetchCart = async () => {
    try {
      if (session) {
        // For logged-in users, fetch from API
        const response = await fetch('/api/cart');
        const data = await response.json();
        
        // Convert prices to numbers to handle Decimal types from Prisma
        const normalizedItems = (data.items || []).map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            price: Number(item.product.price),
            compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : undefined
          }
        }));
        
        setCartItems(normalizedItems);
      } else {
        // For guest users, load from localStorage and fetch product details
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const guestItems: GuestCartItem[] = JSON.parse(guestCart);
          
          // Fetch product details for each item
          const cartItemsWithDetails = await Promise.all(
            guestItems.map(async (item) => {
              try {
                const productResponse = await fetch(`/api/products/${item.productId}`);
                if (productResponse.ok) {
                  const product = await productResponse.json();
                  return {
                    id: `guest-${item.productId}`,
                    productId: item.productId,
                    quantity: item.quantity,
                    product: {
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: Number(product.price), // Convert to number
                      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
                      images: product.images,
                      stockQuantity: product.stockQuantity,
                      category: product.category,
                      compatibleModels: product.compatibleModels,
                    }
                  };
                }
                return null;
              } catch (error) {
                console.error('Error fetching product details:', error);
                return null;
              }
            })
          );
          
          // Filter out null values and set cart items
          setCartItems(cartItemsWithDetails.filter(item => item !== null) as CartItem[]);
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      if (session) {
        // For logged-in users, update via API
        const response = await fetch('/api/cart/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, quantity: newQuantity })
        });

        if (response.ok) {
          setCartItems(items =>
            items.map(item =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
          );
        }
      } else {
        // For guest users, update localStorage
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const guestItems: GuestCartItem[] = JSON.parse(guestCart);
          const updatedItems = guestItems.map(item =>
            item.productId === itemId.replace('guest-', '') 
              ? { ...item, quantity: newQuantity }
              : item
          );
          localStorage.setItem('guestCart', JSON.stringify(updatedItems));
          
          // Update UI
          setCartItems(items =>
            items.map(item =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
          );
          
          // Update cart count
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { count: totalItems, isGuest: true } 
          }));
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      if (session) {
        // For logged-in users, remove via API
        const response = await fetch('/api/cart/remove', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId })
        });

        if (response.ok) {
          setCartItems(items => items.filter(item => item.id !== itemId));
        }
      } else {
        // For guest users, remove from localStorage
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const guestItems: GuestCartItem[] = JSON.parse(guestCart);
          const updatedItems = guestItems.filter(
            item => item.productId !== itemId.replace('guest-', '')
          );
          localStorage.setItem('guestCart', JSON.stringify(updatedItems));
          
          // Update UI
          setCartItems(items => items.filter(item => item.id !== itemId));
          
          // Update cart count
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { count: totalItems, isGuest: true } 
          }));
        }
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(null);
    }
  };

  const applyPromoCode = async () => {
    try {
      const response = await fetch('/api/cart/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode })
      });

      const data = await response.json();
      if (data.success) {
        setPromoApplied(promoCode);
        setDiscount(data.discount);
      } else {
        alert(data.error || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
    }
  };

  const clearCart = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to remove all ${cartItems.length} items from your cart? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setClearing(true);
    try {
      if (session) {
        // For logged-in users, remove each item using existing API
        console.log('Removing items:', cartItems.map(item => item.id));
        
        const removePromises = cartItems.map(async (item) => {
          try {
            const response = await fetch('/api/cart/remove', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId: item.id })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error(`Failed to remove item ${item.id}:`, errorData);
              return { success: false, itemId: item.id, error: errorData };
            }
            
            return { success: true, itemId: item.id };
          } catch (error) {
            console.error(`Error removing item ${item.id}:`, error);
            return { success: false, itemId: item.id, error: error.message };
          }
        });

        // Wait for all items to be removed
        const results = await Promise.all(removePromises);
        
        // Check results
        const failedRemovals = results.filter(result => !result.success);
        
        if (failedRemovals.length === 0) {
          // All successful
          setCartItems([]);
          setPromoApplied(null);
          setDiscount(0);
          setPromoCode('');
        } else {
          // Some failed - show specific errors
          console.error('Failed removals:', failedRemovals);
          
          // Remove only the successful ones from UI
          const successfulIds = results
            .filter(result => result.success)
            .map(result => result.itemId);
          
          setCartItems(items => items.filter(item => !successfulIds.includes(item.id)));
          
          // Show error message
          alert(
            `Failed to remove ${failedRemovals.length} out of ${cartItems.length} items. ` +
            `Successfully removed ${results.length - failedRemovals.length} items. ` +
            `Please try again for the remaining items.`
          );
        }
      } else {
        // For guest users, clear localStorage
        localStorage.removeItem('guestCart');
        setCartItems([]);
        
        // Update cart count
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: 0, isGuest: true } 
        }));
        
        // Also clear any applied promo codes
        setPromoApplied(null);
        setDiscount(0);
        setPromoCode('');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  // Calculate totals with proper number conversion
  const subtotal = cartItems.reduce((sum, item) => 
    sum + (Number(item.product.price) * item.quantity), 0
  );
  
  const shipping = subtotal >= 200 ? 0 : 15.99;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount + shipping;

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
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          <Link 
            href="/"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any Tesla parts to your cart yet. 
              Start shopping to find the perfect parts for your vehicle.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  {/* Cart Header with Clear Button */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                    
                    {cartItems.length > 0 && (
                      <button
                        onClick={clearCart}
                        disabled={clearing}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{clearing ? 'Clearing...' : 'Empty Cart'}</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                        
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {item.product.images?.length ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.images[0].altText || item.product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-8 h-8 bg-gray-300 rounded"></div>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.product.category.name}
                          </p>
                          {item.product.compatibleModels && (
                            <p className="text-xs text-gray-400 mt-1">
                              Compatible: {item.product.compatibleModels}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating === item.id}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className="w-12 text-center text-sm font-medium">
                            {updating === item.id ? '...' : item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockQuantity || updating === item.id}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price - Fixed with Number conversion */}
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${(Number(item.product.price) * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${Number(item.product.price).toFixed(2)} each
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updating === item.id}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!!promoApplied}
                    />
                    <button
                      onClick={applyPromoCode}
                      disabled={!promoCode.trim() || !!promoApplied}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-sm text-green-600 mt-2">
                      Promo code &quot;{promoApplied}&quot; applied! ({discount}% off)
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount ({discount}%)</span>
                      <span className="font-medium text-green-600">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      Free shipping on orders over $200
                    </p>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors block"
                >
                  Proceed to Checkout
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $200</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <RotateCcw className="h-4 w-4" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;