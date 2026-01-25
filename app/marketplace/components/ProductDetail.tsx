"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Share2, ShoppingCart, MessageCircle, MapPin, Phone } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  badge?: string;
  image: string;
  description?: string;
  rating?: number;
  reviews?: number;
  sold?: number;
  owner: {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    verified: boolean;
    address?: string;
    phone?: string;
  };
};

type ProductDetailProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
};

export default function ProductDetail({
  open,
  onOpenChange,
  product,
}: ProductDetailProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = React.useState(1);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const handleAddToCart = () => {
    const numeric = parseInt((product.price || '').replace(/\D/g, '')) || 0;
    addItem({
      id: product.id,
      name: product.name,
      price: numeric,
      image: product.image,
      category: product.category,
      quantity: quantity,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Produk</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          {/* Product Image */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              {product.badge && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                  {product.badge}
                </span>
              )}
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Wishlist & Share */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition ${
                  isWishlisted
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'border-gray-300 text-gray-600 hover:border-red-300'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                {isWishlisted ? 'Tersimpan' : 'Simpan'}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400">
                <Share2 size={18} />
                Bagikan
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Product Name & Price */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} ulasan)
                </span>
                {product.sold && (
                  <span className="text-sm text-gray-600 ml-2">
                    {product.sold} terjual
                  </span>
                )}
              </div>

              <p className="text-3xl font-bold text-[#10b981] mb-4">{product.price}</p>

              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {product.description}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Jumlah:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center border-x outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full gradient-green text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <ShoppingCart size={20} />
              Tambah ke Keranjang
            </button>

            {/* Divider */}
            <div className="border-t pt-6">
              {/* Store Info */}
              <h3 className="font-bold text-lg mb-4">Penjual</h3>
              <div className="flex items-start gap-4">
                <Image
                  src={product.owner.image}
                  alt={product.owner.name}
                  width={60}
                  height={60}
                  className="w-16 h-16 rounded-full object-cover"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-gray-900">{product.owner.name}</p>
                    {product.owner.verified && (
                      <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                        ✓ Terverifikasi
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-600">{product.owner.rating} ({product.owner.reviews} ulasan)</span>
                    </div>
                  </div>

                  {product.owner.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      <span>{product.owner.address}</span>
                    </div>
                  )}

                  {product.owner.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Phone size={14} />
                      <span>{product.owner.phone}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3">
                    <Link
                      href={`/store/${product.owner.id}`}
                      className="flex-1 bg-[#2F5755] hover:bg-[#244746] text-white py-2 rounded-lg text-center text-sm font-medium transition"
                    >
                      Kunjungi Toko
                    </Link>
                    <button className="flex-1 border border-[#2F5755] text-[#2F5755] hover:bg-[#2F5755] hover:text-white py-2 rounded-lg flex items-center justify-center gap-2 transition">
                      <MessageCircle size={16} />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
