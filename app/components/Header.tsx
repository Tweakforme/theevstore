"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Car, Package } from 'lucide-react';

const PremiumHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileSection, setActiveMobileSection] = useState(null);
  const [cartCount, setCartCount] = useState(3);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Model 3 Categories (clean and organized)
  const model3Categories = [
    { name: 'Body Components', href: '/model-3/body' },
    { name: 'Brakes & Safety', href: '/model-3/brakes' },
    { name: 'Chassis & Suspension', href: '/model-3/chassis' },
    { name: 'Electrical Systems', href: '/model-3/electrical' },
    { name: 'Exterior Fittings', href: '/model-3/exterior' },
    { name: 'Interior & Trim', href: '/model-3/interior' },
    { name: 'Thermal Management', href: '/model-3/thermal' },
    { name: 'Wheels & Tires', href: '/model-3/wheels' }
  ];

  const accessories = [
    { name: 'Model 3 ', href: '/accessories/model-3' },
    { name: 'Model Y ', href: '/accessories/model-y' },
  
  ];

  const handleDropdownToggle = (dropdown: string | null) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleMobileSectionToggle = (section: string | null) => {
    setActiveMobileSection(activeMobileSection === section ? null : section);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm' 
          : 'bg-white/90 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              
              {/* Model 3 Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('model3')}
                  className="inline-flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors duration-200 py-2"
                >
                  <span>Model 3</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === 'model3' ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {activeDropdown === 'model3' && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Model 3 Parts</div>
                    </div>
                    {model3Categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                        onClick={closeDropdowns}
                      >
                        {category.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-50 mt-2 pt-2">
                      <Link
                        href="/model-3"
                        className="block px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150"
                        onClick={closeDropdowns}
                      >
                        View All Model 3 →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Model Y (Coming Soon) */}
              <div className="relative">
                <span className="inline-flex items-center space-x-2 text-gray-400 font-medium text-sm cursor-not-allowed">
                  <span>Model Y</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Soon</span>
                </span>
              </div>

              {/* Accessories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('accessories')}
                  className="inline-flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors duration-200 py-2"
                >
                  <span>Accessories</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === 'accessories' ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {activeDropdown === 'accessories' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Accessories</div>
                    </div>
                    {accessories.map((accessory) => (
                      <Link
                        key={accessory.name}
                        href={accessory.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                        onClick={closeDropdowns}
                      >
                        {accessory.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* About & Support */}
              <Link 
                href="/about"
                className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors duration-200"
              >
                About
              </Link>
              <Link 
                href="/support"
                className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors duration-200"
              >
                Support
              </Link>
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Search */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200">
                <Search className="h-5 w-5" />
              </button>

              {/* Account */}
              <Link 
                href="/auth/login" 
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Overlay */}
        {activeDropdown && (
          <div 
            className="fixed inset-0 z-40"
            onClick={closeDropdowns}
          />
        )}
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <Image 
                src="/images/logo.png" 
                alt="The EV Store"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="overflow-y-auto h-full pb-20">
              <nav className="px-6 py-6 space-y-4">
                
                {/* Model 3 Section */}
                <div>
                  <button
                    onClick={() => handleMobileSectionToggle('model3')}
                    className="flex items-center justify-between w-full py-3 text-left"
                  >
                    <div className="flex items-center">
                      <Car className="h-4 w-4 text-gray-400 mr-3" />
                      <h3 className="font-semibold text-gray-900 text-base">Model 3</h3>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        activeMobileSection === 'model3' ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  {activeMobileSection === 'model3' && (
                    <div className="ml-7 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {model3Categories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="block py-2 text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                      <Link
                        href="/model-3"
                        className="block py-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 mt-3 pt-3 border-t border-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        View All Model 3 →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Model Y Section */}
                <div className="py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 text-gray-300 mr-3" />
                      <h3 className="font-semibold text-gray-400 text-base">Model Y</h3>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Coming Soon</span>
                  </div>
                </div>

                {/* Accessories Section */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => handleMobileSectionToggle('accessories')}
                    className="flex items-center justify-between w-full py-3 text-left"
                  >
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-3" />
                      <h3 className="font-semibold text-gray-900 text-base">Accessories</h3>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        activeMobileSection === 'accessories' ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  {activeMobileSection === 'accessories' && (
                    <div className="ml-7 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {accessories.map((accessory) => (
                        <Link
                          key={accessory.name}
                          href={accessory.href}
                          className="block py-2 text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {accessory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Links */}
                <div className="pt-4 border-t border-gray-100 space-y-1">
                  <Link
                    href="/about"
                    className="block py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/support"
                    className="block py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Support
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Account
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PremiumHeader;