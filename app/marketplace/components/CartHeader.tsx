'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function CartHeader() {
    return (
        <header className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/marketplace">
                        <div className="relative w-32 md:w-40 h-10">
                            <Image
                                src="/images/koperasihub-dark2.png"
                                alt="KoperasiHub Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                    <div className="hidden md:flex items-center gap-2 text-gray-400">
                        <div className="h-6 w-px bg-gray-200" />
                        <span className="text-lg font-medium text-gray-600">Checkout</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        href="/marketplace"
                        className="text-gray-500 hover:text-emerald-600 transition-colors text-sm flex items-center gap-1 font-medium"
                    >
                        <ChevronLeft size={16} />
                        Kembali Belanja
                    </Link>
                </div>
            </div>
        </header>
    );
}
