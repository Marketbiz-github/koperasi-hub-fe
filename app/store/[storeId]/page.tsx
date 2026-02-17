'use client';

import React from 'react';
import Image from 'next/image';
import { Star, MapPin, Phone, Mail, Globe, Facebook, Instagram, Twitter, Share2, ShoppingBag, Loader2, Store as StoreIcon, Package } from 'lucide-react';
import CarouselBanner from '@/components/carousel-banner';
import Header from '../../marketplace/components/Header';
import Footer from '../../marketplace/components/Footer';
import ProductCard from '../../marketplace/components/ProductCard';
import Link from 'next/link';
import { storeService, productService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';

export default function StorePage({
  params,
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = React.use(params);
  const [store, setStore] = React.useState<any>(null);
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getPublicAccessToken();

      // Fetch Store Detail
      // Assuming there's a getStoreDetail or similar. If not, use getStores with search/filter
      // For now, let's look if apiService has getStoreDetail. It doesn't seem to have id-based detail.
      // storeService has getStoreByUserId.
      // Let's assume storeId here is actually the store id or we search by it.
      const res = await storeService.getStores(token || '', { search: storeId, limit: 1 });
      const storeData = res.data?.data?.[0] || res.data?.[0]; // Handle different response formats

      if (storeData) {
        setStore(storeData);

        // Fetch Products for this store
        const prodRes = await productService.getProducts({
          store_id: storeData.id,
          limit: 12,
          target_customer: 'customer'
        }, token || '');
        setProducts(prodRes.data?.data || []);
      }
    } catch (err) {
      console.error('Error fetching store data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <StoreIcon className="w-16 h-16 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-500">Toko tidak ditemukan</h1>
          <Link href="/marketplace" className="text-emerald-600 font-semibold">Kembali ke Marketplace</Link>
        </div>
        <Footer />
      </div>
    );
  }

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
                      <span className="text-2xl font-bold text-gray-900">{store.rating || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{(store.reviews || 0).toLocaleString('id-ID')} Ulasan</p>
                  </div>

                  <div className="bg-linear-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                    <p className="text-2xl font-bold text-green-600 mb-1">{((store.followers || 0) / 1000).toFixed(1)}K</p>
                    <p className="text-sm text-gray-600 font-medium">Pengikut</p>
                  </div>

                  <div className="bg-linear-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={18} className="text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{((store.productSold || 0) / 1000).toFixed(1)}K</p>
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



          {/* All Products */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">📦 Produk {store.name}</h2>
              <p className="text-gray-600">Jelajahi koleksi lengkap produk dari toko ini</p>
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-center gap-4 border border-gray-100 mb-12">
                <Package className="w-16 h-16 text-gray-200" />
                <h3 className="text-xl font-bold text-gray-500">Belum ada produk</h3>
                <p className="text-gray-400">Toko ini belum memiliki produk aktif saat ini.</p>
              </div>
            )}

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
                  {store.phone_number && (
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-linear-to-r hover:from-green-50 hover:to-transparent transition">
                      <Phone size={20} className="text-[#10b981] shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Telepon</p>
                        <a href={`tel:${store.phone_number}`} className="text-gray-700 hover:text-[#10b981] transition">
                          {store.phone_number}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Since real store might not have social in current schema, we can fallback or hide */}
                  <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-sm text-gray-400 italic">Informasi sosial media belum tersedia</p>
                  </div>
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
