'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    ListFilter,
    SlidersHorizontal,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { productCategoryService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';

interface StoreFilterProps {
    selectedCategory: string;
    setSelectedCategory: (id: string) => void;
    storeId?: string | number;
}

export default function StoreFilter({ selectedCategory, setSelectedCategory, storeId: propStoreId }: StoreFilterProps) {
    const params = useParams();
    const storeIdFromParams = params.storeId;
    const finalStoreId = propStoreId || storeIdFromParams;

    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [isLoadingCats, setIsLoadingCats] = useState(true);

    const fetchFilterData = useCallback(async () => {
        try {
            const activeToken = await getPublicAccessToken();

            // Fetch Categories - filter by finalStoreId
            const catRes = await productCategoryService.getList(activeToken || '', { store_id: finalStoreId as string });
            const catList = catRes.data?.data || catRes.data || [];
            setCategories(Array.isArray(catList) ? catList : []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setIsLoadingCats(false);
        }
    }, [finalStoreId]);

    useEffect(() => {
        fetchFilterData();
    }, [fetchFilterData]);

    return (
        <aside className="w-full">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 sticky top-24 shadow-sm">
                <div className="flex items-center gap-3 mb-8 pb-5 border-b border-slate-50">
                    <SlidersHorizontal className="w-5 h-5 text-slate-900" />
                    <h2 className="text-lg font-black text-slate-900">Filter Produk</h2>
                </div>

                {/* Kategori */}
                <div className="mb-8">
                    <label className="flex items-center gap-2 font-bold text-slate-900 mb-4 text-sm">
                        <ListFilter className="w-4 h-4 text-[var(--store-primary,#10b981)]" />
                        Kategori
                    </label>
                    <div className="relative">
                        {isLoadingCats ? (
                            <div className="flex items-center gap-2 text-slate-400 py-3 px-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs font-bold uppercase tracking-widest">Loading...</span>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === 'all'
                                        ? 'bg-[var(--store-primary-soft)] text-[var(--store-primary)]'
                                        : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    Semua Produk
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id.toString())}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.id.toString()
                                            ? 'bg-[var(--store-primary-soft)] text-[var(--store-primary)]'
                                            : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </aside>
    );
}
