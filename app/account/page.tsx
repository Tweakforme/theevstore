"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Star
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    id: string;
    quantity: number;
    product: {
      name: string;
      price: number;
      images?: { url: string; altText: string }[];
    };
  }[];
}

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
  };
}

const AccountPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchAccountData();
    }
  }, [status, router]);

  const fetchAccountData = async () => {
    try {
      const [ordersRes, wishlistRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/wishlist')
      ]);
      
      const ordersData = await ordersRes.json();
      const wishlistData = await wishlistRes.json();
      
      setOrders(ordersData.orders || []);
      setWishlist(wishlistData.items || []);
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      await fetch('/api/wishlist/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      setWishlist(items => items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      // Show success message
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const navigation = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'payment', name: 'Payment Methods', icon: CreditCard },
    { id: 'settings', name: 'Account Settings', icon: Settings }
  ];

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {session?.user?.name?.split(' ')[0]}
                </h1>
                <p className="text-gray-600">{session?.user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-32">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                        <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Heart className="h-8 w-8 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Wishlist Items</p>
                        <p className="text-2xl font-semibold text-gray-900">{wishlist.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Star className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                        <p className="text-lg font-semibold text-gray-900">2024</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View All
                    </button>
                  </div>
                  
                  {orders.slice(0, 3).length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No orders yet</p>
                      <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Start shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                          <div className="flex items-center space-x-4">
                            {getStatusIcon(order.status)}
                            <div>
                              <h3 className="font-medium text-gray-900">
                                Order #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Start shopping for Tesla parts</p>
                    <Link
                      href="/"
                      className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Browse Parts
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            {getStatusIcon(order.status)}
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Order #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Placed on {new Date(order.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ${order.total.toFixed(2)}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                {item.product.images && item.product.images[0] ? (
                                  <Image
                                    src={item.product.images[0].url}
                                    alt={item.product.images[0].altText || item.product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              
                              <p className="font-medium text-gray-900">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                          <Link
                            href={`/order/${order.id}`}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Link>
                          
                          {order.status === 'delivered' && (
                            <button className="text-gray-600 hover:text-gray-900 font-medium">
                              Buy Again
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Wishlist</h2>
                
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-6">Save items you love for later</p>
                    <Link
                      href="/"
                      className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Browse Parts
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                          {item.product.images && item.product.images[0] ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.images[0].altText || item.product.name}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs text-blue-600 font-medium">
                            {item.product.category.name}
                          </div>
                          
                          <h3 className="font-medium text-gray-900 line-clamp-2">
                            <Link 
                              href={`/product/${item.product.slug}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {item.product.name}
                            </Link>
                          </h3>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              ${item.product.price}
                            </span>
                            {item.product.compareAtPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${item.product.compareAtPrice}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            {item.product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => addToCart(item.product.id)}
                            disabled={item.product.stockQuantity === 0}
                            className="flex-1 bg-gray-900 text-white py-2 px-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            {item.product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                          
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove from wishlist"
                          >
                            <Heart className="h-5 w-5 fill-current" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Addresses</h2>
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h3>
                  <p className="text-gray-600 mb-6">Add an address for faster checkout</p>
                  <button className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    Add Address
                  </button>
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Methods</h2>
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                  <p className="text-gray-600 mb-6">Add a payment method for faster checkout</p>
                  <button className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={session?.user?.name || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={session?.user?.email || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive updates about your orders</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                          <p className="text-sm text-gray-500">Receive promotional offers and news</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <button className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;