"use client";
import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';

const TeslaPartsStore = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate carousel images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch products from your API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch products:', response.status);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'exterior', name: 'Exterior' },
    { id: 'interior', name: 'Interior' },
    { id: 'wheels', name: 'Wheels' },
    { id: 'performance', name: 'Performance' },
    { id: 'electronics', name: 'Electronics' }
  ];

  const teslaModels = [
    { id: 'all', name: 'All Models' },
    { id: 'Model 3', name: 'Model 3' },
    { id: 'Model Y', name: 'Model Y' },
    { id: 'Model S', name: 'Model S' },
    { id: 'Model X', name: 'Model X' }
  ];

  const filteredProducts = Array.isArray(products) ? products.filter((product: any) => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const modelMatch = selectedModel === 'all' || (product.teslaModel && product.teslaModel.includes(selectedModel));
    return categoryMatch && modelMatch;
  }) : [];

  return (
    <main>
      {/* Hero Section with Image Carousel */}
      <section className="relative min-h-[90vh] overflow-hidden flex items-center">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {/* Image 1 */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: 'url("/images/hero-1.jpg")',
              opacity: currentImageIndex === 0 ? 1 : 0
            }}
          />
          {/* Image 2 */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: 'url("/images/hero-2.jpg")',
              opacity: currentImageIndex === 1 ? 1 : 0
            }}
          />
          {/* Image 3 */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: 'url("/images/hero-3.jpg")',
              opacity: currentImageIndex === 2 ? 1 : 0
            }}
          />
          
          {/* Dark overlay for premium look */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-slate-900/70"></div>
          
          {/* Subtle accent overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-cyan-900/20"></div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentImageIndex === index 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 text-center z-10">
          <div className="space-y-8">
            <div className="flex items-center justify-center space-x-2 text-emerald-400 mb-6">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium tracking-wider uppercase">Premium Tesla Parts</span>
              <Sparkles className="h-5 w-5" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extralight tracking-tight text-white leading-none">
              <span className="block">Elevate</span>
              <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-light">
                Your Tesla
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-light">
              Precision-engineered components for the discerning Tesla enthusiast.
              <br className="hidden md:block" />
              <span className="text-slate-300">Where performance meets perfection.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button className="group relative overflow-hidden px-8 py-4 bg-white text-slate-900 font-medium rounded-full hover:bg-slate-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <span className="relative z-10 flex items-center justify-center">
                  Explore Collection
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
              <button className="px-8 py-4 border-2 border-white/30 text-white font-medium rounded-full hover:border-white/50 hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                View Catalog
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Filters */}
      <section className="py-16 bg-white/60 backdrop-blur-sm border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">Tesla Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 hover:border-slate-300 cursor-pointer shadow-sm"
              >
                {teslaModels.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 hover:border-slate-300 cursor-pointer shadow-sm"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find premium components..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-slate-300 placeholder-slate-400 shadow-sm"
                />
                <Search className="absolute right-4 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extralight text-slate-900 mb-4 tracking-tight">
              {selectedCategory === 'all' ? 'Our Collection' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">
              {loading ? 'Curating premium components...' : `${filteredProducts.length} exceptional products`}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
              <p className="text-slate-500 mt-4 font-light">Loading premium collection...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Sparkles className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-3xl font-light text-slate-900 mb-4">Curating Excellence</h3>
              <p className="text-slate-600 max-w-md mx-auto text-lg leading-relaxed">
                We're carefully selecting premium Tesla components for our collection. 
                <br />
                <span className="text-slate-400">Check back soon for exceptional parts.</span>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product: any) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:border-slate-200 hover:-translate-y-2">
                    <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-xl flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-emerald-600" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {product.teslaModel && (
                        <div className="flex gap-2 flex-wrap">
                          {product.teslaModel.split(',').map((model: string, index: number) => (
                            <span key={index} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                              {model.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <h3 className="font-semibold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors duration-300">
                        {product.name || 'Premium Component'}
                      </h3>
                      
                      {product.description && (
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-2xl font-light text-slate-900">
                          ${product.price || '0'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setCartCount(prev => prev + 1);
                          }}
                          disabled={product.stock === 0}
                          className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                            (product.stock || 0) > 0
                              ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 hover:shadow-lg'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {(product.stock || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default TeslaPartsStore;