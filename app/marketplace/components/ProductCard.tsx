"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Share2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import LoginShareCommission from './LoginShareCommission';
import ShareCommission from './ShareCommission';

type Product = {
  id?: string;
  name: string;
  category: string;
  price: string;
  badge?: string;
  image: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleAdd = () => {
    const numeric = parseInt((product.price || '').replace(/\D/g, '')) || 0;
    addItem({
      id: product.name,
      name: product.name,
      price: numeric,
      image: product.image,
      category: product.category,
      quantity: 1,
    });
  };

  const handleShareClick = () => {
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
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group flex flex-col h-full">
      <Link href={`/marketplace/${product.id || product.name}`} className="flex-1">
        <div className="relative cursor-pointer">
          {product.badge && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              {product.badge}
            </span>
          )}

          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.category}</p>
          <p className="text-[#10b981] font-bold text-lg">{product.price}</p>
        </div>
      </Link>

        {/* ACTION BUTTON */}
        <div className="flex gap-2 p-4">
          {/* Tambah Keranjang */}
          <button onClick={handleAdd} className="flex-1 gradient-green text-white font-semibold px-4 py-2 rounded-lg transition">
            Tambah Keranjang
          </button>

          {/* Share */}
          <button
            onClick={handleShareClick}
            className="w-11 h-11 flex items-center justify-center rounded-lg border border-[#2F5755] text-[#2F5755] hover:bg-[#2F5755] hover:text-white transition"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
          
          {/* Login Dialog */}
          <LoginShareCommission 
            open={isLoginOpen} 
            onOpenChange={setIsLoginOpen}
            onLoginSuccess={handleLoginSuccess}
          />

          {/* Share Dialog */}
          <ShareCommission 
            open={isShareOpen} 
            onOpenChange={setIsShareOpen}
            productName={product.name}
          />
        </div>

      </div>
  );    
}
