'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    if (!executeRecaptcha) {
      useAuthStore.setState({ error: 'CAPTCHA belum siap, silakan tunggu sebentar' });
      return;
    }

    const token = await executeRecaptcha('login');

    if (!token) {
      useAuthStore.setState({ error: 'Gagal mendapatkan token CAPTCHA' });
      return;
    }

    const result = await login(email, password, token);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="transition-transform hover:scale-105">
            <div className="relative w-48 h-16">
              <Image
                src="/images/koperasihub.png"
                alt="KoperasiHub Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <p className="text-slate-500 mt-4 font-medium">Masuk ke Dashboard Anda</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 mb-8 text-left">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none placeholder:text-slate-400"
                placeholder="email@anda.com"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                {/* <Link href="/forgot-password" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  Lupa password?
                </Link> */}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none pr-12 placeholder:text-slate-400"
                  placeholder="Password Anda"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Register Options */}
          <div className="text-center pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-sm mb-4">
              Belum punya akun?
            </p>

            <div className="flex flex-col gap-3">
              {/* Row 1: Vendor (Full Width, Gray like current Reseller) */}
              <Link
                href="/register/vendor"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all text-center"
              >
                Daftar Sebagai Vendor
              </Link>

              {/* Row 2: Koperasi & Reseller (Side-by-side, Outlined like current Koperasi) */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/register/koperasi"
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-emerald-600 font-bold text-xs hover:bg-emerald-50 hover:border-emerald-200 transition-all text-center"
                >
                  Daftar Koperasi
                </Link>
                <Link
                  href="/register/reseller"
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-emerald-600 font-bold text-xs hover:bg-emerald-50 hover:border-emerald-200 transition-all text-center"
                >
                  Daftar Reseller
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} KoperasiHub Platform. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
