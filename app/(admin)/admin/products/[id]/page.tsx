"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Package, DollarSign, Warehouse, Tag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  trackQuantity: boolean;
  compatibleModels: string | null;
  weight: number | null;
  dimensions: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    level: number;
  };
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        router.push('/admin/products');
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Product not found</h3>
        <p className="mt-1 text-sm text-gray-500">{error || 'The product you are looking for does not exist.'}</p>
        <button
          onClick={() => router.push('/admin/products')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">SKU: {product.sku}</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Product</span>
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((image) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.url}
                      alt={image.altText || product.name}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-500">No images uploaded</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
            {product.shortDescription && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Short Description</h4>
                <p className="text-gray-600">{product.shortDescription}</p>
              </div>
            )}
            {product.description ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
              </div>
            ) : (
              <p className="text-gray-500">No description available</p>
            )}
          </div>

          {/* Technical Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.weight && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Weight</span>
                  <p className="text-gray-900">{product.weight} kg</p>
                </div>
              )}
              {product.dimensions && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Dimensions</span>
                  <p className="text-gray-900">{product.dimensions}</p>
                </div>
              )}
              {product.compatibleModels && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Compatible Models</span>
                  <p className="text-gray-900">
                    {product.compatibleModels.split(',').map(model => 
                      model.replace('_', ' ')
                    ).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing & Stock */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Stock</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-xl font-bold text-gray-900">${product.price} CAD</p>
                  {product.compareAtPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      ${product.compareAtPrice} CAD
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Warehouse className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Stock Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">{product.stockQuantity} units</p>
                  {product.stockQuantity <= product.lowStockThreshold && (
                    <p className="text-sm text-red-600">Low stock!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category</h3>
            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">{product.category.name}</p>
                <p className="text-sm text-gray-500">Level {product.category.level}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Active</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Featured</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.isFeatured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.isFeatured ? 'Featured' : 'Regular'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Track Quantity</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.trackQuantity ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.trackQuantity ? 'Tracked' : 'Not Tracked'}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timestamps</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="text-gray-900">{new Date(product.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <p className="text-gray-900">{new Date(product.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}