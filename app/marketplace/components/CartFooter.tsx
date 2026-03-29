'use client';

import Image from 'next/image';
import { ShieldCheck, Truck, Clock, HelpCircle } from 'lucide-react';

export default function CartFooter() {
    return (
        <footer className="bg-white border-t py-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Pembayaran Aman</h4>
                            <p className="text-xs text-gray-500">Enkripsi SSL & Keamanan Terjamin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Pengiriman Luas</h4>
                            <p className="text-xs text-gray-500">Menjangkau Seluruh Indonesia</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Layanan 24/7</h4>
                            <p className="text-xs text-gray-500">Siap Membantu Kapan Saja</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Pusat Bantuan</h4>
                            <p className="text-xs text-gray-500">Panduan & Pertanyaan Umum</p>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-32 h-8 grayscale opacity-50">
                            <Image
                                src="/images/koperasihub-dark.png"
                                alt="KoperasiHub"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            © {new Date().getFullYear()} KoperasiHub. Seluruh Hak Cipta Dilindungi.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
                        <a href="/tentang-kami" className="hover:text-emerald-600 transition-colors">Tentang Kami</a>
                        <a href="/syarat-ketentuan" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</a>
                        <a href="/kebijakan-privasi" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
