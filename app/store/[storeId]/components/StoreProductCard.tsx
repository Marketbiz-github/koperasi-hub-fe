"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Share2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface Product {
    id: number | string;
    name: string;
    sku?: string;
    price: string | number;
    status?: string;
    badge?: string;
    image?: string;
    category?: string;
    images?: { image_url: string; is_primary: boolean }[] | null;
    product_category?: { name: string } | null;
}

export default function StoreProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((s) => s.addItem);
    const params = useParams();
    const storeId = params.storeId;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const primaryImage = product.images?.find(img => img.is_primary)?.image_url
            || product.images?.[0]?.image_url
            || product.image
            || "/images/placeholder.png";
        addItem({
            id: product.id.toString(),
            name: product.name,
            price: typeof product.price === 'string' ? Number(product.price.replace(/\D/g, '')) : Number(product.price),
            image: primaryImage,
            category: product.product_category?.name || product.category || "Uncategorized",
            quantity: 1,
        });
        toast.success(`${product.name} ditambahkan ke keranjang`);
    };

    const formatCurrency = (amount: string | number) => {
        const numericAmount = typeof amount === 'string' ? Number(amount.replace(/\D/g, '')) : Number(amount);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const primaryImage = product.images?.find(img => img.is_primary)?.image_url
        || product.images?.[0]?.image_url
        || product.image
        || "/images/placeholder.png";

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-slate-100">
            <Link href={`/store/${storeId}/product/${product.id}`} className="flex-1">
                <div className="relative cursor-pointer overflow-hidden aspect-square">
                    <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {(product.status === 'promo' || product.badge) && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 shadow-sm">
                            {product.badge || 'PROMO'}
                        </span>
                    )}
                </div>

                <div className="p-5">
                    <p className="text-[10px] text-[var(--store-primary,#10b981)] font-bold uppercase tracking-widest mb-2">
                        {product.product_category?.name || product.category || "Uncategorized"}
                    </p>
                    <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 min-h-[40px] text-sm md:text-base group-hover:text-[var(--store-primary,#10b981)] transition-colors leading-snug">
                        {product.name}
                    </h3>
                    <p className="text-[var(--store-primary,#10b981)] font-black text-lg">
                        {formatCurrency(product.price)}
                    </p>
                </div>
            </Link>

            <div className="flex gap-2 p-5 pt-0">
                <button
                    onClick={handleAdd}
                    className="flex-1 bg-[var(--store-primary,#10b981)] hover:opacity-90 text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-lg shadow-[var(--store-primary-soft)]"
                >
                    <ShoppingCart size={16} />
                    <span>Beli Sekarang</span>
                </button>

                <button
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[var(--store-primary,#10b981)] hover:border-[var(--store-primary-soft)] transition-all duration-300"
                    aria-label="Share"
                >
                    <Share2 size={18} />
                </button>
            </div>
        </div>
    );
}
