'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Share2, ShoppingCart, ArrowLeft, Loader2, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { productService, storeService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';
import { toast } from 'sonner';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/StoreFooter';

type PageProps = {
    params: Promise<{
        storeId: string;
        productId: string;
    }>;
};

export default function StoreProductDetailPage({ params }: PageProps) {
    const { storeId, productId } = React.use(params);
    const addItem = useCartStore((s) => s.addItem);
    const [product, setProduct] = React.useState<any>(null);
    const [store, setStore] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [quantity, setQuantity] = React.useState(1);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await getPublicAccessToken();

            // Fetch Product Detail
            const prodRes = await productService.getProductDetail(productId, token || '');
            if (prodRes.data) {
                setProduct(prodRes.data);
            }

            // Fetch Store Detail for branding
            const storeRes = await storeService.lookup(token || '', storeId);
            if (storeRes.data) {
                setStore(storeRes.data);
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            toast.error('Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    }, [productId, storeId]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddToCart = () => {
        if (!product) return;
        const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url || '/images/placeholder.png';
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: primaryImage,
            category: product.product_category?.name || 'Produk',
            quantity: quantity,
        });
        toast.success('Berhasil ditambahkan ke keranjang');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
            </div>
        );
    }

    if (!product || !store) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Data tidak ditemukan</h2>
                <Link href={`/store/${storeId}`} className="text-emerald-600 font-bold hover:underline">Kembali ke Toko</Link>
            </div>
        );
    }

    const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url || '/images/placeholder.png';

    return (
        <div
            className="min-h-screen bg-white flex flex-col font-sans"
            style={{
                '--store-primary': store.color || '#10b981',
                '--store-primary-soft': `${store.color || '#10b981'}15`
            } as React.CSSProperties}
        >
            <StoreHeader store={store} />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto w-full px-4 py-8 md:py-12">
                    {/* Breadcrumb / Back */}
                    <Link href={`/store/${storeId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-[var(--store-primary)] transition-colors mb-8 font-bold text-sm">
                        <ArrowLeft size={18} />
                        Kembali ke Beranda Toko
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-xl shadow-slate-100/50">
                                <Image
                                    src={primaryImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {product.status === 'promo' && (
                                    <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-lg">
                                        PROMO HARGA
                                    </div>
                                )}
                            </div>

                            {/* Image Gallery Placeholder (Optional) */}
                            <div className="grid grid-cols-4 gap-4">
                                {product.images?.map((img: any, i: number) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer hover:border-[var(--store-primary)] transition-colors">
                                        <Image src={img.image_url} alt={`${product.name} ${i}`} width={100} height={100} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <div className="mb-8">
                                <p className="text-[10px] font-black text-[var(--store-primary)] uppercase tracking-[0.2em] mb-3">
                                    {product.product_category?.name || 'Produk Unggulan'}
                                </p>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">{product.name}</h1>

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                                            ))}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{product.rating || 0}</span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <span className="text-sm font-bold text-slate-400">{(product.sold_count || 0).toLocaleString('id-ID')} Terjual</span>
                                </div>

                                <div className="text-4xl font-black text-[var(--store-primary)] tracking-tight mb-6">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                                </div>

                                <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                    <h3 className="font-bold text-slate-900 mb-3">Deskripsi Produk</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base">
                                        {product.description || 'Tidak ada deskripsi tersedia untuk produk ini.'}
                                    </p>
                                </div>
                            </div>

                            {/* Purchase Actions */}
                            <div className="mt-auto space-y-6">
                                <div className="flex flex-col gap-4">
                                    <span className="text-sm font-bold text-slate-900">Tentukan Jumlah</span>
                                    <div className="flex items-center gap-5">
                                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-12 text-center bg-transparent font-black text-slate-900 outline-none"
                                            />
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <span className="text-slate-400 text-sm font-bold">Stok: <span className="text-slate-900">{product.total_stock ?? product.stock ?? 0}</span></span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-[var(--store-primary)] hover:opacity-90 text-white text-sm font-black py-3 rounded-xl shadow-xl shadow-[var(--store-primary-soft)] transition-all flex items-center justify-center gap-3"
                                    >
                                        <ShoppingCart size={22} />
                                        Tambah ke Keranjang
                                    </button>
                                    <button className="w-14 h-14 rounded-2xl border-2 border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                        <Share2 size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <StoreFooter store={store} />
        </div>
    );
}
