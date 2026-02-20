'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ShoppingBag, Loader2, Store as StoreIcon, Package, Share2 } from 'lucide-react';
import CarouselBanner from '@/components/carousel-banner';
import ProductCard from '../../marketplace/components/ProductCard';
import Link from 'next/link';
import { storeService, productService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';
import StoreHeader from './components/StoreHeader';
import StoreFooter from './components/StoreFooter';
import StoreProductCard from './components/StoreProductCard';

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

      // Fetch Store Detail using lookup
      const res = await storeService.lookup(token || '', storeId);
      const storeData = res.data;

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
      <div className="min-h-screen bg-white flex flex-col">
        <div className="h-20 border-b border-slate-100 animate-pulse" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <StoreIcon className="w-16 h-16 text-slate-200" />
          <h1 className="text-2xl font-bold text-slate-500 tracking-tight">Toko tidak ditemukan</h1>
          <Link href="/marketplace" className="text-emerald-600 font-bold hover:underline">Kembali ke Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white flex flex-col font-sans"
      style={{
        '--store-primary': store.color || '#10b981',
        '--store-primary-soft': `${store.color || '#10b981'}15` // 15% opacity
      } as React.CSSProperties}
    >
      <StoreHeader store={store} />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto w-full px-4 py-8 md:py-12">
          {/* Banner Carousel */}
          <div className="w-full mb-12">
            <CarouselBanner
              images={[store.cover, store.cover, store.cover].filter(Boolean) as string[]}
              autoPlay={true}
              interval={5000}
              height="h-48 md:h-72"
            />
          </div>

          {/* Minimalist Profile Section */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Store Avatar & Basic Info */}
              <div className="md:col-span-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white shadow-xl shadow-slate-200/50 relative z-10 overflow-hidden bg-slate-50 flex items-center justify-center">
                    {store.logo ? (
                      <Image
                        src={store.logo}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 128px, 160px"
                      />
                    ) : (
                      <StoreIcon className="w-16 h-16 text-slate-200" />
                    )}
                  </div>
                </div>

                <div className="text-center md:text-left flex-1 py-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{store.name}</h1>
                    {store.verified && (
                      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-emerald-600/10">
                        <span className="text-emerald-500">✓</span> Verifikasi
                      </div>
                    )}
                  </div>

                  <p className="text-slate-500 leading-relaxed max-w-2xl text-sm md:text-base mb-6 font-medium">
                    {store.description || 'Selamat datang di official store kami. Kami menyediakan berbagai macam produk berkualitas untuk Anda.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    {store.phone && (
                      <a
                        href={`https://wa.me/${store.phone.startsWith('0') ? '62' + store.phone.substring(1) : store.phone.startsWith('62') ? store.phone : '62' + store.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[var(--store-primary,#10b981)] hover:opacity-90 text-white text-sm px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-[var(--store-primary-soft)] flex items-center gap-2"
                      >
                        Hubungi Kami
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: store.name,
                            text: store.description,
                            url: window.location.href,
                          });
                        }
                      }}
                      className="bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50 text-sm px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                      <Share2 size={18} />
                      Bagikan
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats & Brief Grid */}
              <div className="md:col-span-4 grid grid-cols-2 gap-3 w-full">
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-[2rem] flex flex-col justify-center group hover:bg-[var(--store-primary-soft)] transition-colors">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star size={18} className="fill-amber-400 text-amber-400" />
                    <span className="text-lg md:text-xl font-bold text-slate-900">{store.rating || 0}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penilaian Toko</p>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-[2rem] flex flex-col justify-center group hover:bg-[var(--store-primary-soft)] transition-colors">
                  <p className="text-lg md:text-xl font-bold text-slate-900 mb-1">{products.length || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Produk</p>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-[2rem] flex flex-col justify-center group hover:bg-[var(--store-primary-soft)] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag size={18} className="text-[var(--store-primary,#10b981)]" />
                    <span className="text-lg md:text-xl font-bold text-slate-900">{(store.sold_count || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Barang Terjual</p>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-[2rem] flex flex-col justify-center group hover:bg-[var(--store-primary-soft)] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-lg md:text-xl font-bold text-slate-900">Online</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Toko</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 mb-16" />

          {/* Products Section */}
          <div className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
                  Katalog Produk
                </h2>
                <div className="h-1.5 w-20 bg-[var(--store-primary,#10b981)] rounded-full mb-3" />
                <p className="text-slate-500 font-medium italic">Temukan koleksi produk pilihan terbaik khusus untuk Anda.</p>
              </div>
              <Link
                href={`/store/${storeId}/product`}
                className="text-[var(--store-primary,#10b981)] font-bold hover:underline flex items-center gap-2 group"
              >
                Lihat Semua Produk
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {products.map((product) => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center gap-5 border-2 border-dashed border-slate-100">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Package className="w-12 h-12 text-slate-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-2">Belum ada produk</h3>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto">Toko ini sedang memperbarui katalog mereka. Silakan kembali lagi nanti.</p>
                </div>
              </div>
            )}

            {/* Premium Pagination */}
            {products.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-16">
                <button className="w-12 h-12 rounded-2xl bg-[var(--store-primary,#10b981)] text-white font-extrabold shadow-lg shadow-[var(--store-primary-soft)] transition-transform active:scale-95">1</button>
                <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-colors hover:text-slate-900">2</button>
                <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-colors hover:text-slate-900">3</button>
                <div className="w-12 h-12 flex items-center justify-center text-slate-300">...</div>
                <button className="px-6 h-12 rounded-2xl bg-white border border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                  Lanjut →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
