/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import React, { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, Shield, AlertTriangle } from 'lucide-react';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        loginType: 'admin',
        redirect: false
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        const session = await getSession();
        if (session?.user?.role === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          setError('Access denied. Admin privileges required.');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent hydration issues by not rendering animations on server
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-6">
        <div className="relative z-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-light text-white mb-2">Administrator Portal</h1>
            <p className="text-red-300 font-medium uppercase tracking-wider text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements - Only render on client */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 max-w-md w-full">
        {/* Security Badge */}
        <div className="text-center mb-8">
          
          {/* Logo */}
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="/images/logo.png" 
              alt="The EV Store"
              width={160}
              height={40}
              className="h-10 w-auto opacity-90"
            />
          </div>
          
          <h1 className="text-xl font-light text-white mb-2">Administrator Portal</h1>
         
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8 relative">
          {/* Warning Banner */}
          <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-700/50 rounded-xl p-3 mb-6 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <p className="text-red-300 text-xs font-medium">Admins Only</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3 uppercase tracking-wider">
                Administrator ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-800/60 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter admin username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-14 py-4 bg-gray-800/60 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border border-red-700/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:via-orange-500 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-red-500/25 hover:scale-105 transform uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  
                  <span>Login</span>
                </div>
              )}
            </button>
          </div>

          {/* Security Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <Shield className="h-3 w-3" />
              <span>SSL Encrypted • Session Monitored • Multi-Factor Security</span>
            </div>
          </div>
        </div>

        {/* Back to Store */}
        <div className="text-center mt-8">
          <a 
            href="/" 
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors duration-300 inline-flex items-center space-x-2"
          >
            <span>← Return to Public Store</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;