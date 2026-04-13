'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Share2, ShoppingCart, ArrowLeft, Loader2, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { productService, storeService, productVariantService, inventoryService, affiliationService, affiliatorService, userService } from '@/services/apiService';
import { getPublicAccessToken } from '@/utils/auth';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/StoreFooter';
import LoginShareCommission from '@/app/marketplace/components/LoginShareCommission';

type PageProps = {
    params: Promise<{
        storeId: string;
        slug: string;
    }>;
};

export default function StoreProductDetailPage({ params }: PageProps) {
    const { storeId, slug } = React.use(params);
    const addItem = useCartStore((s) => s.addItem);
    const [product, setProduct] = React.useState<any>(null);
    const [store, setStore] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [variants, setVariants] = React.useState<any[]>([]);
    const [selectedVariant, setSelectedVariant] = React.useState<any>(null);
    const [totalStock, setTotalStock] = React.useState<number | null>(null);
    const [selectedImage, setSelectedImage] = React.useState<string>("");
    const [quantity, setQuantity] = React.useState(1);
    const [isSharing, setIsSharing] = React.useState(false);
    const [showShareModal, setShowShareModal] = React.useState(false);

    const handleShareSuccess = (shareUrl: string) => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link share telah disalin ke clipboard');
    };

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await getPublicAccessToken();
            let productData = null;

            // 1. Try fetch by slug first (Standard for this route)
            const prodRes = await productService.getProductDetailBySlug(slug, token || '');
            if (prodRes.data) {
                const searchList = prodRes.data.data || (Array.isArray(prodRes.data) ? prodRes.data : []);
                productData = searchList.find((p: any) => p.slug === slug || String(p.id) === String(slug)) || searchList[0];
            }

            // 2. Fallback to numeric ID fetch if slug-based resolution failed and it looks like an ID
            if (!productData && /^\d+$/.test(slug)) {
                try {
                    const idRes = await productService.getProductDetail(slug, token || '');
                    if (idRes.data) productData = idRes.data;
                } catch (e) { }
            }

            if (productData) {
                setProduct(productData);
                setSelectedImage(productData.images?.find((img: any) => img.is_primary)?.image_url || productData.images?.[0]?.image_url || '/images/placeholder.png');
                
                const productId = productData.id;

                // Fetch Stock and Variants
                try {
                    const vRes = await productVariantService.getList(token || "", productId);
                    if (vRes.data && vRes.data.length > 0) {
                        setVariants(vRes.data);
                        const sumStock = vRes.data.reduce((acc: number, curr: any) => acc + (curr.total_stock || 0), 0);
                        setTotalStock(sumStock);
                    } else {
                        const sRes = await inventoryService.getStockByProduct(token || "", productId);
                        if (Array.isArray(sRes.data)) {
                            setTotalStock(sRes.data.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0));
                        } else {
                            setTotalStock(typeof sRes.data === 'number' ? sRes.data : (sRes.data?.total_stock ?? 0));
                        }
                    }
                } catch (stockErr) {
                    console.error('Error fetching stock:', stockErr);
                }
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
    }, [slug, storeId]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddToCart = () => {
        if (!product) return;

        if (variants.length > 0 && !selectedVariant) {
            toast.error("Silakan pilih varian terlebih dahulu");
            return;
        }

        addItem({
            id: product.id.toString(),
            name: product.name,
            price: selectedVariant ? Number(selectedVariant.price) : Number(product.price),
            image: selectedVariant?.image || selectedImage,
            category: product.product_category?.name || 'Produk',
            quantity: quantity,
            storeId: store?.id,
            variantId: selectedVariant?.id || 0,
            variantName: selectedVariant?.option_values?.map((ov: any) => ov.value).join(' - ')
        });
        toast.success(`${product.name}${selectedVariant ? ` (${selectedVariant.option_values?.map((ov: any) => ov.value).join(' - ')})` : ''} ditambahkan ke keranjang`);
    };

    const handleShareClick = async () => {
        const affiliateToken = localStorage.getItem('affiliate_token');
        const affiliateUserStr = localStorage.getItem('affiliate_user');

        if (!affiliateToken || !affiliateUserStr) {
            setShowShareModal(true);
            return;
        }

        setIsSharing(true);
        try {
            const affiliateUser = JSON.parse(affiliateUserStr);
            let vendorId = store?.user_id;
            let pType = 'affiliator_koperasi';

            const role = store?.user?.role || store?.user?.roles?.[0]?.name;
            if (role === 'koperasi') pType = 'affiliator_koperasi';
            else if (role === 'reseller') pType = 'affiliator_reseller';

            if (vendorId) {
                const childId = affiliateUser.user_id || affiliateUser.user?.id || affiliateUser.id;
                const affRes = await userService.checkAffiliation(affiliateToken, vendorId, childId);
                if (affRes.data && !affRes.data.is_affiliated) {
                    await affiliationService.create(affiliateToken, { parent_id: vendorId, type: pType });
                }
            }

            const parentShareCode = localStorage.getItem('last_share_code') || undefined;
            const shareRes = await affiliatorService.generateShareLink(product.id, affiliateToken, parentShareCode);

            if (shareRes.data) {
                localStorage.setItem('shared_product_id', shareRes.data.id.toString());
                localStorage.setItem('share_code', shareRes.data.share_code);
            }

            // Generate final url
            const finalSlug = product.slug || product.id.toString();
            let finalSubdomain = store?.subdomain || 'www';
            let finalDomain = store?.domain || '';

            const baseAppDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || window.location.host.split('.').slice(-2).join('.');
            const shareUrl = finalDomain
                ? `https://${finalDomain}/produk/${finalSlug}?sh=${shareRes.data.share_code}&source=copy`
                : `https://${finalSubdomain}.${baseAppDomain}/produk/${finalSlug}?sh=${shareRes.data.share_code}&source=copy`;

            await affiliatorService.trackShare(shareRes.data.share_code, 'copy');
            handleShareSuccess(shareUrl);
        } catch (err) {
            console.error(err);
            toast.error('Gagal membuat link referal, silakan coba lagi');
            setShowShareModal(true);
        } finally {
            setIsSharing(false);
        }
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
                <Link href="/" className="text-emerald-600 font-bold hover:underline">Kembali ke Toko</Link>
            </div>
        );
    }

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
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[var(--store-primary)] transition-colors mb-8 font-bold text-sm">
                        <ArrowLeft size={18} />
                        Kembali ke Beranda Toko
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-xl shadow-slate-100/50">
                                <Image
                                    src={selectedImage}
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

                            {/* Image Gallery */}
                            <div className="grid grid-cols-4 gap-4">
                                {product.images?.map((img: any, i: number) => (
                                    <div key={i} className={`aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === img.image_url ? 'border-[var(--store-primary)]' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                                        onClick={() => setSelectedImage(img.image_url)}>
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
                                    <span className="text-sm font-bold text-slate-400">{(product.total_sold || 0).toLocaleString('id-ID')} Terjual</span>
                                </div>

                                <div className="text-4xl font-black text-[var(--store-primary)] tracking-tight mb-6">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(selectedVariant ? selectedVariant.price : product.price))}
                                </div>

                                <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 mb-6">
                                    <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Deskripsi Produk</h3>
                                    <div className="text-slate-500 leading-relaxed font-medium text-sm md:text-base prose prose-sm max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: product.long_description || product.short_description || product.description || 'Tidak ada deskripsi tersedia untuk produk ini.' }} />
                                    </div>
                                </div>

                                {variants.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Pilih Varian:</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {variants.map((v: any) => {
                                                const variantLabel = v.option_values?.map((ov: any) => ov.value).join(' - ') || `Varian ${v.id}`;
                                                const isSelected = selectedVariant?.id === v.id;
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => {
                                                            setSelectedVariant(isSelected ? null : v);
                                                            if (v.image) setSelectedImage(v.image);
                                                        }}
                                                        disabled={v.total_stock === 0}
                                                        className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-semibold flex items-center gap-2 ${isSelected
                                                            ? "border-[var(--store-primary)] bg-[var(--store-primary-soft)] text-[var(--store-primary)] shadow-sm"
                                                            : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                                                            } ${v.total_stock === 0 ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                                                    >
                                                        {variantLabel}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
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
                                        <span className="text-slate-400 text-sm font-bold">Stok: <span className="text-slate-900">{(selectedVariant ? selectedVariant.total_stock : totalStock) ?? 0}</span></span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className="bg-[var(--store-primary)] hover:opacity-90 text-white text-sm font-black py-3 px-8 rounded-2xl shadow-xl shadow-[var(--store-primary-soft)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <ShoppingCart size={22} />
                                        Tambah ke Keranjang
                                    </button>
                                    <button
                                        onClick={handleShareClick}
                                        disabled={isSharing}
                                        className="w-16 h-16 rounded-2xl border-2 border-[var(--store-primary)] text-[var(--store-primary)] flex items-center justify-center hover:bg-[var(--store-primary-soft)] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSharing ? <Loader2 size={24} className="animate-spin" /> : <Share2 size={24} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <StoreFooter store={store} />

            <LoginShareCommission
                open={showShareModal}
                onOpenChange={setShowShareModal}
                productId={product?.id?.toString() || ''}
                productSlug={product?.slug}
                storeSubdomain={store?.subdomain}
                storeDomain={store?.domain}
                onLoginSuccess={handleShareSuccess}
            />
        </div>
    );
}
