'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useMounted } from '@/hooks/useMounted';
import { useAuthStore } from '@/store/authStore';


export default function Header() {
  const mounted = useMounted();

  const itemCount = useCartStore(
    (s) => s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const { user, isHydrated, hydrate } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/marketplace?name=${encodeURIComponent(search.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [isHydrated, hydrate]);

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    const role = user.role;
    if (role === 'super_admin') return '/dashboard/super_admin';
    if (role === 'vendor') return '/dashboard/vendor';
    if (role === 'koperasi') return '/dashboard/koperasi';
    if (role === 'reseller') return '/dashboard/reseller';
    return '/dashboard/promotor';
  };

  return (
    <header className="sticky top-0 z-50 bg-[#2F5755] shadow-lg">
      {/* Top bar: subtitle left, desktop nav right */}
      <div className=" text-white max-w-7xl mx-auto">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <p className="text-[10px] md:text-xs text-gray-300">Marketplace - Distribusi koperasi Indonesia</p>

          {/* Desktop nav (inline, right) */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#cara-kerja" className="hover:text-[#10b981] transition text-sm">Cara Kerja</Link>
            <Link href="/register/vendor" className="hover:text-[#10b981] transition text-sm">Jadi Vendor</Link>
            <Link href="/register/koperasi" className="hover:text-[#10b981] transition text-sm">Mulai Jualan</Link>
            <Link href="/marketplace" className="hover:text-[#10b981] transition text-sm">Mulai Promosi</Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
          >
            {mobileMenuOpen ? <i className="fas fa-times text-xl w-6 h-6 flex items-center justify-center"></i> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Secondary row: main navbar with logo + search/login */}
        <div className="border-t border-white/10">
          <div className="container mx-auto p-4 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 shrink-0">
              <Link href="/" className="">
                <div className="relative w-32 md:w-48 h-10 md:h-14">
                  <Image
                    src="/images/koperasihub-dark2.png"
                    alt="KoperasiHub Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop search + cart + login */}
            <div className="hidden md:flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="cari produk..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white text-gray-800 px-4 py-2 pr-10 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-emerald-500 transition">
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {/* Cart icon */}
              <Link href="/marketplace/cart" className="relative text-white hover:text-[#10b981] transition">
                <ShoppingCart className="w-6 h-6" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Login */}
              {isHydrated && user ? (
                <Link
                  href={getDashboardPath()}
                  className="gradient-green px-6 py-2 rounded-lg font-semibold text-white
                            inline-flex items-center justify-center transition gap-2"
                >
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="gradient-green px-6 py-2 rounded-lg font-semibold text-white
                            inline-flex items-center justify-center transition"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile condensed icons */}
            <div className="md:hidden flex items-center gap-4">
              <Link href="/marketplace/cart" className="relative text-white p-1">
                <ShoppingCart className="w-6 h-6" />
                {mounted && itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-[#2F5755]">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#2F5755] border-t border-white/10 ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
      >
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Cari produk di KoperasiHub..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/10 text-white placeholder-white/50 px-4 py-3 pr-10 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
            <button type="submit" className="absolute right-3 top-3.5 text-white/50 hover:text-white transition">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Mobile Links */}
          <nav className="flex flex-col space-y-1">
            <Link href="/#cara-kerja" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-emerald-400 py-3 border-b border-white/5 flex items-center justify-between">
              <span>Cara Kerja</span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </Link>
            <Link href="/register/vendor" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-emerald-400 py-3 border-b border-white/5 flex items-center justify-between">
              <span>Jadi Vendor</span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </Link>
            <Link href="/register/koperasi" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-emerald-400 py-3 border-b border-white/5 flex items-center justify-between">
              <span>Mulai Jualan</span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </Link>
          </nav>

          {/* Mobile Login/Auth */}
          <div className="pt-2">
            {isHydrated && user ? (
              <Link
                href={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full gradient-green py-4 rounded-xl font-bold text-white text-center flex items-center justify-center space-x-2 shadow-lg"
              >
                <i className="fas fa-th-large"></i>
                <span>Buka Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-white text-[#2F5755] py-4 rounded-xl font-bold text-center flex items-center justify-center shadow-lg hover:bg-gray-100 transition"
              >
                Masuk ke Akun
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
