/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import React, { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center group cursor-pointer">
            <a href="/" className="relative">
              <img 
                src="/images/logo.png" 
                alt="The EV Store"
                width={180}
                height={45}
                className="h-12 w-auto transition-all duration-300 group-hover:scale-105"
              />
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            <a 
              href="/"
              className="relative text-slate-600 hover:text-slate-900 font-medium text-sm tracking-wide transition-all duration-300 group/nav"
            >
              All Parts
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover/nav:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#"
              className="relative text-slate-600 hover:text-slate-900 font-medium text-sm tracking-wide transition-all duration-300 group/nav"
            >
              Accessories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover/nav:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="/about"
              className="relative text-slate-600 hover:text-slate-900 font-medium text-sm tracking-wide transition-all duration-300 group/nav"
            >
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover/nav:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#"
              className="relative text-slate-600 hover:text-slate-900 font-medium text-sm tracking-wide transition-all duration-300 group/nav"
            >
              Support
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover/nav:w-full transition-all duration-300"></span>
            </a>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-5">
            <div className="relative group cursor-pointer">
              <div className="p-2 rounded-full hover:bg-slate-100 transition-all duration-300">
                <Search className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
              </div>
            </div>
            <a href="/auth/login" className="relative group cursor-pointer">
              <div className="p-2 rounded-full hover:bg-slate-100 transition-all duration-300">
                <User className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
              </div>
            </a>
            <div className="relative group cursor-pointer">
              <div className="p-2 rounded-full hover:bg-slate-100 transition-all duration-300">
                <ShoppingBag className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-medium animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-slate-100 transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl">
            <div className="px-6 py-8 space-y-6">
              <a href="/" className="block text-slate-600 hover:text-slate-900 font-medium text-lg">All Parts</a>
              <a href="#" className="block text-slate-600 hover:text-slate-900 font-medium text-lg">Accessories</a>
              <a href="/about" className="block text-slate-600 hover:text-slate-900 font-medium text-lg">About Us</a>
              <a href="#" className="block text-slate-600 hover:text-slate-900 font-medium text-lg">Support</a>
              <a href="/auth/login" className="block text-slate-600 hover:text-slate-900 font-medium text-lg">Sign In</a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;