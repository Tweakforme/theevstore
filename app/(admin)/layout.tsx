"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Package, Users, ShoppingCart, BarChart3, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ useEffect MUST ALSO BE AT THE TOP
  useEffect(() => {
    // Only redirect if NOT on login page and no admin session
    if (pathname !== "/admin/login" && status !== "loading") {
      if (!session || session.user?.role !== "ADMIN") {
        router.push("/admin/login");
      }
    }
  }, [session, status, router, pathname]);

  // ✅ NOW we can do conditional returns AFTER all hooks
  // If this is the login page, render it without the admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">TheEVStore Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white h-screen shadow-sm">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin"
                  className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/products"
                  className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Package className="w-5 h-5" />
                  <span>Products</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/categories"
                  className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Package className="w-5 h-5" />
                  <span>Categories</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/collections"
                  className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Package className="w-5 h-5" />
                  <span>Collections</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/orders"
                  className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Orders</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/customers"
                  className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Users className="w-5 h-5" />
                  <span>Customers</span>
                </Link>
              </li>
              <li>
                <Link
  href="/admin/products/bulk-import"
  className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
>
  <Package className="w-5 h-5" />
  <span>Bulk Import</span>
</Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}