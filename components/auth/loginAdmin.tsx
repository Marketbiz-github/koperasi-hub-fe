"use client";

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface LoginFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  email,
  password,
  showPassword,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: LoginFormProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Background Image with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-slate-700 to-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: `url('/images/market.webp')`,
          }}
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-gray-50 text-gray-800">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Login Admin
            </h1>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  placeholder="Masukkan email Anda"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none pr-12"
                    placeholder="Masukkan password Anda"
                    required
                  />
                  <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg shadow-green-600/30 hover:shadow-green-700/40"
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Belum jadi vendor?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                >
                  Daftar
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2025 KoperasiHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}