'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, Menu, Store as StoreIcon, Info } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useMounted } from '@/hooks/useMounted';
import { useRouter, useSearchParams } from 'next/navigation';

interface StoreHeaderProps {
    store: any;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
    const mounted = useMounted();
    const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = React.useState(searchParams.get('search') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/produk?search=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo & Name */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            {store.logo ? (
                                <Image
                                    src={store.logo}
                                    alt={store.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <StoreIcon className="w-6 h-6 text-slate-300" />
                            )}
                        </Link>
                        <div className="hidden sm:block">
                            <Link href="/">
                                <span className="block text-sm font-extrabold text-slate-900 leading-none mb-1 hover:text-[var(--store-primary,#10b981)] transition-colors">{store.name}</span>
                            </Link>
                            <div className="flex items-center gap-2">
                                <span className="block text-[10px] font-bold text-[var(--store-primary,#10b981)] uppercase tracking-[0.15em]">Official Store</span>
                                <span className="text-slate-200 text-xs mt-0.5">•</span>
                                <Link 
                                    href={`/store/${store.id}/profil`} 
                                    className="text-[10px] font-bold text-slate-400 hover:text-[var(--store-primary,#10b981)] uppercase tracking-widest transition-all flex items-center gap-1 group/profile"
                                >
                                    <span className="group-hover/profile:translate-x-0.5 transition-transform">Profil Koperasi</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Search - Themed */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearch} className="relative w-full group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Cari di ${store.name}...`}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#10b981)] focus:bg-white transition-all text-sm font-medium"
                            />
                            <button type="submit" className="absolute left-3 top-2.5">
                                <Search className="text-slate-400 w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                            <Search className="w-5 h-5" />
                        </button>

                        <Link href="/marketplace/cart" className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group">
                            <ShoppingCart className="w-6 h-6 group-hover:text-[var(--store-primary,#10b981)] transition-colors" />
                            {mounted && itemCount > 0 && (
                                <span className="absolute top-1 right-1 bg-[var(--store-primary,#10b981)] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {store.phone && (
                            <a
                                href={`https://wa.me/${store.phone.startsWith('0') ? '62' + store.phone.substring(1) : store.phone.startsWith('62') ? store.phone : '62' + store.phone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center gap-2 bg-[var(--store-primary,#10b981)] hover:opacity-90 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                            >
                                Hubungi Kami
                            </a>
                        )}

                        <button className="md:hidden p-2 text-slate-600">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
