'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/" className="">
                <div className="relative w-36 md:w-48 h-12 md:h-16">
                  <Image
                    src="/images/koperasihub-dark.png"
                    alt="KoperasiHub Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>
            <p className="text-gray-400 max-w-md mb-4">
              Platform yang menghubungkan vendor dengan koperasi di seluruh Indonesia. Memudahkan
              bisnis Anda berkembang bersama koperasi.
            </p>
            <div className="flex items-center space-x-2 text-green-400">
              <i className="fab fa-whatsapp text-xl"></i>
              <a
                href="https://wa.me/6285737278721/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-300 transition"
              >
                0857-3727-8721
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Tautan</h4>
            <ul className="space-y-2">
              <li>
                <a href="#tentang" className="hover:text-green-400 transition">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#cara-kerja" className="hover:text-green-400 transition">
                  Cara Kerja
                </a>
              </li>
              <li>
                <a href="/marketplace" className="hover:text-green-400 transition">
                  Marketplace
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} KoperasiHub Platform. Seluruh Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
