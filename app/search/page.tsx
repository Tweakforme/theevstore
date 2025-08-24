"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  images?: { url: string; altText: string }[];
  stockQuantity: number;
  category: { name: string; slug: string };
  compatibleModels?: string;
  rating?: number;
  reviewCount?: number;
}

const SearchResultsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, sortBy, selectedCategories, priceRange]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        sort: sortBy,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        categories: selectedCategories.join(',')
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      // Show success message or update cart count
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const categories = [
    'Body Components',
    'Brakes & Safety', 
    'Electrical Systems',
    'Interior & Trim',
    'Exterior Fittings',
    'Wheels & Tires'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Search Input */}
            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleNewSearch} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for Tesla parts..."
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between lg:justify-end gap-4">
              <div className="text-sm text-gray-600">
                {loading ? 'Searching...' : `${products.length} results for "${query}"`}
              </div>
              
              {/* View Toggle & Filters */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                </button>
                
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-32">
              
              {/* Sort By */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange([0, 1000]);
                  setSortBy('relevance');
                }}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange([0, 1000]);
                    setSortBy('relevance');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'w-full'} relative`}>
                      <div className={`${viewMode === 'list' ? 'h-32' : 'h-48'} bg-gray-100 relative overflow-hidden`}>
                        {product.images && product.images[0] ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.images[0].altText || product.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="h-12 w-12" />
                          </div>
                        )}
                        
                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <button className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors">
                            <Heart className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Stock Badge */}
                        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                          <div className="absolute bottom-2 left-2">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                              Only {product.stockQuantity} left
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <div>
                        {/* Category */}
                        <div className="text-xs text-blue-600 font-medium mb-1">
                          {product.category.name}
                        </div>

                        {/* Product Name */}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          <Link 
                            href={`/product/${product.slug}`}
                            className="hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {product.name}
                          </Link>
                        </h3>

                        {/* Compatible Models */}
                        {product.compatibleModels && (
                          <div className="text-xs text-gray-500 mb-2">
                            Compatible: {product.compatibleModels}
                          </div>
                        )}

                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${
                                    i < Math.floor(product.rating!) 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-1">
                              ({product.reviewCount || 0})
                            </span>
                          </div>
                        )}

                        {/* Description (List view only) */}
                        {viewMode === 'list' && product.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : 'space-y-3'}`}>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              ${product.price}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                ${product.compareAtPrice}
                              </span>
                            )}
                          </div>
                          
                          {/* Stock Status */}
                          <div className="text-xs text-gray-500">
                            {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </div>

                        {/* Add to Cart */}
                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={product.stockQuantity === 0}
                          className={`${
                            viewMode === 'list' ? 'px-4 py-2' : 'w-full py-2'
                          } bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>{product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense wrapper
const SearchPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchPage;