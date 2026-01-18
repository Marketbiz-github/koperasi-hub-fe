'use client';

import Image from 'next/image';
import { Minus, Plus, Trash } from 'lucide-react';
import { useCartStore, CartItem as CI } from '@/store/cartStore';

export default function CartItem({ item }: { item: CI }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden shrink-0">
        {item.image ? (
          <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{item.name}</h4>
            <p className="text-sm text-gray-500">{item.category}</p>
          </div>
          <div className="text-[#10b981] font-bold">Rp {item.price.toLocaleString('id-ID')}</div>
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
