'use client';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
    id: string | number;
    name: string;
    category: string;
    price: string;
    badge?: string;
    image: string;
    product_variants?: any[] | null;
    variants?: any[] | null;
};

export default function VendorProductCard({ product }: { product: Product }) {
    const hasVariants = (product.product_variants && product.product_variants.length > 0) ||
        (product.variants && product.variants.length > 0);

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group flex flex-col h-full">
            <Link href={`/marketplace/${product.id}`} className="flex-1">
                <div className="relative">
                    {product.badge && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">{product.badge}</span>}
                    <Image src={product.image || "/images/placeholder.png"} alt={product.name} width={400} height={400} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4 flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-[#10b981] font-bold text-lg mb-3">{product.price}</p>
                </div>
            </Link>
            <div className="p-4 pt-0">
                <Link href={`/marketplace/${product.id}`} className="block">
                    <button className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-2 rounded-lg transition">
                        {hasVariants ? "Lihat Detail" : "Ajukan Pembelian"}
                    </button>
                </Link>
            </div>
        </div>
    );
}
