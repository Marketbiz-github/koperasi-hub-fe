'use client';
import Image from 'next/image';

type Product = {
  name: string;
  category: string;
  price: string;
  badge?: string;
  image: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
      <div className="relative">
        {product.badge && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{product.badge}</span>}
        <Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
        <p className="text-[#10b981] font-bold text-lg mb-3">{product.price}</p>
        <button className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-2 rounded-lg transition">Ajukan Pembelian</button>
      </div>
    </div>
  );
}