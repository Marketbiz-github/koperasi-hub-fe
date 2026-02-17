'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  ListFilter,
  Store,
  MapPin,
  PackageCheck,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingCart,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { productService, storeService, productCategoryService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';

type FilterKey =
  | 'kategori'
  | 'vendor'
  | 'lokasi'
  | 'ketersediaanStok'
  | 'urutan'
  | 'pilihan'
  | 'sertifikasi';

interface FilterProps {
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  selectedVendor: string;
  setSelectedVendor: (id: string) => void;
}

export default function Filter({ selectedCategory, setSelectedCategory, selectedVendor, setSelectedVendor }: FilterProps) {
  const [openFilters, setOpenFilters] = useState<Record<FilterKey, boolean>>({
    kategori: true,
    vendor: true,
    lokasi: false,
    ketersediaanStok: false,
    urutan: false,
    pilihan: false,
    sertifikasi: false
  });

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [vendors, setVendors] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);

  const fetchFilterData = useCallback(async () => {
    try {
      const activeToken = await getPublicAccessToken();

      // Fetch Categories
      const catRes = await productCategoryService.getList(activeToken || '');
      if (catRes.data) {
        const catList = Array.isArray(catRes.data) ? catRes.data : (catRes.data.data || []);
        setCategories(catList);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoadingCats(false);
    }

    try {
      const activeToken = await getPublicAccessToken();
      // Fetch Vendors
      const vendorRes = await storeService.getStores(activeToken || '', { limit: 100 });
      if (vendorRes.data) {
        const vendorList = Array.isArray(vendorRes.data) ? vendorRes.data : (vendorRes.data.data || []);
        setVendors(vendorList);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setIsLoadingVendors(false);
    }
  }, []);

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  const toggleFilter = (filterName: FilterKey) => {
    setOpenFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  return (
    <aside className="lg:w-64 shrink-0">
      <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
          <SlidersHorizontal className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Filter</h2>
        </div>

        {/* Kategori */}
        <div className="mb-6">
          <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
            <ListFilter className="w-4 h-4" />
            Kategori
          </label>
          <div className="relative">
            {isLoadingCats ? (
              <div className="flex items-center gap-2 text-gray-400 py-2 px-3 border rounded-lg bg-gray-50">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Memuat kategori...</span>
              </div>
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition appearance-none"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            {!isLoadingCats && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Toko */}
        <div className="mb-6">
          <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
            <Store className="w-4 h-4" />
            Toko
          </label>
          <div className="relative">
            {isLoadingVendors ? (
              <div className="flex items-center gap-2 text-gray-400 py-2 px-3 border rounded-lg bg-gray-50">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Memuat toko...</span>
              </div>
            ) : (
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition appearance-none"
              >
                <option value="all">Semua Toko</option>
                {vendors.map((toko) => (
                  <option key={toko.id} value={toko.id.toString()}>
                    {toko.name}
                  </option>
                ))}
              </select>
            )}
            {!isLoadingVendors && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Lokasi (Disabled for now as endpoint limited) */}
        <div className="mb-6 opacity-50 cursor-not-allowed">
          <div className="flex items-center justify-between w-full text-left font-semibold text-gray-400 mb-3">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />Lokasi</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Other filters can be enabled as API supports them */}
      </div>
    </aside>
  );
}
