'use client';

import React from 'react';
import Image from 'next/image';
import { Star, MapPin, Phone, Mail, Globe, Facebook, Instagram, Twitter, Share2, ShoppingBag } from 'lucide-react';
import CarouselBanner from '@/components/carousel-banner';
import Header from '../../marketplace/components/Header';
import Footer from '../../marketplace/components/Footer';
import ProductCard from '../../marketplace/components/ProductCard';
import Link from 'next/link';

export default function StorePage({
    params,
    }: {
    params: Promise<{ storeId: string }>
    }) {
    const { storeId } = React.use(params);

  // Mock Store Data
  const store = {
    id: storeId,
    name: 'Toko Beras Premium',
    image: '/images/products/beras.png',
    banner: '/images/banners/suka2.webp',
    description: 'Toko terpercaya menjual beras berkualitas tinggi dari berbagai daerah di Indonesia. Semua produk dijamin asli dan segar.',
    rating: 4.8,
    reviews: 2453,
    followers: 5230,
    productSold: 12450,
    address: 'Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta',
    phone: '+62 812-3456-7890',
    email: 'info@tokoberasprremium.com',
    website: 'www.tokoberasprremium.com',
    social: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
    },
    verified: true,
  };

  // Mock Featured Products
  const featuredProducts = Array(3).fill(null).map((_, index) => ({
    id: `featured-${index + 1}`,
    name: 'Beras Premium Jakarta',
    category: 'Beras Pilihan',
    price: 'Rp 150.000',
    badge: 'Best',
    image: '/images/products/beras.png',
    rating: 4.8,
    reviews: 234,
    sold: 1250,
    owner: store,
  }));

  // Mock Flash Sale Products
  const flashSaleProducts = Array(4).fill(null).map((_, index) => ({
    id: `flash-${index + 1}`,
    name: 'Beras Flash Sale',
    category: 'Beras',
    price: 'Rp 85.000',
    badge: '-40%',
    image: '/images/products/beras.png',
    rating: 4.7,
    reviews: 145,
    sold: 890,
    owner: store,
  }));

  // All Products
  const allProducts = Array(12).fill(null).map((_, index) => ({
    id: `product-${index + 1}`,
    name: 'Beras Berkualitas',
    category: 'Beras',
    price: 'Rp 120.000',
    image: '/images/products/beras.png',
    rating: 4.8,
    reviews: 567,
    sold: 2340,
    owner: store,
  }));

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex flex-col">
      <Header />


      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto w-full px-4 py-12">
            {/* Banner Carousel */}
            <div className="w-full mb-12">
                <CarouselBanner
                images={[store.banner, store.banner, store.banner]}
                autoPlay={true}
                interval={5000}
                height="h-56 md:h-80"
                />
            </div>

          {/* Premium Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
              {/* Store Avatar */}
              <div className="md:col-span-1 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-linear-to-r from-[#10b981] to-[#2F5755] rounded-full blur-lg opacity-30"></div>
                  <Image
                    src={store.image}
                    alt={store.name}
                    width={140}
                    height={140}
                    className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg relative z-10"
                  />
                </div>
                {store.verified && (
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                    <span className="text-blue-500">✓</span> Terverifikasi
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="md:col-span-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{store.name}</h1>
                <p className="text-gray-600 leading-relaxed mb-6">{store.description}</p>
                
                <div className="flex flex-wrap gap-3">
                  <button className="border-2 border-gray-300 text-gray-600 hover:border-gray-400 px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2">
                    <Share2 size={18} />
                    Bagikan
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={20} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold text-gray-900">{store.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{store.reviews.toLocaleString('id-ID')} Ulasan</p>
                  </div>

                  <div className="bg-linear-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                    <p className="text-2xl font-bold text-green-600 mb-1">{(store.followers / 1000).toFixed(1)}K</p>
                    <p className="text-sm text-gray-600 font-medium">Pengikut</p>
                  </div>

                  <div className="bg-linear-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={18} className="text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{(store.productSold / 1000).toFixed(1)}K</p>
                        <p className="text-sm text-gray-600 font-medium">Terjual</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600 mb-1">✓</p>
                    <p className="text-sm text-gray-600 font-medium">Aktif</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          

          {/* Featured Products */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">✨ Produk Unggulan</h2>
                <p className="text-gray-600">Koleksi pilihan terbaik dari toko kami</p>
              </div>
              <Link href="#" className="text-[#10b981] hover:text-[#0a8659] font-semibold flex items-center gap-2 text-lg">
                Lihat Semua
                <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Flash Sale */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-linear-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg">
                ⚡ FLASH SALE
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Penawaran Terbatas</h2>
              <span className="ml-auto text-sm text-gray-500">Stok terbatas!</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* All Products */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">📦 Semua Produk</h2>
              <p className="text-gray-600">Jelajahi koleksi lengkap produk kami</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition font-medium">
                ← Sebelumnya
              </button>
              <button className="px-4 py-2 rounded-lg bg-linear-to-r from-[#10b981] to-[#2F5755] text-white font-semibold shadow-md hover:shadow-lg transition">
                1
              </button>
              <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition font-medium">
                2
              </button>
              <span className="px-2 text-gray-400">...</span>
              <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition font-medium">
                4
              </button>
              <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition font-medium">
                Selanjutnya →
              </button>
            </div>
          </div>

          {/* Store Description */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12 border border-gray-100 mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-[#10b981] to-[#2F5755] rounded-lg flex items-center justify-center">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Informasi Toko</h3>
                </div>

                <div className="space-y-4">
                  {store.address && (
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-linear-to-r hover:from-blue-50 hover:to-transparent transition">
                      <MapPin size={20} className="text-[#10b981] shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Alamat</p>
                        <span className="text-gray-700">{store.address}</span>
                      </div>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-linear-to-r hover:from-green-50 hover:to-transparent transition">
                      <Phone size={20} className="text-[#10b981] shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Telepon</p>
                        <a href={`tel:${store.phone}`} className="text-gray-700 hover:text-[#10b981] transition">
                          {store.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-linear-to-r hover:from-orange-50 hover:to-transparent transition">
                      <Mail size={20} className="text-[#10b981] shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Email</p>
                        <a href={`mailto:${store.email}`} className="text-gray-700 hover:text-[#10b981] transition">
                          {store.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {store.website && (
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-linear-to-r hover:from-purple-50 hover:to-transparent transition">
                      <Globe size={20} className="text-[#10b981] shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Website</p>
                        <a href={`https://${store.website}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#10b981] transition">
                          {store.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-[#10b981] to-[#2F5755] rounded-lg flex items-center justify-center">
                    <Share2 size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Ikuti Kami</h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {store.social.facebook && (
                    <a
                      href={store.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-3 p-6 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-all hover:scale-105"
                    >
                      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition shadow-md">
                        <Facebook size={24} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">Facebook</span>
                    </a>
                  )}
                  {store.social.instagram && (
                    <a
                      href={store.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-3 p-6 bg-linear-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl hover:shadow-lg transition-all hover:scale-105"
                    >
                      <div className="w-12 h-12 rounded-lg bg-pink-600 flex items-center justify-center group-hover:bg-pink-700 transition shadow-md">
                        <Instagram size={24} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">Instagram</span>
                    </a>
                  )}
                  {store.social.twitter && (
                    <a
                      href={store.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-3 p-6 bg-linear-to-br from-sky-50 to-sky-100 border-2 border-sky-200 rounded-xl hover:shadow-lg transition-all hover:scale-105"
                    >
                      <div className="w-12 h-12 rounded-lg bg-sky-500 flex items-center justify-center group-hover:bg-sky-600 transition shadow-md">
                        <Twitter size={24} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">Twitter</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
