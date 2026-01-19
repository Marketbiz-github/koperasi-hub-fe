'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Share2, ShoppingCart, ArrowLeft, StoreIcon } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import Header from '../components/Header';
import Footer from '../components/Footer';

type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default function ProductDetailPage({ params }: PageProps) {
  const { productId } = React.use(params);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = React.useState(1);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  // Mock Product Data
  const product = {
    id: productId,
    name: 'Beras Premium Jakarta',
    category: 'Beras Pilihan',
    price: 'Rp 100.000',
    badge: 'Best',
    image: '/images/products/beras.png',
    description: 'Beras premium berkualitas tinggi dari hasil panen terbaik di daerah Jakarta. Dengan proses penggilingan modern dan quality control yang ketat, beras ini menjamin kualitas terbaik. Cocok untuk kebutuhan sehari-hari dengan tekstur pulen, wangi, dan rasa yang lezat.',
    rating: 4.8,
    reviews: 234,
    sold: 1250,
    owner: {
      id: 'toko-beras-premium',
      name: 'Toko Beras Premium',
      image: '/images/products/beras.png',
      rating: 4.8,
      reviews: 2453,
      verified: true,
      address: 'Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta',
      phone: '+62 812-3456-7890',
    },
  };

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
  };

  // Mock related products
  const relatedProducts = Array(4).fill({
    id: 'related-1',
    name: 'Beras Premium',
    category: 'Beras',
    price: 'Rp 95.000',
    image: '/images/products/beras.png',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          {/* Back Button */}
          <Link href="/marketplace-koperasi" className="inline-flex items-center gap-2 text-[#2F5755] hover:text-[#10b981] mb-6">
            <ArrowLeft size={20} />
            Kembali ke Marketplace
          </Link>

          {/* Product Detail */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded z-10">
                      {product.badge}
                    </span>
                  )}
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-96 md:h-[500px] object-cover rounded-lg bg-gray-100"
                  />
                </div>

                {/* Wishlist & Share */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition font-medium ${
                      isWishlisted
                        ? 'bg-red-50 border-red-300 text-red-600'
                        : 'border-gray-300 text-gray-600 hover:border-red-300'
                    }`}
                  >
                    <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                    {isWishlisted ? 'Tersimpan' : 'Simpan'}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition font-medium">
                    <Share2 size={20} />
                    Bagikan
                  </button>
                  
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col gap-6">
                {/* Product Name & Price */}
                <div>
                  <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">{product.category}</p>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 font-medium">
                      {product.rating} ({product.reviews} ulasan)
                    </span>
                    <span className="text-gray-600 ml-auto">
                      {product.sold.toLocaleString('id-ID')} terjual
                    </span>
                  </div>

                  <p className="text-4xl font-bold text-[#10b981] mb-2">{product.price}</p>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 pt-4">
                  <span className="text-gray-600 font-medium">Jumlah:</span>
                  <div className="flex items-center border rounded-lg border-gray-300">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition font-medium"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-x border-gray-300 outline-none py-3 font-medium"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-fit gradient-green text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  <ShoppingCart size={24} />
                  Tambah ke Keranjang
                </button>

              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Produk Serupa dari Penjual Ini</h2>
              <Link
                href={`/store/${product.owner.id}`}
                className="w-fit bg-[#2F5755] hover:bg-[#244746] text-white py-3 px-6 rounded-lg text-center font-medium transition flex items-center gap-2"
              >
                <StoreIcon size={16} />
                Kunjungi Toko
              </Link>      
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product, index) => (
                <Link
                  key={index}
                  href={`/marketplace-koperasi/${product.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-[#10b981] font-bold text-lg">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Review Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Ulasan Produk ({product.reviews})</h2>

            {/* Add Review Form */}
            <div className="mb-8 pb-8 border-b">
              <h3 className="font-bold text-lg mb-4">Berikan Ulasan Anda</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className="text-4xl hover:scale-110 transition"
                      >
                        ☆
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ulasan</label>
                  <textarea
                    placeholder="Bagikan pengalaman Anda dengan produk ini..."
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#10b981] outline-none"
                    rows={4}
                  />
                </div>

                <button className="bg-[#2F5755] hover:bg-[#244746] text-white px-6 py-2 rounded-lg font-medium transition">
                  Kirim Ulasan
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="pb-6 border-b last:border-b-0">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/images/products/beras.png"
                      alt="User"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">Budi Santoso</h4>
                        <span className="text-xs text-gray-500">2 hari lalu</span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      <p className="text-gray-600">
                        Produk sangat bagus dan sesuai dengan deskripsi. Pengiriman cepat dan barang sampai dengan aman. Recommended!
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
