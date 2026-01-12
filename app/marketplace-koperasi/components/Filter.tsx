'use client';
import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

type FilterKey =
  | 'kategori'
  | 'vendor'
  | 'lokasi'
  | 'ketersediaanStok'
  | 'urutan'
  | 'pilihan'
  | 'sertifikasi';

export default function Filter() {
  const [openFilters, setOpenFilters] = useState<Record<FilterKey, boolean>>({
    kategori: true,
    vendor: true,
    lokasi: true,
    ketersediaanStok: true,
    urutan: true,
    pilihan: true,
    sertifikasi: true
  });

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
          <button onClick={() => toggleFilter('kategori')} className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3 hover:text-[#10b981] transition">
            <span className="flex items-center gap-2"><ListFilter className="w-4 h-4" />Kategori</span>
            {openFilters.kategori ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openFilters.kategori && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Fashion</span></label>
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Food drinks</span></label>
            </div>
          )}
        </div>

        {/* Vendor */}
        <div className="mb-6">
          <button onClick={() => toggleFilter('vendor')} className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3 hover:text-[#10b981] transition">
            <span className="flex items-center gap-2"><Store className="w-4 h-4" />Vendor</span>
            {openFilters.vendor ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openFilters.vendor && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Wings</span></label>
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Unilever</span></label>
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Bulog</span></label>
            </div>
          )}
        </div>

        {/* Lokasi */}
        <div className="mb-6">
          <button onClick={() => toggleFilter('lokasi')} className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3 hover:text-[#10b981] transition">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />Lokasi</span>
            {openFilters.lokasi ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openFilters.lokasi && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Jakarta</span></label>
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Bali</span></label>
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Lombok</span></label>
            </div>
          )}
        </div>

        {/* Ketersediaan Stok, Urutan, Pilihan, Sertifikasi */}
        <div className="mb-6">
          <button onClick={() => toggleFilter('ketersediaanStok')} className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3 hover:text-[#10b981] transition">
            <span className="flex items-center gap-2"><PackageCheck className="w-4 h-4" />Ketersediaan Stok</span>
            {openFilters.ketersediaanStok ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openFilters.ketersediaanStok && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="radio" name="stock" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Pre Order</span></label>
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="radio" name="stock" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Ready Stock</span></label>
            </div>
          )}
        </div>

        <div className="mb-6">
          <button onClick={() => toggleFilter('urutan')} className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3 hover:text-[#10b981] transition">
            <span className="flex items-center gap-2"><ArrowUpDown className="w-4 h-4" />Urutan</span>
            {openFilters.urutan ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openFilters.urutan && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="radio" name="order" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Terbaru</span></label>
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="radio" name="order" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Harga terendah</span></label>
            </div>
          )}
        </div>

        <div className="mb-6">
          <button onClick={() => toggleFilter('pilihan')} className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3 hover:text-[#10b981] transition">
            <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Pilihan</span>
            {openFilters.pilihan ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openFilters.pilihan && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Populer</span></label>
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Promo</span></label>
            </div>
          )}
        </div>

        <div>
          <button onClick={() => toggleFilter('sertifikasi')} className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3 hover:text-[#10b981] transition">
            <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4" />Sertifikasi</span>
            {openFilters.sertifikasi ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openFilters.sertifikasi && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Halal</span></label>
              <label className="flex items-center cursor-pointer hover:text-[#10b981] transition group"><input type="checkbox" className="mr-2 accent-[#10b981] w-4 h-4" /><span className="text-gray-700 text-sm group-hover:text-[#10b981]">Non Halal</span></label>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}