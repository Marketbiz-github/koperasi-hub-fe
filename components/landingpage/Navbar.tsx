'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDaftarOpen, setIsDaftarOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="max-w-7xl mx-auto bg-white backdrop-blur-lg shadow-xl border border-green-500 rounded-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 gradient-green rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
              <span className="text-white font-bold text-xl md:text-2xl">K</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              Koperasi<span className="text-green-600">Hub</span>
            </span>
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
                  <a
                    href="/register/vendor"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50"
                  >
                    Daftar Vendor
                  </a>
                  <a
                    href="https://my.kooperasi.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50"
                  >
                    Daftar Koperasi
                  </a>
                </div>
              )}
            </div>

            <div className="relative">
              <a href="/login" >
                <button className="px-4 lg:px-5 py-2.5 rounded-xl border-2 border-green-600 text-green-600 text-sm font-semibold hover:bg-green-50 transition flex items-center space-x-2">
                  <span>Login</span>
                </button>
              </a>
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

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg fade-in rounded-2xl mt-2">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {/* <a
              href="/marketplace-vendor"
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-3 text-sm font-medium rounded-lg hover:bg-green-50 transition"
            >
              <i className="fas fa-store"></i>
              <span>Marketplace Vendor</span>
            </a> */}

            <Link
              href="/marketplace"
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-3 text-sm font-medium rounded-lg hover:bg-green-50 transition"
            >
              <i className="fas fa-store"></i>
              <span>Marketplace Koperasi</span>
            </Link>

            <div>
              <button
                onClick={() => {
                  setIsDaftarOpen(!isDaftarOpen);
                }}
                className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50"
              >
                <span>Daftar</span>
                <i className={`fas ${isDaftarOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </button>

              {isDaftarOpen && (
                <div className="mt-2 space-y-2">
                  <a href="/register/vendor" className="block px-4 py-3 text-sm text-gray-700 rounded-lg hover:bg-green-50">Daftar Vendor</a>
                  <a href="https://my.kooperasi.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-3 text-sm text-gray-700 rounded-lg hover:bg-green-50">Daftar Koperasi</a>
                </div>
              )}
            </div>

            <div>
              <a href="/login" >
                <button className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50">
                  <span>Login</span>
                </button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
