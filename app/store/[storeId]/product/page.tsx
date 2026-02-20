'use client';

import React from 'react';
import { Loader2, Package, LayoutGrid, List } from 'lucide-react';
import { storeService, productService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';
import StoreHeader from '../components/StoreHeader';
import StoreFooter from '../components/StoreFooter';
import StoreProductCard from '../components/StoreProductCard';
import StoreFilter from '../components/StoreFilter';

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

    // States for filtering (Reusing Marketplace logic)
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
    const [searchQuery, setSearchQuery] = React.useState<string>('');

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await getPublicAccessToken();

            // Fetch Store Info
            const storeRes = await storeService.lookup(token || '', storeId);
            if (storeRes.data) {
                setStore(storeRes.data);

                // Fetch Products restricted to this store
                const prodParams: any = {
                    store_id: storeRes.data.id,
                    limit: 20,
                    target_customer: 'customer',
                    status: 'active'
                };

                if (selectedCategory !== 'all') {
                    prodParams.category_id = selectedCategory;
                }

                const prodRes = await productService.getProducts(prodParams, token || '');
                setProducts(prodRes.data?.data || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [storeId, selectedCategory]);

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
                                    setSelectedCategory={setSelectedCategory}
                                />
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="flex-1 px-4">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 mb-1">Semua Produk</h1>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{products.length} Produk ditemukan</p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-[var(--store-primary)]" />
                                    <p className="text-slate-400 font-bold text-sm">Menyaring koleksi terbaik...</p>
                                </div>
                            ) : products.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {products.map((product) => (
                                        <StoreProductCard key={product.id} product={product} />
                                    ))}
                                </div>
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
        </div>
    );
}
