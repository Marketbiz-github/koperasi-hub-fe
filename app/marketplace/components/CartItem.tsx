'use client';

import Image from 'next/image';
import { Minus, Plus, Trash } from 'lucide-react';
import { useCartStore, CartItem as CI } from '@/store/cartStore';

export default function CartItem({
  item,
  details,
  variantDetail
}: {
  item: CI;
  details?: any;
  variantDetail?: any;
}) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleSelectItem = useCartStore((s) => s.toggleSelectItem);
  const selectedItems = useCartStore((s) => s.selectedItems);

  const name = details?.name || item.name || 'Produk';
  const price = variantDetail ? Number(variantDetail.price) : (details?.discount_price ? Number(details.discount_price) : (details?.price ? Number(details.price) : (item.price || 0)));
  const category = details?.product_category?.name || details?.category || item.category || 'Kategori';
  const variantName = variantDetail?.option_values?.map((ov: any) => ov.value).join(' - ') || item.variantName;

  const primaryImage = variantDetail?.image || details?.images?.find((img: any) => img.is_primary)?.image_url || details?.images?.[0]?.image_url || item.image || '/images/placeholder.png';
  const isSelected = selectedItems.has(item.id);

  return (
    <div className={`flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm transition-opacity ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelectItem(item.id)}
          className="h-4 w-4 rounded border-gray-300 text-[#10b981] focus:ring-[#10b981] cursor-pointer"
        />
      </div>

      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden shrink-0 border">
        <Image src={primaryImage} alt={name} width={80} height={80} className="object-cover w-full h-full" />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 line-clamp-1">{name}</h4>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{category}</p>
            {variantName && (
              <p className="text-xs text-emerald-600 font-medium mt-1 bg-emerald-50 px-2 py-0.5 rounded-full w-fit border border-emerald-100 italic">
                Varian: {variantName}
              </p>
            )}
          </div>
          <div className="text-[#10b981] font-bold">Rp {price.toLocaleString('id-ID')}</div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              aria-label="kurangi"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              <Minus size={16} />
            </button>

            <div className="px-3">{item.quantity}</div>

            <button
              aria-label="tambah"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            className="text-red-600 hover:text-white hover:bg-red-600 px-3 py-1 rounded flex items-center gap-2"
          >
            <Trash size={14} /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
