'use client';

import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50 border-b-2 border-green-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <a
              href="/marketplace"
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition"
            >
              <i className="fas fa-store"></i>
              <span>Marketplace Hub</span>
            </a>
            <a
                href="/login"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </a>
            <a
              href="/register-vendor"
              className="px-4 lg:px-5 py-2.5 rounded-xl gradient-green text-white text-sm font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Daftar Vendor
            </a>
            <a
              href="https://my.kooperasi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 lg:px-5 py-2.5 rounded-xl border-2 border-green-600 text-green-600 text-sm font-semibold hover:bg-green-50 transition"
            >
              Daftar Koperasi
            </a>
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
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg fade-in">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <a
              href="/marketplace"
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-3 text-sm font-medium rounded-lg hover:bg-green-50 transition"
            >
              <i className="fas fa-store"></i>
              <span>Marketplace Hub</span>
            </a>
            <a
                href="/login"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-3 text-sm font-medium rounded-lg hover:bg-green-50 transition"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </a>
            <a
              href="/register-vendor"
              className="block w-full text-center px-4 py-3 rounded-xl gradient-green text-white text-sm font-semibold shadow-lg"
            >
              Daftar Vendor
            </a>
            <a
              href="https://my.kooperasi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-3 rounded-xl border-2 border-green-600 text-green-600 text-sm font-semibold"
            >
              Daftar Koperasi
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
