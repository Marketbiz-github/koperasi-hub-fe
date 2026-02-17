"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Share2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import LoginShareCommission from './LoginShareCommission';
import ShareCommission from './ShareCommission';
import { toast } from 'sonner';

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

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

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

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoggedIn) {
      setIsShareOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginOpen(false);
    setIsShareOpen(true);
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
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-gray-100">
      <Link href={`/marketplace/${product.id}`} className="flex-1">
        <div className="relative cursor-pointer overflow-hidden aspect-square md:aspect-auto md:h-56">
          <Image
            src={primaryImage}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {(product.status === 'promo' || product.badge) && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">
              {product.badge || 'PROMO'}
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">
            {product.product_category?.name || product.category || "Uncategorized"}
          </p>
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 min-h-[40px] text-sm md:text-base group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-emerald-600 font-extrabold text-lg">
            {formatCurrency(product.price)}
          </p>
        </div>
      </Link>

      {/* ACTION BUTTON */}
      <div className="flex gap-2 p-4 pt-0">
        <button
          onClick={handleAdd}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
        >
          <ShoppingCart size={16} />
          <span>Beli</span>
        </button>

        <button
          onClick={handleShareClick}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-600 transition-all duration-300 shadow-sm"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>

        <LoginShareCommission
          open={isLoginOpen}
          onOpenChange={setIsLoginOpen}
          onLoginSuccess={handleLoginSuccess}
        />

        <ShareCommission
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          productName={product.name}
        />
      </div>
    </div>
  );
}
