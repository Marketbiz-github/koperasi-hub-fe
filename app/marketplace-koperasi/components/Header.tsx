'use client';

import Link from 'next/link';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useMounted } from '@/hooks/useMounted';

export default function Header() {
  const mounted = useMounted();

  const itemCount = useCartStore(
    (s) => s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  return (
    <header className="sticky top-0 z-50 bg-[#2F5755] shadow-lg">
      {/* Top bar: subtitle left, desktop nav right */}
      <div className=" text-white max-w-7xl mx-auto">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-gray-300">Marketplace Koperasi - Distribusi koperasi Indonesia</p>

          {/* Desktop nav (inline, right) */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="hover:text-[#10b981] transition">Cara Kerja</a>
            <a href="#" className="hover:text-[#10b981] transition">Jadi Vendor</a>
            <a href="#" className="hover:text-[#10b981] transition">Mulai Jualan</a>
            <a href="#" className="hover:text-[#10b981] transition">Mulai Promosi</a>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Secondary row: main navbar with logo + search/login */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 gradient-green rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                <span className="text-white font-bold text-xl md:text-2xl">K</span>
              </div>
              <span className="text-xl font-bold">KoperasiHub</span>
            </div>

            {/* Desktop search + cart + login */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="cari produk..."
                  className="bg-white text-gray-800 px-4 py-2 pr-10 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>

              {/* Cart icon */}
              <Link href="/marketplace-koperasi/cart" className="relative text-white hover:text-[#10b981] transition">
                <ShoppingCart className="w-6 h-6" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Login */}
              <Link
                href="/login/koperasi"
                className="gradient-green px-6 py-2 rounded-lg font-semibold text-white
                          inline-flex items-center justify-center transition"
              >
                Login
              </Link>
            </div>


            {/* Mobile condensed header (search below or icon) */}
            <div className="md:hidden flex items-center gap-3">
              <button className="text-white">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}