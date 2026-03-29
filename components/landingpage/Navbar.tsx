'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDaftarOpen, setIsDaftarOpen] = useState(false);
  const { user, isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [isHydrated, user, hydrate]);

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
    <nav className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="max-w-7xl mx-auto bg-white backdrop-blur-lg shadow-xl border border-green-500 rounded-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo Section */}
          <div className="flex flex-col items-center">
            <Link href="/" className="">
              <div className="relative w-36 md:w-48 h-12 md:h-16">
                <Image
                  src="/images/koperasihub.png"
                  alt="KoperasiHub Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {/* <a
              href="/marketplace-vendor"
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition"
            >
              <i className="fas fa-store"></i>
              <span>Marketplace Vendor</span>
            </a> */}

            <Link
              href="/marketplace"
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition"
            >
              <i className="fas fa-store"></i>
              <span>Marketplace Koperasi</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => {
                  setIsDaftarOpen(!isDaftarOpen);
                }}
                className="px-4 lg:px-5 py-2.5 rounded-xl gradient-green text-white text-sm font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Daftar</span>
                <i className="fas fa-chevron-down text-sm"></i>
              </button>

              {isDaftarOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border overflow-hidden z-50">
                  <Link
                    href="/register/vendor"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50"
                  >
                    Jadi Vendor
                  </Link>
                  <Link
                    href="/register/koperasi"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50"
                  >
                    Mulai Jualan
                  </Link>
                  <Link
                    href="/marketplace"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50"
                  >
                    Mulai Promosi
                  </Link>
                  <Link
                    href="/register/reseller"
                    className="block px-4 py-2 text-[10px] text-gray-400 hover:bg-gray-50 italic"
                  >
                    Daftar Reseller Individual
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              {isHydrated && user ? (
                <Link href={getDashboardPath()}>
                  <button className="px-4 lg:px-5 py-2.5 rounded-xl border-2 border-green-600 bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition flex items-center space-x-2">
                    <span>Dashboard</span>
                  </button>
                </Link>
              ) : (
                <a href="/login" >
                  <button className="px-4 lg:px-5 py-2.5 rounded-xl border-2 border-green-600 text-green-600 text-sm font-semibold hover:bg-green-50 transition flex items-center space-x-2">
                    <span>Login</span>
                  </button>
                </a>
              )}
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-green-600 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <i className="fas fa-times text-2xl"></i>
            ) : (
              <i className="fas fa-bars text-2xl"></i>
            )}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
          } absolute top-20 left-4 right-4 z-50`}
      >
        <div className="bg-white border border-green-100 shadow-2xl rounded-2xl overflow-hidden">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link
              href="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-4 text-sm font-semibold rounded-xl hover:bg-green-50 transition"
            >
              <i className="fas fa-store text-green-600"></i>
              <span>Marketplace Koperasi</span>
            </Link>

            <div className="border-t border-gray-50 my-1"></div>

            <div>
              <button
                onClick={() => setIsDaftarOpen(!isDaftarOpen)}
                className={`flex items-center justify-between w-full px-4 py-4 text-sm font-semibold rounded-xl transition ${isDaftarOpen ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <i className="fas fa-user-plus text-green-600"></i>
                  <span>Daftar Sekarang</span>
                </div>
                <i className={`fas fa-chevron-${isDaftarOpen ? 'up' : 'down'} text-xs transition-transform duration-300`}></i>
              </button>

              {isDaftarOpen && (
                <div className="mt-1 ml-4 pl-4 border-l-2 border-green-100 space-y-1 animate-fade-in">
                  <Link href="/register/vendor" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-600 hover:text-green-600 rounded-lg hover:bg-green-50">Jadi Vendor</Link>
                  <Link href="/register/koperasi" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-600 hover:text-green-600 rounded-lg hover:bg-green-50">Mulai Jualan</Link>
                  <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-600 hover:text-green-600 rounded-lg hover:bg-green-50">Mulai Promosi</Link>
                  <Link href="/register/reseller" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-[10px] text-gray-400 italic">Daftar Reseller</Link>
                </div>
              )}
            </div>

            <div className="border-t border-gray-50 my-1"></div>

            <div>
              {isHydrated && user ? (
                <Link href={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <button className="flex items-center justify-between w-full px-4 py-4 text-sm font-bold text-white bg-green-600 rounded-xl shadow-md hover:bg-green-700 transition">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-th-large"></i>
                      <span>Dashboard</span>
                    </div>
                    <i className="fas fa-arrow-right text-xs"></i>
                  </button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="flex items-center justify-center w-full px-4 py-4 text-sm font-bold text-green-600 border-2 border-green-600 rounded-xl hover:bg-green-50 transition">
                    <span>Masuk / Login</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
