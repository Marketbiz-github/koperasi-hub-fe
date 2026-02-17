'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Filter from './components/Filter';
import ProductCard from './components/ProductCard';
import BannerCarousel from './components/BannerCarousel';
import { productService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';
import { Loader2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: string | number;
  status: string;
  images?: { image_url: string; is_primary: boolean }[] | null;
  product_category?: { name: string } | null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getPublicAccessToken();
      const params: any = {
        page: currentPage,
        limit: limit,
        target_customer: 'customer',
        status: 'active'
      };

      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory;
      }

      if (selectedVendor !== 'all') {
        params.store_id = selectedVendor;
      }

      const res = await productService.getProducts(params, token || undefined);
      if (res.data) {
        setProducts(res.data.data || []);
        setTotalPages(Math.ceil((res.data.meta?.total || 0) / limit));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat produk');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategory, selectedVendor]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto w-full grow flex flex-col">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Main Content */}
        <main className="grow pb-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <Filter
                selectedCategory={selectedCategory}
                setSelectedCategory={(id) => {
                  setSelectedCategory(id);
                  setCurrentPage(1);
                }}
                selectedVendor={selectedVendor}
                setSelectedVendor={(id) => {
                  setSelectedVendor(id);
                  setCurrentPage(1);
                }}
              />

              <div className="grow">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
                    <p className="text-gray-500 font-medium">Memuat koleksi produk terbaik...</p>
                  </div>
                ) : products.length > 0 ? (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-8 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={currentPage === 1}
                          onClick={() => {
                            setCurrentPage(prev => prev - 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="rounded-xl border-gray-200 hover:border-emerald-500 hover:text-emerald-500"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>

                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = currentPage;
                            if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;

                            if (pageNum <= 0 || pageNum > totalPages) return null;

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                className={currentPage === pageNum
                                  ? "bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                                  : "rounded-xl border-gray-200 hover:border-emerald-500 text-gray-600"}
                                onClick={() => {
                                  setCurrentPage(pageNum);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          disabled={currentPage === totalPages}
                          onClick={() => {
                            setCurrentPage(prev => prev + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="rounded-xl border-gray-200 hover:border-emerald-500 hover:text-emerald-500"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-32 text-center bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-6">
                      <Package className="text-gray-300 w-16 h-16" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Maaf, saat ini belum ada produk yang tersedia. Silakan kembali lagi nanti.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
