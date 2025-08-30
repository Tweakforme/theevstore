"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Car,
  Package,
  Heart,
  MapPin,
  ChevronRight,
  Shield, // Added for admin icon
} from "lucide-react";
import { useSession } from "next-auth/react";

/* =========================
   Types
========================= */
type DropdownKey = "model3" | "modely" | "accessories" | null;

interface CartUpdatedDetail {
  count: number;
  isGuest?: boolean;
}

/* =========================
   Data (Edit links as needed)
========================= */

const model3Links: Array<{ label: string; href: string }> = [
  { label: "Body Components", href: "/category/body" },
  { label: "Brakes & Safety", href: "/category/brakes" },
  { label: "Chassis & Suspension", href: "/category/chassis" },
  { label: "Electrical Systems", href: "/category/electrical" },
  { label: "Exterior Fittings", href: "/category/exterior" },
  { label: "Interior & Trim", href: "/category/interior" },
  { label: "Thermal Management", href: "/category/thermal" },
  { label: "Wheels & Tires", href: "/category/wheels" },
];

const modelYLinks: Array<{ label: string; href: string }> = [
  // Mirror your Model Y information architecture here
  { label: "Body Components", href: "/y/body" },
  { label: "Brakes & Safety", href: "/y/brakes" },
  { label: "Chassis & Suspension", href: "/y/chassis" },
  { label: "Electrical Systems", href: "/y/electrical" },
  { label: "Exterior Fittings", href: "/y/exterior" },
  { label: "Interior & Trim", href: "/y/interior" },
  { label: "Thermal Management", href: "/y/thermal" },
  { label: "Wheels & Tires", href: "/y/wheels" },
];

const accessoriesLinks: Array<{ label: string; href: string }> = [
  { label: "Model 3 Accessories", href: "/accessories/model-3" },
  { label: "Model Y Accessories", href: "/accessories/model-y" },
  { label: "Floor Mats", href: "/accessories/floor-mats" },
  { label: "Phone Holders", href: "/accessories/phone-holders" },
  { label: "Charging Accessories", href: "/accessories/charging" },
  { label: "Storage Solutions", href: "/accessories/storage" },
];

/* =========================
   Component
========================= */

const EnhancedHeader: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navRef = useRef<HTMLDivElement>(null);

  /* ------------ Effects ------------ */

// Cart count loader (resilient to non-JSON responses)
useEffect(() => {
  const loadCartCount = async () => {
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        // probably got redirected to HTML; treat as empty cart
        setCartCount(0);
        return;
      }
      const data = (await res.json()) as { items?: Array<{ quantity: number }> };
      const count = data.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0;
      setCartCount(count);
    } catch {
      // Try guest cart fallback
      try {
        const guest = localStorage.getItem("guestCart");
        if (guest) {
          const parsed: Array<{ quantity: number }> = JSON.parse(guest);
          const count = parsed.reduce((sum, item) => sum + (item.quantity || 0), 0);
          setCartCount(count);
          return;
        }
      } catch {
        /* ignore */
      }
      setCartCount(0);
    }
  };

  loadCartCount();
}, [session]);


  // Listen for `cartUpdated` custom events
useEffect(() => {
  const handleCartUpdate = (event: Event) => {
    const detail = (event as CustomEvent<CartUpdatedDetail>).detail;
    console.log('Cart updated event received:', detail); // Debug log
    setCartCount(detail?.count ?? 0);
  };

  // Listen for custom cart events
  window.addEventListener("cartUpdated", handleCartUpdate as EventListener);
  
  // 🔥 NEW: Also listen for storage changes (for guest cart sync across tabs)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'guestCart' && e.newValue) {
      try {
        const cartItems = JSON.parse(e.newValue);
        const count = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setCartCount(count);
      } catch (error) {
        console.error('Error parsing guest cart from storage:', error);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener("cartUpdated", handleCartUpdate as EventListener);
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);

  /* ------------ Handlers ------------ */

  const toggleDropdown = (key: DropdownKey) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  // 🔥 NEW: Account button based on user role
  const renderAccountButton = () => {
    if (!session) {
      // Not logged in
      return (
        <Link
          href="/auth/login"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Sign In"
        >
          <User className="h-5 w-5" />
        </Link>
      );
    }

    if (session.user?.role === 'ADMIN') {
      // Admin user - red theme with shield icon
      return (
        <Link
          href="/admin"
          className="relative p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          aria-label="Admin Panel"
          title={`Admin: ${session.user?.name}`}
        >
          <Shield className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            A
          </span>
        </Link>
      );
    }

    // Regular customer
    return (
      <Link
        href="/account"
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        aria-label="My Account"
        title={`Account: ${session.user?.name}`}
      >
        <User className="h-5 w-5" />
      </Link>
    );
  };

  // 🔥 NEW: Mobile account card based on user role
  const renderMobileAccountCard = () => {
    if (!session) {
      return (
        <Link
          href="/auth/login"
          className="flex items-center gap-3"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Sign In</div>
            <div className="text-sm text-gray-500">Access your account</div>
          </div>
        </Link>
      );
    }

    if (session.user?.role === 'ADMIN') {
      return (
        <Link
          href="/admin"
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-1"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              <span>{session.user?.name}</span>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                ADMIN
              </span>
            </div>
            <div className="text-sm text-red-600 font-medium">Administrator Panel</div>
          </div>
        </Link>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{session.user?.name}</div>
          <div className="text-sm text-gray-500">Tesla Parts Member</div>
        </div>
      </div>
    );
  };

  /* ------------ Render ------------ */

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm"
            : "bg-white/90 backdrop-blur-md"
        }`}
      >
        {/* Announcement */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-center py-2 text-sm">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Free shipping on orders over $200 • Kamloops, BC</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={navRef}>
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <Image
                  src="/images/logo.png"
                  alt="The EV Store"
                  width={180}
                  height={48}
                  className="h-8 sm:h-10 lg:h-12 w-auto transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {/* Model 3 */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("model3")}
                  className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium text-sm py-2"
                  aria-expanded={activeDropdown === "model3"}
                >
                  <span>Model 3</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${activeDropdown === "model3" ? "rotate-180" : ""}`}
                  />
                </button>

                {activeDropdown === "model3" && (
                  <div className="absolute top-full left-0 mt-2 w-[720px] bg-white rounded-xl shadow-xl border border-gray-100 p-6">
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Model 3 Parts
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {model3Links.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <span className="truncate">{item.label}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <Link
                        href="/model-3"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all Model 3 parts
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Model Y */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("modely")}
                  className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium text-sm py-2"
                  aria-expanded={activeDropdown === "modely"}
                >
                  <span>Model Y</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${activeDropdown === "modely" ? "rotate-180" : ""}`}
                  />
                </button>

                {activeDropdown === "modely" && (
                  <div className="absolute top-full left-0 mt-2 w-[720px] bg-white rounded-xl shadow-xl border border-gray-100 p-6">
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Model Y Parts
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {modelYLinks.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <span className="truncate">{item.label}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <Link
                        href="/model-y"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all Model Y parts
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Accessories */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("accessories")}
                  className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium text-sm py-2"
                  aria-expanded={activeDropdown === "accessories"}
                >
                  <span>Accessories</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      activeDropdown === "accessories" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "accessories" && (
                  <div className="absolute top-full left-0 mt-2 w-[560px] bg-white rounded-xl shadow-xl border border-gray-100 p-6">
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Tesla Accessories
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {accessoriesLinks.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <span className="truncate">{item.label}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <Link
                        href="/accessories"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all accessories
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Simple links */}
              <Link
                href="/sale"
                className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2"
              >
                Sale
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2"
              >
                About
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setIsSearchOpen((s) => !s)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  aria-expanded={isSearchOpen}
                  aria-controls="desktop-search-popover"
                >
                  <Search className="h-5 w-5" />
                </button>

                {isSearchOpen && (
                  <div
                    id="desktop-search-popover"
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4"
                  >
                    <form onSubmit={handleSearchSubmit}>
                      <div className="relative">
                        <input
                          id="search-input"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for Tesla parts..."
                          className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                          aria-label="Submit search"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* 🔥 FIXED: Account button with role detection */}
              {renderAccountButton()}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => {
                  setIsMenuOpen((s) => !s);
                  setActiveDropdown(null);
                  setIsSearchOpen(false);
                }}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            id="mobile-menu"
            className="absolute top-0 right-0 h-full w-80 max-w-[88vw] bg-white shadow-2xl flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <Image src="/images/logo.png" alt="The EV Store" width={130} height={34} />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile search */}
            <div className="p-5 border-b border-gray-100">
              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setIsMenuOpen(false);
                }}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Tesla parts..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                    aria-label="Submit search"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile nav content */}
            <div className="flex-1 overflow-y-auto p-2">
              <nav className="space-y-2">
                {/* 🔥 FIXED: Account card with role detection */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {renderMobileAccountCard()}
                </div>

                {/* Model 3 accordion */}
                <details className="group rounded-lg border border-gray-200">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-gray-800 font-medium">
                    <span className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Model 3 Parts
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-2 pb-3">
                    {model3Links.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="truncate">{item.label}</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </Link>
                    ))}
                    <div className="pt-2">
                      <Link
                        href="/model-3"
                        onClick={() => setIsMenuOpen(false)}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2"
                      >
                        View all Model 3 parts
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </details>

                {/* Model Y accordion */}
                <details className="group rounded-lg border border-gray-200">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-gray-800 font-medium">
                    <span className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Model Y Parts
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-2 pb-3">
                    {modelYLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="truncate">{item.label}</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </Link>
                    ))}
                    <div className="pt-2">
                      <Link
                        href="/model-y"
                        onClick={() => setIsMenuOpen(false)}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2"
                      >
                        View all Model Y parts
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </details>

                {/* Accessories accordion */}
                <details className="group rounded-lg border border-gray-200">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-gray-800 font-medium">
                    <span className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Accessories
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-2 pb-3">
                    {accessoriesLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="truncate">{item.label}</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </Link>
                    ))}
                    <div className="pt-2">
                      <Link
                        href="/accessories"
                        onClick={() => setIsMenuOpen(false)}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2"
                      >
                        View all accessories
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </details>

                {/* Simple links */}
                <Link
                  href="/sale"
                  className="flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-red-500">%</span> Sale
                </Link>
                <Link
                  href="/about"
                  className="flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ℹ️ About
                </Link>
              </nav>
            </div>

            {/* Drawer footer / quick actions */}
            <div className="border-t border-gray-100 p-4 flex items-center justify-between">
              <Link
                href="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <Heart className="h-5 w-5" />
                Wishlist
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="relative inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Spacer so content isn't under header */}
      <div className="h-[100px]" />
    </>
  );
};

export default EnhancedHeader;