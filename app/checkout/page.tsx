"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  ArrowLeft, 
  Lock, 
  CreditCard, 
  Truck, 
  Shield, 
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Eye,
  EyeOff
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images?: { url: string; altText: string }[];
    category: { name: string };
  };
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface GuestCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  addedAt: string;
}

// Stripe card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true, // We'll collect postal code separately
};

// Payment Form Component (uses Stripe hooks)
const PaymentForm = ({ 
  shippingInfo, 
  billingInfo, 
  useSameAddress,
  cartItems, 
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
  setIsProcessing,
  checkoutType 
}: {
  shippingInfo: ShippingInfo;
  billingInfo: BillingInfo;
  useSameAddress: boolean;
  cartItems: CartItem[];
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  checkoutType: 'guest' | 'login';
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    if (!stripe || !elements) {
      onPaymentError('Stripe not loaded');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError('Card element not found');
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate total
      const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const shipping = subtotal >= 200 ? 0 : 15.99;
      const tax = subtotal * 0.12;
      const total = Math.round((subtotal + shipping + tax) * 100); // Convert to cents

      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'cad',
          cartItems,
          shippingInfo,
          billingInfo: useSameAddress ? shippingInfo : billingInfo,
          isGuest: checkoutType === 'guest'
        }),
      });

      const { client_secret, error } = await response.json();

      if (error) {
        onPaymentError(error);
        return;
      }

      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${billingInfo.firstName} ${billingInfo.lastName}`,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: {
              line1: useSameAddress ? shippingInfo.address : billingInfo.address,
              city: useSameAddress ? shippingInfo.city : billingInfo.city,
              state: useSameAddress ? shippingInfo.province : billingInfo.province,
              postal_code: useSameAddress ? shippingInfo.postalCode : billingInfo.postalCode,
              country: useSameAddress ? shippingInfo.country : billingInfo.country,
            },
          },
        },
      });

      if (paymentError) {
        onPaymentError(paymentError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      onPaymentError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information *
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Your payment information is encrypted and secure
        </p>
      </div>

      {/* Payment Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={!stripe || isProcessing}
        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            <span>Complete Order</span>
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <Shield className="h-4 w-4" />
        <span>Secured by Stripe • SSL Encrypted</span>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkoutType, setCheckoutType] = useState<'guest' | 'login' | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    province: 'BC',
    postalCode: '',
    country: 'Canada'
  });

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: 'BC',
    postalCode: '',
    country: 'Canada'
  });

  // Load cart based on auth status
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'authenticated') {
      setCheckoutType('login');
      fetchCart();
    } else {
      setCheckoutType(null);
      fetchGuestCart();
    }
  }, [status]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCartItems(data.items || []);
      
      if (data.items?.length === 0) {
        router.push('/cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestCart = async () => {
    try {
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        const guestItems: GuestCartItem[] = JSON.parse(guestCart);
        
        if (guestItems.length === 0) {
          router.push('/cart');
          return;
        }
        
        // Fetch product details for each item
        const cartItemsWithDetails = await Promise.all(
          guestItems.map(async (item) => {
            try {
              const productResponse = await fetch(`/api/products/${item.productId}`);
              if (productResponse.ok) {
                const product = await productResponse.json();
                return {
                  id: `guest-${item.productId}`,
                  quantity: item.quantity,
                  product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    images: product.images,
                    category: product.category,
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
        
        const validItems = cartItemsWithDetails.filter(item => item !== null) as CartItem[];
        setCartItems(validItems);
        
        if (validItems.length === 0) {
          router.push('/cart');
        }
      } else {
        router.push('/cart');
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Validate shipping info
      if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
      if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone is required';
      if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
      if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
      if (!shippingInfo.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

      // Validate billing info if different from shipping
      if (!useSameAddress) {
        if (!billingInfo.firstName.trim()) newErrors.billingFirstName = 'Billing first name is required';
        if (!billingInfo.lastName.trim()) newErrors.billingLastName = 'Billing last name is required';
        if (!billingInfo.address.trim()) newErrors.billingAddress = 'Billing address is required';
        if (!billingInfo.city.trim()) newErrors.billingCity = 'Billing city is required';
        if (!billingInfo.postalCode.trim()) newErrors.billingPostalCode = 'Billing postal code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Create order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          items: cartItems,
          shipping: shippingInfo,
          billing: useSameAddress ? shippingInfo : billingInfo,
          isGuest: checkoutType === 'guest'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear guest cart if it was a guest order
        if (checkoutType === 'guest') {
          localStorage.removeItem('guestCart');
          window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { count: 0, isGuest: true } 
          }));
        }
        
        router.push(`/order-confirmation/${data.orderId}`);
      } else {
        setErrors({ submit: data.error || 'Order creation failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred while creating your order.' });
    }
  };

  const handlePaymentError = (error: string) => {
    setErrors({ payment: error });
  };

  const subtotal = cartItems.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  );
  
  const shipping = subtotal >= 200 ? 0 : 15.99;
  const tax = subtotal * 0.12; // 12% tax
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show checkout type selection for unauthenticated users
  if (checkoutType === null) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Choose how you'd like to proceed</p>
          </div>

          {/* Checkout Options */}
          <div className="space-y-4">
            
            {/* Guest Checkout */}
            <button
              onClick={() => setCheckoutType('guest')}
              className="w-full bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100">
                  <User className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Continue as Guest</h3>
                  <p className="text-gray-600 text-sm">Quick checkout without creating an account</p>
                </div>
              </div>
            </button>

            {/* Login Option */}
            <button
              onClick={() => router.push('/auth/login?redirect=/checkout')}
              className="w-full bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-100">
                  <Lock className="h-6 w-6 text-gray-600 group-hover:text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sign In to Your Account</h3>
                  <p className="text-gray-600 text-sm">Access saved addresses and faster checkout</p>
                </div>
              </div>
            </button>
          </div>

          {/* Back to Cart */}
          <div className="mt-8 text-center">
            <Link 
              href="/cart"
              className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart</span>
            </Link>
          </div>

          {/* Order Summary Preview */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items ({cartItems.length})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main checkout flow
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {checkoutType === 'guest' ? 'Guest Checkout' : 'Checkout'}
              </h1>
              <p className="text-gray-600 mt-1">
                Step {currentStep} of 2
              </p>
            </div>
            
            <Link 
              href="/cart"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart</span>
            </Link>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-4 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Shipping Information</span>
              <span>Payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                  
                  <div className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* City, Province, Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Province *
                        </label>
                        <select
                          value={shippingInfo.province}
                          onChange={(e) => setShippingInfo({...shippingInfo, province: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="BC">British Columbia</option>
                          <option value="AB">Alberta</option>
                          <option value="SK">Saskatchewan</option>
                          <option value="MB">Manitoba</option>
                          <option value="ON">Ontario</option>
                          <option value="QC">Quebec</option>
                          <option value="NB">New Brunswick</option>
                          <option value="NS">Nova Scotia</option>
                          <option value="PE">Prince Edward Island</option>
                          <option value="NL">Newfoundland and Labrador</option>
                          <option value="YT">Yukon</option>
                          <option value="NT">Northwest Territories</option>
                          <option value="NU">Nunavut</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.postalCode}
                          onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.postalCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                      </div>
                    </div>

                    {/* Billing Address Checkbox */}
                    <div className="border-t border-gray-200 pt-6">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={useSameAddress}
                          onChange={(e) => setUseSameAddress(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Billing address is the same as shipping address</span>
                      </label>
                    </div>

                    {/* Billing Address Fields (when different from shipping) */}
                    {!useSameAddress && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                        
                        <div className="space-y-4">
                          {/* Billing Name Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                              </label>
                              <input
                                type="text"
                                value={billingInfo.firstName}
                                onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors.billingFirstName ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.billingFirstName && <p className="text-red-500 text-xs mt-1">{errors.billingFirstName}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                              </label>
                              <input
                                type="text"
                                value={billingInfo.lastName}
                                onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors.billingLastName ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.billingLastName && <p className="text-red-500 text-xs mt-1">{errors.billingLastName}</p>}
                            </div>
                          </div>

                          {/* Billing Address */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Street Address *
                            </label>
                            <input
                              type="text"
                              value={billingInfo.address}
                              onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {errors.billingAddress && <p className="text-red-500 text-xs mt-1">{errors.billingAddress}</p>}
                          </div>

                          {/* Billing City, Province, Postal Code */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                              </label>
                              <input
                                type="text"
                                value={billingInfo.city}
                                onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors.billingCity ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.billingCity && <p className="text-red-500 text-xs mt-1">{errors.billingCity}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Province *
                              </label>
                              <select
                                value={billingInfo.province}
                                onChange={(e) => setBillingInfo({...billingInfo, province: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="BC">British Columbia</option>
                                <option value="AB">Alberta</option>
                                <option value="SK">Saskatchewan</option>
                                <option value="MB">Manitoba</option>
                                <option value="ON">Ontario</option>
                                <option value="QC">Quebec</option>
                                <option value="NB">New Brunswick</option>
                                <option value="NS">Nova Scotia</option>
                                <option value="PE">Prince Edward Island</option>
                                <option value="NL">Newfoundland and Labrador</option>
                                <option value="YT">Yukon</option>
                                <option value="NT">Northwest Territories</option>
                                <option value="NU">Nunavut</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Postal Code *
                              </label>
                              <input
                                type="text"
                                value={billingInfo.postalCode}
                                onChange={(e) => setBillingInfo({...billingInfo, postalCode: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors.billingPostalCode ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.billingPostalCode && <p className="text-red-500 text-xs mt-1">{errors.billingPostalCode}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Continue Button */}
                    <div className="pt-6">
                      <button
                        onClick={handleNext}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>Continue to Payment</span>
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Shipping</span>
                    </button>
                  </div>

                  {errors.payment && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-red-700 text-sm">{errors.payment}</p>
                      </div>
                    </div>
                  )}

                  {errors.submit && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-red-700 text-sm">{errors.submit}</p>
                      </div>
                    </div>
                  )}

                  <PaymentForm
                    shippingInfo={shippingInfo}
                    billingInfo={billingInfo}
                    useSameAddress={useSameAddress}
                    cartItems={cartItems}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    isProcessing={processing}
                    setIsProcessing={setProcessing}
                    checkoutType={checkoutType || 'guest'}
                  />
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images?.length ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.images[0].altText || item.product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      Free shipping on orders over $200
                    </p>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (12%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>SSL Secure Checkout</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span>Free shipping over $200</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default CheckoutPage;