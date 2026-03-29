"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Share2, ShoppingCart, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import LoginShareCommission from '@/app/marketplace/components/LoginShareCommission';
import ShareCommission from '@/app/marketplace/components/ShareCommission';

interface Product {
    id: number | string;
    name: string;
    sku?: string;
    price: string | number;
    status?: string;
    badge?: string;
    image?: string;
    category?: string;
    images?: { image_url: string; is_primary: boolean }[] | null;
    product_category?: { name: string } | null;
    product_variants?: any[] | null;
    variants?: any[] | null;
    slug?: string;
    store?: {
        id: number | string;
        subdomain: string;
        domain?: string | null;
        user_id?: number | string;
    };
}

export default function StoreProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((s) => s.addItem);
    const params = useParams();
    const router = useRouter(); // Use useRouter for consistency if possible, or window.location
    const storeId = params.storeId;

    const [isLoginOpen, setIsLoginOpen] = React.useState(false);
    const [isShareOpen, setIsShareOpen] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isValidatingShare, setIsValidatingShare] = React.useState(false);
    const [shareUrl, setShareUrl] = React.useState('');
    const [subdomain, setSubdomain] = React.useState<string>(product.store?.subdomain || (product as any).store_subdomain || '');
    const [customDomain, setCustomDomain] = React.useState<string>(product.store?.domain || (product as any).store_domain || '');
    const [vendorId, setVendorId] = React.useState<string | number>(product.store?.user_id || (product as any).user_id || '');
    const [pType, setPType] = React.useState('affiliator_koperasi');

    React.useEffect(() => {
        const fetchStoreInfo = async () => {
            if (!subdomain || !customDomain || !vendorId) {
                const sId = (product as any).store_id || product.store?.id || storeId;
                if (sId) {
                    try {
                        const { storeService } = await import('@/services/apiService');
                        const { getPublicAccessToken } = await import('@/utils/auth');
                        const token = await getPublicAccessToken();
                        const res = await storeService.getDetail(token || '', sId);
                        if (res.data) {
                            if (res.data.subdomain) setSubdomain(res.data.subdomain);
                            if (res.data.domain) setCustomDomain(res.data.domain);
                            if (res.data.user_id) setVendorId(res.data.user_id);
                            const role = res.data.user?.role || res.data.user?.roles?.[0]?.name;
                            if (role === 'koperasi') setPType('affiliator_koperasi');
                            else if (role === 'reseller') setPType('affiliator_reseller');
                        }
                    } catch (err) {
                        console.error('Failed to fetch store info:', err);
                    }
                }
            }
        };
        fetchStoreInfo();
    }, [product, subdomain, customDomain, storeId, vendorId]);

    const hasVariants = (product.product_variants && product.product_variants.length > 0) ||
        (product.variants && product.variants.length > 0);

    const productSlug = product.slug || product.id.toString();
    const storeProductLink = `/store/${storeId}/produk/${productSlug}`;

    const baseAppDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || window.location.host.split('.').slice(-2).join('.');
    const internalProductLink = customDomain
        ? `https://${customDomain}/produk/${productSlug}`
        : `https://${subdomain || 'www'}.${baseAppDomain}/produk/${productSlug}`;

    const handleShareClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const affiliateToken = localStorage.getItem('affiliate_token');
        const affiliateUserStr = localStorage.getItem('affiliate_user');

        if (affiliateToken && affiliateUserStr) {
            setIsValidatingShare(true);
            try {
                const { affiliatorService, affiliationService, userService } = await import('@/services/apiService');
                const affiliateUser = JSON.parse(affiliateUserStr);
                
                if (vendorId) {
                    const childId = affiliateUser.user_id || affiliateUser.user?.id || affiliateUser.id;
                    const affRes = await userService.checkAffiliation(affiliateToken, vendorId, childId);
                    if (affRes.data && !affRes.data.is_affiliated) {
                        await affiliationService.create(affiliateToken, { parent_id: Number(vendorId), type: pType });
                    }
                }

                const parentShareCode = localStorage.getItem('last_share_code') || undefined;
                const res = await affiliatorService.generateShareLink(product.id, affiliateToken, parentShareCode);

                if (res.data) {
                    localStorage.setItem('shared_product_id', res.data.id.toString());
                    localStorage.setItem('share_code', res.data.share_code);
                }

                const generatedUrl = `${internalProductLink}?sh=${res.data.share_code}`;
                setShareUrl(generatedUrl);
                
                // Copy to clipboard silently like in marketplace detail
                navigator.clipboard.writeText(generatedUrl);
                toast.success('Link share telah disalin ke clipboard');
            } catch (err) {
                console.error(err);
                toast.error('Gagal membuat link referal');
                setIsLoginOpen(true);
            } finally {
                setIsValidatingShare(false);
            }
        } else {
            setIsLoginOpen(true);
        }
    };

    const handleLoginSuccess = (generatedUrl: string) => {
        setIsLoggedIn(true);
        setIsLoginOpen(false);
        setShareUrl(generatedUrl);
        navigator.clipboard.writeText(generatedUrl);
        toast.success('Link share telah disalin ke clipboard');
    };

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (hasVariants) {
            window.location.href = storeProductLink;
            return;
        }

        const primaryImage = product.images?.find(img => img.is_primary)?.image_url
            || product.images?.[0]?.image_url
            || product.image
            || "/images/placeholder.png";
        addItem({
            id: product.id.toString(),
            name: product.name,
            price: typeof product.price === 'string' ? Number(product.price.replace(/\D/g, '')) : Number(product.price),
            image: primaryImage,
            category: product.product_category?.name || product.category || "Uncategorized",
            quantity: 1,
        });
        toast.success(`${product.name} ditambahkan ke keranjang`);
    };

    const formatCurrency = (amount: string | number) => {
        const numericAmount = typeof amount === 'string' ? Number(amount.replace(/\D/g, '')) : Number(amount);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const primaryImage = product.images?.find(img => img.is_primary)?.image_url
        || product.images?.[0]?.image_url
        || product.image
        || "/images/placeholder.png";

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-slate-100">
            <Link href={storeProductLink} className="flex-1">
                <div className="relative cursor-pointer overflow-hidden aspect-square">
                    <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {(product.status === 'promo' || product.badge) && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 shadow-sm">
                            {product.badge || 'PROMO'}
                        </span>
                    )}
                </div>

                <div className="p-5">
                    <p className="text-[10px] text-[var(--store-primary,#10b981)] font-bold uppercase tracking-widest mb-2">
                        {product.product_category?.name || product.category || "Uncategorized"}
                    </p>
                    <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 min-h-[40px] text-sm md:text-base group-hover:text-[var(--store-primary,#10b981)] transition-colors leading-snug">
                        {product.name}
                    </h3>
                    <p className="text-[var(--store-primary,#10b981)] font-black text-lg">
                        {formatCurrency(product.price)}
                    </p>
                </div>
            </Link>

            <div className="flex gap-2 p-5 pt-0">
                <button
                    onClick={handleAdd}
                    className="flex-1 bg-[var(--store-primary,#10b981)] hover:opacity-90 text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-lg shadow-[var(--store-primary-soft)]"
                >
                    {hasVariants ? (
                        <span>Lihat Detail</span>
                    ) : (
                        <>
                            <ShoppingCart size={16} />
                            <span>Beli Sekarang</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleShareClick}
                    disabled={isValidatingShare}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[var(--store-primary,#10b981)] hover:border-[var(--store-primary-soft)] transition-all duration-300 disabled:opacity-50"
                    aria-label="Share"
                >
                    {isValidatingShare ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                </button>
            </div>

            <LoginShareCommission
                open={isLoginOpen}
                onOpenChange={setIsLoginOpen}
                onLoginSuccess={handleLoginSuccess}
                productId={product.id.toString()}
                productSlug={productSlug}
                storeSubdomain={subdomain}
                storeDomain={customDomain}
            />

            <ShareCommission
                open={isShareOpen}
                onOpenChange={setIsShareOpen}
                productName={product.name}
                shareUrl={shareUrl}
            />
        </div>
    );
}
