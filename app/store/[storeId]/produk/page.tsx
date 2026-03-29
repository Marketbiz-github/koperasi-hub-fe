'use client';

import React from 'react';
import { Loader2, Package } from 'lucide-react';
import { storeService, productService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';
import StoreHeader from '../components/StoreHeader';
import StoreFooter from '../components/StoreFooter';
import StoreProductCard from '../components/StoreProductCard';
import StoreFilter from '../components/StoreFilter';
import { useSearchParams } from 'next/navigation';
import InfiniteScrollTrigger from '@/components/ui/InfiniteScrollTrigger';
import ScrollToTop from '@/components/ui/ScrollToTop';

type PageProps = {
    params: Promise<{
        storeId: string;
    }>;
};

export default function StoreProductsListPage({ params }: PageProps) {
    const { storeId } = React.use(params);
    const [store, setStore] = React.useState<any>(null);
    const [products, setProducts] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isFetchingMore, setIsFetchingMore] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const limit = 12;
    const searchParams = useSearchParams();

    // States for filtering (Reusing Marketplace logic)
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
    const [searchQuery, setSearchQuery] = React.useState<string>(searchParams.get('search') || '');

    React.useEffect(() => {
        const query = searchParams.get('search') || '';
        if (query !== searchQuery) {
            setSearchQuery(query);
            setCurrentPage(1);
        }
    }, [searchParams]);

    const fetchData = React.useCallback(async () => {
        if (currentPage === 1) {
            setIsLoading(true);
        } else {
            setIsFetchingMore(true);
        }
        try {
            const token = await getPublicAccessToken();

            // Fetch Store Info
            const storeRes = await storeService.lookup(token || '', storeId);
            if (storeRes.data) {
                setStore(storeRes.data);

                // Fetch Products restricted to this store
                const prodParams: any = {
                    store_id: Number(storeRes.data.id),
                    page: currentPage,
                    limit: limit,
                    target_customer: 'customer',
                    status: 'active'
                };

                if (selectedCategory !== 'all') {
                    prodParams.category_id = Number(selectedCategory);
                }

                if (searchQuery) {
                    prodParams.name = searchQuery;
                }

                const hasFilters = searchQuery !== '' || selectedCategory !== 'all';
                const prodRes = hasFilters
                    ? await productService.searchProducts(prodParams, token || '')
                    : await productService.getProducts(prodParams, token || '');
                
                const fetchedProducts = prodRes.data?.data || (Array.isArray(prodRes.data) ? prodRes.data : []);
                setProducts(prev => currentPage === 1 ? fetchedProducts : [...prev, ...fetchedProducts]);
                setTotalPages(Math.ceil((prodRes.data.meta?.total || 0) / limit));
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [storeId, selectedCategory, searchQuery, currentPage]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading && !store) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
            </div>
        );
    }

    if (!store) return null;

    return (
        <div
            className="min-h-screen bg-white flex flex-col font-sans"
            style={{
                '--store-primary': store.color || '#10b981',
                '--store-primary-soft': `${store.color || '#10b981'}15`
            } as React.CSSProperties}
        >
            <StoreHeader store={store} />

            <main className="flex-1 bg-slate-50/30">
                <div className="max-w-7xl mx-auto w-full px-4 py-12">
                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Sidebar Filter - Restricted to store context */}
                        <div className="md:w-64 shrink-0">
                            <div className="sticky top-24">
                                <StoreFilter
                                    selectedCategory={selectedCategory}
                                    setSelectedCategory={(cat) => {
                                        setSelectedCategory(cat);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="flex-1 px-4">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 mb-1">
                                        {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Semua Produk'}
                                    </h1>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{products.length} Produk ditemukan</p>
                                </div>
                            </div>

                            {isLoading && currentPage === 1 ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-[var(--store-primary)]" />
                                    <p className="text-slate-400 font-bold text-sm">Menyaring koleksi terbaik...</p>
                                </div>
                            ) : products.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {products.map((product) => (
                                            <StoreProductCard key={product.id} product={product} />
                                        ))}
                                    </div>

                                    <InfiniteScrollTrigger
                                        onIntersect={() => setCurrentPage(prev => prev + 1)}
                                        isLoading={isFetchingMore}
                                        hasMore={currentPage < totalPages}
                                        loadingText="Memuat lebih banyak produk..."
                                    />
                                </>
                            ) : (
                                <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                                    <div className="bg-slate-50 p-6 rounded-full mb-6">
                                        <Package className="text-slate-200 w-16 h-16" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">Tidak ada produk ditemukan</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">
                                        Coba ubah kriteria filter Anda atau kembali lagi nanti.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <StoreFooter store={store} />
            <ScrollToTop />
        </div>
    );
}
