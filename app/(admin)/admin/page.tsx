import Link from "next/link";
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  // These will be real data from your database later
  const stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Tesla parts store admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.revenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <span className="font-medium">Add New Product</span>
              <Package className="w-5 h-5 text-gray-400" />
            </Link>
            <Link
              href="/admin/import"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <span className="font-medium">Import from Excel</span>
              <Package className="w-5 h-5 text-gray-400" />
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <span className="font-medium">Manage Categories</span>
              <Package className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-gray-500">
            <p>No recent activity yet. Start by adding your first products!</p>
          </div>
        </div>
      </div>
    </div>
  );
}