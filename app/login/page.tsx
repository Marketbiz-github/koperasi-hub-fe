'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    const result = await login(email, password);

    if (result.success && result.user) {
      const role = result.user.role;
      if (role === 'super_admin') {
        router.push('/dashboard/super_admin');
      } else if (role === 'vendor') {
        router.push('/dashboard/vendor');
      } else if (role === 'koperasi') {
        router.push('/dashboard/koperasi');
      } else if (role === 'reseller') {
        router.push('/dashboard/reseller');
      } else {
        router.push('/dashboard/affiliator');
      }
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black/70 p-4 overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/vendor.jpg"
          alt="Auth Background"
          fill
          priority
          className="object-cover opacity-20"
        />
      </div>

      {/* Dark overlay biar teks kebaca */}
      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* content */}
      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center space-x-3 justify-center mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 gradient-green rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                <span className="text-white font-bold text-xl md:text-2xl">K</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">KoperasiHub</div>
            </div>
            <p className="text-gray-600">Masuk ke Dashboard Anda</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6 mb-8">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none pr-12"
                  placeholder="Masukkan password Anda"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            {/* forget password */}
            <div className="text-right">
              <a href="/forgot-password" className="text-sm text-green-600 hover:underline">
                Lupa password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 gradient-green disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* register */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">
              Belum punya akun?
            </p>

            <div className="flex justify-center gap-4 text-sm">
              <a
                href="/register/vendor"
                className="text-green-600 font-medium hover:underline"
              >
                Daftar Vendor
              </a>

              <a
                href="https://my.kooperasi.com/" target='blank'
                className="text-green-600 font-medium hover:underline"
              >
                Daftar Koperasi
              </a>
            </div>
          </div>


          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              © 2025 KoperasiHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}