'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, MapPin, Phone, Globe, Share2 } from 'lucide-react';

interface StoreFooterProps {
    store: any;
}

export default function StoreFooter({ store }: StoreFooterProps) {
    return (
        <footer className="bg-slate-50 border-t border-slate-100 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Brand Info */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                                {store.logo ? (
                                    <Image src={store.logo} alt={store.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 font-bold">
                                        {store.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{store.name}</h3>
                                <p className="text-[10px] font-bold text-[var(--store-primary,#10b981)] uppercase tracking-widest">Official Store</p>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm font-medium">
                            {store.description || `Platform resmi ${store.name} untuk belanja produk berkualitas.`}
                        </p>
                        <div className="flex items-center gap-3">
                            {store.instagram && (
                                <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-pink-600 hover:border-pink-100 hover:bg-pink-50 transition-all">
                                    <Instagram size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin size={18} className="text-[var(--store-primary,#10b981)]" />
                                Alamat Toko
                            </h4>
                            <div className="text-slate-500 text-sm font-medium space-y-1">
                                <p>{store.alamat || 'Alamat belum tersedia'}</p>
                                {store.city && <p>{store.city}, {store.province}</p>}
                                {store.zipcode && <p>{store.zipcode}</p>}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Phone size={18} className="text-[var(--store-primary,#10b981)]" />
                                Kontak Bantuan
                            </h4>
                            <div className="space-y-4">
                                {store.phone ? (
                                    <a href={`tel:${store.phone}`} className="block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Telepon</p>
                                        <p className="text-slate-700 font-bold hover:text-[var(--store-primary,#10b981)] transition-colors">{store.phone}</p>
                                    </a>
                                ) : (
                                    <p className="text-slate-400 text-sm italic">Nomor telepon belum tersedia</p>
                                )}

                                {store.domain && (
                                    <a href={`https://${store.domain}`} target="_blank" rel="noopener noreferrer" className="block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Situs Resmi</p>
                                        <p className="text-slate-700 font-bold hover:text-[var(--store-primary,#10b981)] transition-colors flex items-center gap-1">
                                            {store.domain} <Globe size={14} className="text-slate-300" />
                                        </p>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} {store.name}. Seluruh Hak Cipta Dilindungi.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">Powered by</span>
                        <div className="relative w-20 h-5">
                            <Image src="/images/koperasihub-dark.png" alt="KoperasiHub" fill className="object-contain" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
