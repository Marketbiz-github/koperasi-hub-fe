'use client';

import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a2540] text-white py-12">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 gradient-green rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                <span className="text-white font-bold text-xl md:text-2xl">K</span>
              </div>
              <span className="text-xl font-bold">KoperasiHub</span>
            </div>
            <p className="text-gray-300 text-sm">Platform marketplace yang menghubungkan vendor koperasi dengan konsumen di seluruh Indonesia.</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Informasi</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-[#10b981] transition">Tentang kami</a></li>
              <li><a href="#" className="hover:text-[#10b981] transition">Cara kerja</a></li>
              <li><a href="#" className="hover:text-[#10b981] transition">Blog</a></li>
              <li><a href="#" className="hover:text-[#10b981] transition">Dokumentasi API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Bantuan</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-[#10b981] transition">FAQ</a></li>
              <li><a href="#" className="hover:text-[#10b981] transition">Kontak kami</a></li>
              <li><a href="#" className="hover:text-[#10b981] transition">Syarat & ketentuan</a></li>
            </ul>
          </div>

          
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2024 KoperasiHub. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-300 hover:text-[#10b981] transition"><Instagram className="w-6 h-6" /></a>
            <a href="#" className="text-gray-300 hover:text-[#10b981] transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}