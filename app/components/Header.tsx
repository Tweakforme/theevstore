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
              <svg width="180" height="45" viewBox="0 0 400 100" className="transition-all duration-300 group-hover:scale-105">
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0891b2" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                
                <path d="M75 18 Q88 12 105 18 L118 25 L125 32 L118 39 L105 46 Q88 52 75 46 Z" fill="url(#greenGradient)" className="drop-shadow-sm"/>
                <rect x="120" y="28" width="10" height="5" fill="url(#greenGradient)"/>
                <rect x="120" y="35" width="10" height="5" fill="url(#greenGradient)"/>
                <path d="M15 65 Q45 15 85 28 Q125 38 145 65 Q125 52 85 42 Q45 32 15 65 Z" fill="url(#greenGradient)"/>
                <path d="M145 25 Q210 5 290 18 Q370 28 385 52 Q350 38 290 32 Q210 26 145 25 Z" fill="url(#blueGradient)"/>
                <path d="M385 52 Q365 46 345 52 Q325 58 305 65 Q285 72 265 78 L385 78 Z" fill="url(#blueGradient)"/>
                
                <text x="115" y="78" fontFamily="system-ui" fontWeight="800" fontSize="26" fill="#0f172a" className="select-none">THE</text>
                <text x="165" y="78" fontFamily="system-ui" fontWeight="800" fontSize="30" fill="#0f172a" className="select-none">EV</text>
                <text x="210" y="78" fontFamily="system-ui" fontWeight="800" fontSize="30" fill="#0f172a" className="select-none">STORE</text>
              </svg>
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
            <div className="relative group cursor-pointer">
              <div className="p-2 rounded-full hover:bg-slate-100 transition-all duration-300">
                <User className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
              </div>
            </div>
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;